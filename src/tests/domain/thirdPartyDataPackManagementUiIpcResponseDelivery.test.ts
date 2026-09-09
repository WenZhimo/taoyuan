import { describe, expect, it } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  createThirdPartyDataPackManagementUiIpcResponseEnvelope,
  deliverThirdPartyDataPackWebManagementUiIpcResponse,
  type ThirdPartyDataPackManagementUiIpcTerminal
} from '@/domain/mods/thirdPartyDataPackManagementUiIpcResponseDelivery'
import {
  thirdPartyDataPackWebResponseDeliveryEventName,
  type ThirdPartyDataPackWebDomResponseDeliveryEvent
} from '@/domain/mods/thirdPartyDataPackWebDomResponseDeliveryBridge'

const packageId = 'management_response_delivery_pack' as PackageId
const dependencyPackageId = 'management_response_dependency_pack' as PackageId
const hash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

const createTerminal = (
  overrides: Partial<ThirdPartyDataPackManagementUiIpcTerminal> = {}
): ThirdPartyDataPackManagementUiIpcTerminal => Object.freeze({
  status: 'ready',
  requestedCommandId: 'disable',
  targetPackageId: packageId,
  selectedPackageIds: [],
  blockedPackageIds: [packageId],
  loadOrder: [],
  registryCount: 54,
  entryCount: 4242,
  packageCount: 1,
  lockfileHash: hash('1'),
  ...overrides
})

describe('third-party data pack management UI/IPC response delivery', () => {
  it('delivers a path-free disable result through the Web DOM response sink', async() => {
    const target = new EventTarget()
    const receivedEvents: ThirdPartyDataPackWebDomResponseDeliveryEvent[] = []
    target.addEventListener(thirdPartyDataPackWebResponseDeliveryEventName, event => {
      receivedEvents.push(event as ThirdPartyDataPackWebDomResponseDeliveryEvent)
    })

    const result = await deliverThirdPartyDataPackWebManagementUiIpcResponse({
      terminal: createTerminal(),
      target
    })

    expect(result.status).toBe('delivered')
    expect(result.webResponseDelivered).toBe(true)
    expect(result.uiIpcResponseDelivered).toBe(true)
    expect(result.acknowledgement).toMatchObject({
      status: 'acknowledged',
      channel: 'web-ui-response-event-sink',
      packageId,
      envelopeKind: 'success',
      messageKey: 'mods.ui.ipc.result.disable.success'
    })
    expect(result.envelope).toMatchObject({
      formatVersion: 1,
      kind: 'success',
      commandId: 'disable',
      packageId,
      lockfileHash: hash('1'),
      messageKey: 'mods.ui.ipc.result.disable.success',
      recovery: 'none',
      retryable: false,
      rollbackRequired: false,
      summary: {
        selectedPackageCount: 0,
        blockedPackageCount: 1,
        blockedCandidateCount: 0,
        loadOrderCount: 0,
        registryCount: 54,
        entryCount: 4242,
        packageCount: 1,
        diagnosticCount: 0
      },
      diagnostics: []
    })
    expect(receivedEvents).toHaveLength(1)
    expect(receivedEvents[0]?.detail).toEqual({
      formatVersion: 1,
      channel: 'web-ui-response-event-sink',
      envelope: result.envelope
    })
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
  })

  it('delivers retryable failure envelopes for blocked management terminals', async() => {
    const envelope = createThirdPartyDataPackManagementUiIpcResponseEnvelope(createTerminal({
      status: 'blocked',
      requestedCommandId: 'enable',
      selectedPackageIds: [dependencyPackageId],
      blockedPackageIds: [packageId],
      loadOrder: [dependencyPackageId],
      packageCount: 2
    }))

    expect(envelope).toMatchObject({
      kind: 'failure',
      commandId: 'enable',
      packageId,
      messageKey: 'mods.ui.ipc.result.enable.failure',
      recovery: 'retry',
      retryable: true,
      rollbackRequired: false,
      summary: {
        selectedPackageCount: 1,
        blockedPackageCount: 1,
        loadOrderCount: 1,
        packageCount: 2,
        diagnosticCount: 1
      }
    })
    expect(Object.isFrozen(envelope)).toBe(true)
    expect(Object.isFrozen(envelope.summary)).toBe(true)
  })

  it('blocks delivery when the Web response event is canceled', async() => {
    const target = new EventTarget()
    target.addEventListener(thirdPartyDataPackWebResponseDeliveryEventName, event => {
      event.preventDefault()
    })

    const result = await deliverThirdPartyDataPackWebManagementUiIpcResponse({
      terminal: createTerminal({ requestedCommandId: 'uninstall' }),
      target
    })

    expect(result.status).toBe('blocked')
    expect(result.webResponseDelivered).toBe(false)
    expect(result.uiIpcResponseDelivered).toBe(false)
    expect(result.acknowledgement).toBeUndefined()
    expect(result.envelope).toMatchObject({
      kind: 'success',
      commandId: 'uninstall',
      packageId,
      messageKey: 'mods.ui.ipc.result.uninstall.success'
    })
  })

  it('skips delivery when no Web EventTarget host is available', async() => {
    const result = await deliverThirdPartyDataPackWebManagementUiIpcResponse({
      terminal: createTerminal(),
      target: null
    })

    expect(result.status).toBe('skipped')
    expect(result.webResponseDelivered).toBe(false)
    expect(result.uiIpcResponseDelivered).toBe(false)
    expect(result.envelope).toBeUndefined()
  })
})
