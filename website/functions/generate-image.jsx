import { ImageResponse } from 'workers-og'

function template({ title }) {
  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'black',
        fontFamily: 'Manrope, Arial, sans-serif',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover'
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          width: '100%',
          backgroundImage: `url('${url.protocol}//${url.host}/img/bg-articles.png')`,
          backgroundSize: '100% 100%'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div style={{ display: 'flex', width: '100%' }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                justifyContent: 'space-between',
                padding: '32px'
              }}
            >
              <h2
                style={{
                  fontFamily: 'Open Sans, sans-serif',
                  fontSize: '48px',
                  fontWeight: 'bold',
                  letterSpacing: '-0.05em',
                  color: 'white',
                  textAlign: 'left',
                  marginLeft: '80px',
                  width: '384px',
                  marginTop: '40px'
                }}
              >
                {title}
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export async function onRequest(context) {
  try {
    const url = new URL(context.request.url)

    const title = url.searchParams.get('title') || 'Default Title'
    const html = template({ title })

    return new ImageResponse(html, {
      width: 800,
      height: 418,
      fonts: [
        {
          name: 'Open Sans',
          data: await loadGoogleFont('Open Sans', title),
          style: 'normal'
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
