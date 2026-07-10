import type { App } from 'vue'
import type { Router } from 'vue-router'

export const mountAfterRouterReady = async (
  app: Pick<App, 'mount'>,
  router: Pick<Router, 'isReady'>,
  target: string | Element = '#app'
): Promise<void> => {
  await router.isReady()
  app.mount(target)
}
