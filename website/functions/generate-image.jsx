import { ImageResponse } from 'workers-og'

export async function onRequest(context) {
  try {
    const url = new URL(context.request.url)

    const title = url.searchParams.get('title') || 'Default Title'
    const html = `
      <div style="height: 100%; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: black; font-family: 'Open Sans', sans-serif; background-repeat: no-repeat; background-size: cover;">
      <div style="display: flex; flex-direction: column; height: 100%; width: 100%; background-image: url('${url.protocol}//${url.host}/img/bg-articles.png'); background-size: 100% 100%;">
        <div style="display: flex; flex-direction: column; width: 100%; height: 100%; align-items: center; justify-content: center;">
        <div style="display: flex; width: 100%;">
          <div style="display: flex; flex-direction: column; width: 100%; justify-content: space-between;">
          <h2 style="font-family: 'Open Sans', sans-serif; font-size: 72px; font-weight: bold; letter-spacing: -0.05em; color: white; text-align: left; margin-left: 12%; width: 70%;">
            ${title}
          </h2>
          </div>
        </div>
        </div>
      </div>
      </div>
    `

    return new ImageResponse(html, {
      // 3200 x 1800 - bg dimensions (16 x 9)
      // 1200 x 675 - recommended OG dimensions (16 x 9)
      width: 1200,
      height: 675,
      fonts: [
        {
          name: 'Open Sans',
          data: await loadGoogleFont('Open Sans', title),
          style: 'bold'
        }
      ]
    })
  } catch (error) {
    console.error('Error generating image:', error)
    return new Response('Error generating image', { status: 500 })
  }
}

async function loadGoogleFont(font, text) {
  const url = `https://fonts.googleapis.com/css2?family=${font}&text=${encodeURIComponent(text)}`
  const css = await (await fetch(url)).text()
  const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/)

  if (resource) {
    const response = await fetch(resource[1])
    if (response.status == 200) {
      return await response.arrayBuffer()
    }
  }

  throw new Error('failed to load font data')
}
