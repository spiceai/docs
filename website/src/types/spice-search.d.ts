export interface SpiceSearchThemeConfig {
  endpoint?: string
  apiKey?: string
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
