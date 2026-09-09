export default defineNuxtConfig({
  compatibilityDate: '2026-09-01',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  components: [{ path: '~/components', pathPrefix: false }],
  runtimeConfig: {
    public: {
      siteUrl: ''
    }
  },
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#191a1c' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/brand/favicon.svg' }
      ]
    }
  },
  nitro: {
    compressPublicAssets: true
  }
})
