import { createApp, toRaw } from 'vue'
import { createPinia } from 'pinia'
import {
  bootstrapApplication,
  mountAfterRouterReady,
  reportApplicationStartupFailure
} from '@/bootstrap'
import { bootstrapOfficialContent } from '@/domain/mods/officialContentBootstrap'
import { refreshOfficialRegistryDiskCache } from '@/domain/mods/officialRegistryCacheRefresh'
import './app.css'

const runtimeProbeRequested = typeof window !== 'undefined'
  && new URLSearchParams(window.location.search).get('taoyuanContentProbe') === '1'

void bootstrapApplication({
  bootstrapOfficialContent,
  createApp: async () => createApp((await import('./App.vue')).default),
  createPinia,
  configurePinia: pinia => {
    // setup stores do not receive Pinia's built-in $reset implementation.
    pinia.use(({ store }) => {
      const initialState = JSON.parse(JSON.stringify(toRaw(store.$state)))
      store.$reset = () => {
        store.$patch($state => {
          Object.assign($state, JSON.parse(JSON.stringify(initialState)))
        })
      }
    })
  },
  installPinia: (app, pinia) => app.use(pinia),
  getRouter: async () => (await import('@/router')).default,
  installRouter: (app, router) => app.use(router),
  mount: (app, router) => mountAfterRouterReady(app, router)
}).then(async () => {
  const cacheRefresh = refreshOfficialRegistryDiskCache()
  if (!runtimeProbeRequested) {
    void cacheRefresh
    return
  }
  await cacheRefresh
  const { publishContentRuntimeProbe } = await import('@/runtime/contentRuntimeProbe')
  publishContentRuntimeProbe()
}).catch(error => {
  reportApplicationStartupFailure(error)
})
