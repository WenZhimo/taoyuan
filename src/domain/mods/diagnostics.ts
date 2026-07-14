import type { ContentId, PackageId, RegistryTypeId } from './ids'
import type { JsonValue } from './canonicalJson'

export type ModDiagnosticSeverity = 'info' | 'warning' | 'error' | 'fatal'
export type ModDiagnosticRecovery =
  | 'none'
  | 'retry'
  | 'disable-package'
  | 'remove-package'
  | 'safe-mode'
  | 'restore-backup'

export interface ModDiagnostic {
  code: string
  ruleId: string
  severity: ModDiagnosticSeverity
  stage: string
  messageKey: string
  packageId?: PackageId
  file?: string
  fieldPath?: string
  registryId?: RegistryTypeId
  contentId?: ContentId
  relatedPackageIds?: PackageId[]
  details?: Record<string, JsonValue>
  recovery: ModDiagnosticRecovery
}

export interface ModErrorRegistration {
  code: string
  ruleId: string
  meaning: string
  defaultSeverity: ModDiagnosticSeverity
}

export const MOD_ERROR_REGISTRY = [
  { code: 'PKG-DISCOVERY-001', ruleId: 'PKG-DISCOVERY-001', meaning: '包路径无效或越过允许根目录', defaultSeverity: 'fatal' },
  { code: 'PKG-ARCHIVE-001', ruleId: 'PKG-ARCHIVE-001', meaning: '压缩包格式非法或违反解压限制', defaultSeverity: 'error' },
  { code: 'PKG-MANIFEST-001', ruleId: 'PKG-MANIFEST-001', meaning: '缺少 manifest.json', defaultSeverity: 'error' },
  { code: 'PKG-MANIFEST-002', ruleId: 'PKG-MANIFEST-002', meaning: '清单结构不符合当前 Schema', defaultSeverity: 'error' },
  { code: 'PKG-ID-001', ruleId: 'PKG-ID-001', meaning: 'PackageId 或内容 ID 非法', defaultSeverity: 'error' },
  { code: 'PKG-VERSION-001', ruleId: 'PKG-VERSION-001', meaning: '版本不是支持的 SemVer', defaultSeverity: 'error' },
  { code: 'PKG-VERSION-002', ruleId: 'PKG-VERSION-002', meaning: '同一包存在多个未决版本', defaultSeverity: 'error' },
  { code: 'PKG-DEPENDENCY-001', ruleId: 'PKG-DEPENDENCY-001', meaning: '缺少必需依赖', defaultSeverity: 'error' },
  { code: 'PKG-DEPENDENCY-002', ruleId: 'PKG-DEPENDENCY-002', meaning: '依赖版本约束无交集', defaultSeverity: 'error' },
  { code: 'PKG-DEPENDENCY-003', ruleId: 'PKG-DEPENDENCY-003', meaning: '依赖图存在循环', defaultSeverity: 'error' },
  { code: 'PKG-SIGNATURE-001', ruleId: 'PKG-SIGNATURE-001', meaning: '文件哈希或签名不匹配', defaultSeverity: 'fatal' },
  { code: 'PKG-TRUST-001', ruleId: 'PKG-TRUST-001', meaning: '可执行能力来自未受信任发布者', defaultSeverity: 'fatal' },
  { code: 'PKG-RESOURCE-001', ruleId: 'PKG-RESOURCE-001', meaning: '资源类型、MIME 或路径不允许', defaultSeverity: 'error' },
  { code: 'PKG-LIMIT-001', ruleId: 'PKG-LIMIT-001', meaning: '包、文件或条目超过公布限制', defaultSeverity: 'error' },
  { code: 'SCHEMA-COMPILE-001', ruleId: 'SCHEMA-COMPILE-001', meaning: 'Schema 无法由 Ajv 编译', defaultSeverity: 'error' },
  { code: 'SCHEMA-VALIDATE-001', ruleId: 'SCHEMA-VALIDATE-001', meaning: '外部 JSON 结构校验失败', defaultSeverity: 'error' },
  { code: 'SCHEMA-MIGRATE-001', ruleId: 'SCHEMA-MIGRATE-001', meaning: '缺少连续无损迁移路径', defaultSeverity: 'error' },
  { code: 'REG-DUPLICATE-001', ruleId: 'REG-DUPLICATE-001', meaning: '同一注册表完整 ID 重复', defaultSeverity: 'error' },
  { code: 'REG-REFERENCE-001', ruleId: 'REG-REFERENCE-001', meaning: '跨注册表引用不存在', defaultSeverity: 'error' },
  { code: 'REG-REQUIRED-001', ruleId: 'REG-REQUIRED-001', meaning: '游戏运行所需的官方注册表条目缺失', defaultSeverity: 'fatal' },
  { code: 'REG-OWNERSHIP-001', ruleId: 'REG-OWNERSHIP-001', meaning: '包尝试注册或修改无权拥有的内容', defaultSeverity: 'error' },
  { code: 'REG-FROZEN-001', ruleId: 'REG-FROZEN-001', meaning: '冻结后尝试修改注册表', defaultSeverity: 'fatal' },
  { code: 'CFG-SCOPE-001', ruleId: 'CFG-SCOPE-001', meaning: '存档级配置试图影响注册表或依赖', defaultSeverity: 'error' },
  { code: 'CFG-MIGRATE-001', ruleId: 'CFG-MIGRATE-001', meaning: '配置迁移或当前 Schema 校验失败', defaultSeverity: 'error' },
  { code: 'I18N-LOCALE-001', ruleId: 'I18N-LOCALE-001', meaning: '默认语言或 BCP 47 标签非法', defaultSeverity: 'error' },
  { code: 'I18N-KEY-001', ruleId: 'I18N-KEY-001', meaning: '翻译键或占位参数缺失', defaultSeverity: 'warning' },
  { code: 'LIFECYCLE-TRANSACTION-001', ruleId: 'LIFECYCLE-TRANSACTION-001', meaning: '生命周期事务无法提交', defaultSeverity: 'error' },
  { code: 'LIFECYCLE-RECOVERY-001', ruleId: 'LIFECYCLE-RECOVERY-001', meaning: '未完成事务无法自动恢复', defaultSeverity: 'fatal' },
  { code: 'CACHE-NOT-FOUND-001', ruleId: 'CACHE-NOT-FOUND-001', meaning: '当前环境没有注册表快照缓存', defaultSeverity: 'info' },
  { code: 'CACHE-INVALID-001', ruleId: 'CACHE-INVALID-001', meaning: '缓存结构、版本或快照哈希无效，已退回完整挂载', defaultSeverity: 'warning' },
  { code: 'CACHE-WRITE-001', ruleId: 'CACHE-WRITE-001', meaning: '新缓存写入或回读验证失败', defaultSeverity: 'warning' },
  { code: 'CACHE-RESTORE-001', ruleId: 'CACHE-RESTORE-001', meaning: '缓存无法恢复运行时注册表，已退回完整挂载', defaultSeverity: 'warning' },
  { code: 'SAVE-ENVIRONMENT-001', ruleId: 'SAVE-ENVIRONMENT-001', meaning: '存档内容环境与当前环境不兼容', defaultSeverity: 'error' },
  { code: 'SAVE-PLUGIN-DATA-001', ruleId: 'SAVE-PLUGIN-DATA-001', meaning: '插件私有负载哈希或 Schema 无效', defaultSeverity: 'error' },
  { code: 'SAVE-PLUGIN-DATA-002', ruleId: 'SAVE-PLUGIN-DATA-002', meaning: '插件私有数据超过配额', defaultSeverity: 'error' }
] as const satisfies readonly ModErrorRegistration[]

const registrationsByCode = new Map(MOD_ERROR_REGISTRY.map(registration => [registration.code, registration]))

export type ModErrorCode = (typeof MOD_ERROR_REGISTRY)[number]['code']

export const getModErrorRegistration = (code: ModErrorCode): ModErrorRegistration => registrationsByCode.get(code)!

export const createDiagnostic = (
  code: ModErrorCode,
  options: Omit<Partial<ModDiagnostic>, 'code' | 'ruleId' | 'severity' | 'recovery'> & {
    stage: string
    messageKey?: string
    severity?: ModDiagnosticSeverity
    recovery?: ModDiagnosticRecovery
  }
): ModDiagnostic => {
  const registration = getModErrorRegistration(code)
  return {
    code,
    ruleId: registration.ruleId,
    severity: options.severity ?? registration.defaultSeverity,
    stage: options.stage,
    messageKey: options.messageKey ?? `mods.error.${code.toLowerCase().replace(/-/g, '.')}`,
    packageId: options.packageId,
    file: options.file,
    fieldPath: options.fieldPath,
    registryId: options.registryId,
    contentId: options.contentId,
    relatedPackageIds: options.relatedPackageIds,
    details: options.details,
    recovery: options.recovery ?? 'none'
  }
}
