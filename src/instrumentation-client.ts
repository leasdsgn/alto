import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: 'https://bd4892abd7d18d41c47de1246a698210@o4510997670002688.ingest.de.sentry.io/4511738040287312',
  enabled: process.env.NODE_ENV === 'production',
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,
  sendDefaultPii: false,
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
