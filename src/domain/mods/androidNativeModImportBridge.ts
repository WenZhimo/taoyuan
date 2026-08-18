import { registerPlugin } from '@capacitor/core'
import {
  createAndroidAppDataImportSource,
  type AndroidAppDataImportBridgeHost,
  type AndroidAppDataImportFileDescriptor
} from './androidAppDataImportBridge'
import type { ContentPackageSource, ContentPackageSourceSafeReadPolicy } from './contentPackageSource'

export interface AndroidNativeModImportFilesResult {
  readonly files: readonly AndroidAppDataImportFileDescriptor[]
}

export interface AndroidNativeModImportReadTextResult {
  readonly text: string
}

export interface AndroidNativeModImportChooseOptions {
  readonly importId?: string
}

export interface AndroidNativeModImportChooseResult extends AndroidNativeModImportFilesResult {
  readonly importId: string
}

export interface AndroidNativeModImportPlugin {
  chooseAndCopyImport(options?: AndroidNativeModImportChooseOptions): Promise<AndroidNativeModImportChooseResult>
  listImportedFiles(options: { readonly importId: string }): Promise<AndroidNativeModImportFilesResult>
  readImportedText(options: {
    readonly importId: string
    readonly relativePath: string
  }): Promise<AndroidNativeModImportReadTextResult>
  deleteImport(options: { readonly importId: string }): Promise<void>
}

export interface CreateAndroidNativeModImportSourceOptions {
  readonly importId: string
  readonly plugin?: AndroidNativeModImportPlugin
  readonly sourceId?: string
  readonly rootPath?: string
  readonly policy?: ContentPackageSourceSafeReadPolicy
}

export const TaoyuanModImport = registerPlugin<AndroidNativeModImportPlugin>('TaoyuanModImport')

export const createAndroidNativeModImportBridgeHost = (
  plugin: AndroidNativeModImportPlugin = TaoyuanModImport
): AndroidAppDataImportBridgeHost => {
  const host: AndroidAppDataImportBridgeHost = {
  async listImportedFiles(importId) {
    const result = await plugin.listImportedFiles({ importId })
    return result.files
  },
  async readImportedText(importId, relativePath) {
    const result = await plugin.readImportedText({ importId, relativePath })
    return result.text
  }
  }
  return Object.freeze(host)
}

export const createAndroidNativeModImportSource = (
  options: CreateAndroidNativeModImportSourceOptions
): Promise<ContentPackageSource> => createAndroidAppDataImportSource({
  host: createAndroidNativeModImportBridgeHost(options.plugin),
  importId: options.importId,
  ...(options.sourceId === undefined ? {} : { sourceId: options.sourceId }),
  ...(options.rootPath === undefined ? {} : { rootPath: options.rootPath }),
  ...(options.policy === undefined ? {} : { policy: options.policy })
})
