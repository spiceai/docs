import { ImageResponse } from 'workers-og'

export function onRequest(context) {
  try {
    const url = new URL(context.request.url);

    const title = url.searchParams.get('title') || 'Default Title'
    const html = `
      <div style="height: 100%; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: black; font-family: Manrope, Arial, sans-serif; background-repeat: no-repeat; background-size: cover;">
      <div style="display: flex; flex-direction: column; height: 100%; width: 100%; background-image: url('${url.protocol}//${url.host}/img/bg-articles.png'); background-size: 100% 100%;">
        <div style="display: flex; flex-direction: column; width: 100%; height: 100%; align-items: center; justify-content: center;">
        <div style="display: flex; width: 100%;">
          <div style="display: flex; flex-direction: column; width: 100%; justify-content: space-between; padding: 32px;">
          <h2 style="font-family: Arial, sans-serif; font-size: 48px; font-weight: bold; letter-spacing: -0.05em; color: white; text-align: left; margin-left: 80px; width: 384px; margin-top: 40px;">
            ${title}
          </h2>
          </div>
        </div>
        </div>
      </div>
      </div>
    `

    return new ImageResponse(
      html,
      {
        width: 800,
        height: 418
      }
    )
  } catch (error) {
    console.error('Error generating image:', error)
    return new Response('Error generating image', { status: 500 })
  }
}