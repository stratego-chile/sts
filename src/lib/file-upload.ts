import type { RcFile } from 'antd/es/upload'
import isBase64 from 'is-base64'

export async function getBase64(img: RcFile) {
  return await new Promise<string>((resolve) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => resolve(reader.result as string))
    reader.readAsDataURL(img)
  })
}

export function getBase64BlobSize(dataURI: string) {
  let size = NaN

  try {
    if (isBase64(dataURI, { allowMime: true })) {
      const blob = new Blob([
        dataURI.includes(',') ? dataURI.split(',')[1] : dataURI,
      ])

      size = blob.size
    }
  } catch {
    size = 0
  } finally {
    if (Number.isNaN(size)) size = 0

    return size
  }
}
