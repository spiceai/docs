function tailwindPlugin(context, options) {
  return {
    name: 'tailwind-plugin',
    injectHtmlTags() {
      return {
        headTags: [
          {
            tagName: 'link',
            attributes: {
              rel: 'stylesheet',
              href: 'https://unpkg.com/tailwindcss@3.4.14/src/css/preflight.css'
            }
          }
        ]
      }
    },
    configurePostCss(postcssOptions) {
      postcssOptions.plugins = [
        require('postcss-import'),
        require('tailwindcss'),
        require('autoprefixer')
      ]
      return postcssOptions
    }
  }
}

module.exports = tailwindPlugin
