package com.games.wenzi.taoyuan;

import android.app.Activity;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.provider.DocumentsContract;
import android.provider.DocumentsContract.Document;

import androidx.activity.result.ActivityResult;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@CapacitorPlugin(name = "TaoyuanModImport")
public class TaoyuanModImportPlugin extends Plugin {

    private static final String IMPORT_ROOT_DIR = "mod-imports";
    private static final int BUFFER_SIZE = 64 * 1024;
    private static final int MAX_FILE_COUNT = 20_000;
    private static final long MAX_SINGLE_FILE_BYTES = 256L * 1024L * 1024L;
    private static final long MAX_TOTAL_BYTES = 1024L * 1024L * 1024L;
    private static final int MAX_PATH_UTF8_BYTES = 512;
    private static final int MAX_PATH_DEPTH = 32;
    private static final String RESPONSE_DELIVERY_CHANNEL = "android-native-response-event-sink";
    private static final String INVALID_RESPONSE_PACKAGE_ID = "invalid_package";
    private static final String INVALID_RESPONSE_MESSAGE_KEY = "mods.ui.ipc.result.invalid";
    private static final String[] DOCUMENT_COLUMNS = {
        Document.COLUMN_DOCUMENT_ID,
        Document.COLUMN_DISPLAY_NAME,
        Document.COLUMN_MIME_TYPE,
        Document.COLUMN_SIZE
    };

    private static class CopyStats {
        int fileCount = 0;
        long totalBytes = 0L;

        void beforeFile(long declaredSizeBytes) throws IOException {
            if (fileCount >= MAX_FILE_COUNT) {
                throw new IOException("import file count limit exceeded");
            }
            if (declaredSizeBytes > MAX_SINGLE_FILE_BYTES) {
                throw new IOException("import single file limit exceeded");
            }
        }

        void afterChunk(long fileBytes, long chunkBytes) throws IOException {
            if (fileBytes > MAX_SINGLE_FILE_BYTES) {
                throw new IOException("import single file limit exceeded");
            }
            totalBytes += chunkBytes;
            if (totalBytes > MAX_TOTAL_BYTES) {
                throw new IOException("import total byte limit exceeded");
            }
        }

        void afterFile() {
            fileCount += 1;
        }
    }

    @PluginMethod
    public void chooseAndCopyImport(PluginCall call) {
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE);
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        intent.addFlags(Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);
        intent.addFlags(Intent.FLAG_GRANT_PREFIX_URI_PERMISSION);
        startActivityForResult(call, intent, "handleChooseAndCopyImportResult");
    }

    @PluginMethod
    public void listImportedFiles(PluginCall call) {
        String importId = call.getString("importId");
        if (!isSafeImportId(importId)) {
            call.reject("Invalid importId");
            return;
        }

        try {
            File importRoot = resolveImportRoot(importId);
            if (!importRoot.isDirectory()) {
                call.reject("Import not found");
                return;
            }
            JSObject result = new JSObject();
            result.put("files", listImportedFiles(importRoot));
            call.resolve(result);
        } catch (IOException e) {
            call.reject("Import list failed");
        }
    }

    @PluginMethod
    public void readImportedText(PluginCall call) {
        String importId = call.getString("importId");
        String relativePath = call.getString("relativePath");
        if (!isSafeImportId(importId) || relativePath == null) {
            call.reject("Invalid import read request");
            return;
        }

        try {
            String normalizedPath = normalizeRelativePath(relativePath);
            File importRoot = resolveImportRoot(importId);
            File target = resolveInside(importRoot, normalizedPath);
            if (!target.isFile()) {
                call.reject("Import file not found");
                return;
            }
            if (target.length() > MAX_SINGLE_FILE_BYTES) {
                call.reject("Import file is too large");
                return;
            }
            JSObject result = new JSObject();
            result.put("text", readUtf8File(target));
            call.resolve(result);
        } catch (IOException e) {
            call.reject("Import read failed");
        }
    }

    @PluginMethod
    public void deleteImport(PluginCall call) {
        String importId = call.getString("importId");
        if (!isSafeImportId(importId)) {
            call.reject("Invalid importId");
            return;
        }

        File importRoot = new File(getImportBaseDirectory(), importId);
        if (!deleteRecursively(importRoot)) {
            call.reject("Import delete failed");
            return;
        }
        call.resolve();
    }

    @PluginMethod
    public void deliverThirdPartyDataPackResponse(PluginCall call) {
        JSObject envelope = call.getObject("envelope");
        call.resolve(acknowledgeResponseDeliveryEnvelope(envelope));
    }

    @ActivityCallback
    private void handleChooseAndCopyImportResult(PluginCall call, ActivityResult result) {
        if (call == null) return;
        if (result.getResultCode() == Activity.RESULT_CANCELED) {
            call.reject("Import canceled");
            return;
        }

        Intent data = result.getData();
        Uri treeUri = data == null ? null : data.getData();
        if (treeUri == null) {
            call.reject("Import source missing");
            return;
        }

        String importId = call.getString("importId", createGeneratedImportId());
        if (!isSafeImportId(importId)) {
            call.reject("Invalid importId");
            return;
        }

        File tempRoot = new File(getImportBaseDirectory(), ".tmp-" + importId + "-" + UUID.randomUUID());
        File finalRoot = new File(getImportBaseDirectory(), importId);
        try {
            getContext().getContentResolver().takePersistableUriPermission(
                treeUri,
                Intent.FLAG_GRANT_READ_URI_PERMISSION
            );
        } catch (SecurityException ignored) {
            // Some providers grant only transient access; the copied app-data result remains independent.
        }

        try {
            if (finalRoot.exists()) {
                throw new IOException("import already exists");
            }
            ensureDirectory(tempRoot);
            String rootDocumentId = DocumentsContract.getTreeDocumentId(treeUri);
            CopyStats stats = new CopyStats();
            copyDocumentChildren(treeUri, rootDocumentId, "", tempRoot, stats);
            if (!tempRoot.renameTo(finalRoot)) {
                throw new IOException("import replace failed");
            }

            JSObject response = new JSObject();
            response.put("importId", importId);
            response.put("files", listImportedFiles(finalRoot));
            call.resolve(response);
        } catch (Exception e) {
            deleteRecursively(tempRoot);
            call.reject("Import copy failed");
        }
    }

    private File getImportBaseDirectory() {
        return new File(getContext().getFilesDir(), IMPORT_ROOT_DIR);
    }

    private File resolveImportRoot(String importId) throws IOException {
        File root = resolveInside(getImportBaseDirectory(), importId);
        if (!root.getName().equals(importId)) {
            throw new IOException("invalid import root");
        }
        return root;
    }

    private void copyDocumentChildren(
        Uri treeUri,
        String parentDocumentId,
        String parentPath,
        File outputDirectory,
        CopyStats stats
    ) throws IOException {
        Uri childrenUri = DocumentsContract.buildChildDocumentsUriUsingTree(treeUri, parentDocumentId);
        try (Cursor cursor = getContext().getContentResolver().query(childrenUri, DOCUMENT_COLUMNS, null, null, null)) {
            if (cursor == null) {
                throw new IOException("import directory unreadable");
            }
            while (cursor.moveToNext()) {
                String documentId = cursor.getString(0);
                String name = safeDocumentName(cursor.getString(1));
                String mimeType = cursor.getString(2);
                long declaredSizeBytes = cursor.isNull(3) ? -1L : cursor.getLong(3);
                String relativePath = joinRelativePath(parentPath, name);
                validateRelativePath(relativePath);

                File output = resolveInside(outputDirectory, name);
                if (Document.MIME_TYPE_DIR.equals(mimeType)) {
                    ensureDirectory(output);
                    copyDocumentChildren(treeUri, documentId, relativePath, output, stats);
                } else {
                    copyDocumentFile(treeUri, documentId, declaredSizeBytes, output, stats);
                }
            }
        } catch (SecurityException | IllegalArgumentException e) {
            throw new IOException("import directory unreadable", e);
        }
    }

    private void copyDocumentFile(
        Uri treeUri,
        String documentId,
        long declaredSizeBytes,
        File output,
        CopyStats stats
    ) throws IOException {
        stats.beforeFile(declaredSizeBytes);
        Uri documentUri = DocumentsContract.buildDocumentUriUsingTree(treeUri, documentId);
        try (
            InputStream input = getContext().getContentResolver().openInputStream(documentUri);
            OutputStream target = new FileOutputStream(output)
        ) {
            if (input == null) {
                throw new IOException("import file unreadable");
            }
            byte[] buffer = new byte[BUFFER_SIZE];
            long fileBytes = 0L;
            int read;
            while ((read = input.read(buffer)) != -1) {
                fileBytes += read;
                stats.afterChunk(fileBytes, read);
                target.write(buffer, 0, read);
            }
            target.flush();
            stats.afterFile();
        } catch (SecurityException e) {
            throw new IOException("import file unreadable", e);
        }
    }

    private JSArray listImportedFiles(File importRoot) throws IOException {
        JSArray files = new JSArray();
        appendImportedFiles(importRoot, importRoot, files);
        return files;
    }

    private void appendImportedFiles(File importRoot, File current, JSArray files) throws IOException {
        File[] children = current.listFiles();
        if (children == null) return;
        for (File child : children) {
            if (child.isDirectory()) {
                appendImportedFiles(importRoot, child, files);
                continue;
            }
            String relativePath = toRelativePath(importRoot, child);
            JSObject descriptor = new JSObject();
            descriptor.put("relativePath", relativePath);
            descriptor.put("sizeBytes", child.length());
            files.put(descriptor);
        }
    }

    private String toRelativePath(File root, File child) throws IOException {
        String rootPath = root.getCanonicalPath();
        String childPath = child.getCanonicalPath();
        if (!childPath.startsWith(rootPath + File.separator)) {
            throw new IOException("import file escaped root");
        }
        return normalizeRelativePath(childPath.substring(rootPath.length() + 1).replace(File.separatorChar, '/'));
    }

    private String readUtf8File(File target) throws IOException {
        byte[] bytes = new byte[(int) target.length()];
        int offset = 0;
        try (InputStream input = new FileInputStream(target)) {
            while (offset < bytes.length) {
                int read = input.read(bytes, offset, bytes.length - offset);
                if (read == -1) break;
                offset += read;
            }
        }
        return new String(bytes, 0, offset, StandardCharsets.UTF_8);
    }

    private File resolveInside(File root, String relativePath) throws IOException {
        File target = new File(root, relativePath);
        String rootPath = root.getCanonicalPath();
        String targetPath = target.getCanonicalPath();
        if (!targetPath.equals(rootPath) && !targetPath.startsWith(rootPath + File.separator)) {
            throw new IOException("path escaped root");
        }
        return target;
    }

    private void ensureDirectory(File directory) throws IOException {
        if (directory.isDirectory()) return;
        if (!directory.mkdirs() && !directory.isDirectory()) {
            throw new IOException("directory create failed");
        }
    }

    private static String createGeneratedImportId() {
        return "android-import-" + System.currentTimeMillis();
    }

    private static boolean isSafeImportId(String value) {
        return value != null
            && value.matches("[A-Za-z0-9][A-Za-z0-9._-]{0,127}")
            && !value.equals(".")
            && !value.equals("..");
    }

    private static JSObject acknowledgeResponseDeliveryEnvelope(JSObject envelope) {
        if (envelope == null) {
            return createResponseDeliveryAcknowledgement(
                "rejected",
                INVALID_RESPONSE_PACKAGE_ID,
                "failure",
                INVALID_RESPONSE_MESSAGE_KEY
            );
        }

        Integer formatVersion = envelope.getInteger("formatVersion", -1);
        String kind = envelope.getString("kind");
        String commandId = envelope.getString("commandId");
        String packageId = envelope.getString("packageId");
        String messageKey = envelope.getString("messageKey");
        if (formatVersion == null
            || formatVersion != 1
            || !isResponseOutcomeKind(kind)
            || !"install".equals(commandId)
            || !isSafeResponsePackageId(packageId)
            || !isSafeResponseMessageKey(messageKey)) {
            return createResponseDeliveryAcknowledgement(
                "rejected",
                INVALID_RESPONSE_PACKAGE_ID,
                "failure",
                INVALID_RESPONSE_MESSAGE_KEY
            );
        }

        return createResponseDeliveryAcknowledgement(
            "acknowledged",
            packageId,
            kind,
            messageKey
        );
    }

    private static JSObject createResponseDeliveryAcknowledgement(
        String status,
        String packageId,
        String envelopeKind,
        String messageKey
    ) {
        JSObject result = new JSObject();
        result.put("status", status);
        result.put("channel", RESPONSE_DELIVERY_CHANNEL);
        result.put("packageId", packageId);
        result.put("envelopeKind", envelopeKind);
        result.put("messageKey", messageKey);
        return result;
    }

    private static boolean isResponseOutcomeKind(String value) {
        return "success".equals(value)
            || "failure".equals(value)
            || "retry".equals(value)
            || "rollback".equals(value);
    }

    private static boolean isSafeResponsePackageId(String value) {
        return value != null && value.matches("[a-z0-9_.-]+");
    }

    private static boolean isSafeResponseMessageKey(String value) {
        return value != null && value.matches("[A-Za-z0-9_.:-]{1,160}");
    }

    private static String safeDocumentName(String name) throws IOException {
        if (name == null || name.isEmpty() || name.equals(".") || name.equals("..")) {
            throw new IOException("unsafe document name");
        }
        if (name.indexOf('/') >= 0 || name.indexOf('\\') >= 0 || hasControlCharacter(name)) {
            throw new IOException("unsafe document name");
        }
        return name;
    }

    private static String joinRelativePath(String parentPath, String name) {
        return parentPath.isEmpty() ? name : parentPath + "/" + name;
    }

    private static String normalizeRelativePath(String relativePath) throws IOException {
        validateRelativePath(relativePath);
        return relativePath;
    }

    private static void validateRelativePath(String relativePath) throws IOException {
        if (relativePath.isEmpty()
            || relativePath.startsWith("/")
            || relativePath.contains("\\")
            || relativePath.contains("//")
            || relativePath.contains("/../")
            || relativePath.startsWith("../")
            || relativePath.endsWith("/..")
            || relativePath.contains("/./")
            || relativePath.startsWith("./")
            || relativePath.endsWith("/.")
            || hasControlCharacter(relativePath)) {
            throw new IOException("unsafe relative path");
        }
        String[] segments = relativePath.split("/");
        if (segments.length > MAX_PATH_DEPTH) {
            throw new IOException("relative path depth limit exceeded");
        }
        for (String segment : segments) {
            safeDocumentName(segment);
        }
        if (relativePath.getBytes(StandardCharsets.UTF_8).length > MAX_PATH_UTF8_BYTES) {
            throw new IOException("relative path byte limit exceeded");
        }
    }

    private static boolean hasControlCharacter(String value) {
        for (int i = 0; i < value.length(); i += 1) {
            char ch = value.charAt(i);
            if (ch <= 0x1F || ch == 0x7F) return true;
        }
        return false;
    }

    private static boolean deleteRecursively(File file) {
        if (!file.exists()) return true;
        if (file.isDirectory()) {
            File[] children = file.listFiles();
            if (children != null) {
                for (File child : children) {
                    if (!deleteRecursively(child)) return false;
                }
            }
        }
        return file.delete();
    }
}
