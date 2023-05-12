import type { RcFile } from 'antd/es/upload'

export const getBase64 = async (img: RcFile) => {
  return await new Promise<string>((resolve) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => resolve(reader.result as string))
    reader.readAsDataURL(img)
  })
}
