export interface ProcessedImageResult {
  dataUrl: string
  width: number
  height: number
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(image)
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Could not load image for processing.'))
    }

    image.src = objectUrl
  })
}

export async function preprocessImage(file: File): Promise<ProcessedImageResult> {
  const image = await loadImageFromFile(file)
  const maxWidth = 1600

  const scale = image.width > maxWidth ? maxWidth / image.width : 1
  const targetWidth = Math.max(1, Math.round(image.width * scale))
  const targetHeight = Math.max(1, Math.round(image.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = targetWidth
  canvas.height = targetHeight

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Canvas 2D context is unavailable.')
  }

  ctx.drawImage(image, 0, 0, targetWidth, targetHeight)

  const dataUrl = canvas.toDataURL('image/jpeg', 0.9)

  return {
    dataUrl,
    width: targetWidth,
    height: targetHeight,
  }
}
