export interface SpiceSearchThemeConfig {
  endpoint?: string
  apiKey?: string // Dummy value for DocSearch validation - actual auth handled server-side
  resultTitleField?: string
  resultUrlField?: string
  resultDescriptionField?: string
  preconnectOrigin?: string
}

declare module '@docusaurus/types' {
  interface ThemeConfig {
    spiceSearch?: SpiceSearchThemeConfig
    languageTabs?: Array<{
      highlight: string
      language: string
      logoClass?: string
    }>
  }
}
