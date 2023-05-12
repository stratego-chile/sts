'use client'

import { LoadingOutlined, PlusOutlined } from '@ant-design/icons'
import UserImageIcon from '@stratego-sts/components/user/image-icon'
import { getBase64 } from '@stratego-sts/lib/file-upload'
import ImgCrop from 'antd-img-crop'
import type { RcFile } from 'antd/es/upload'
import Upload from 'antd/es/upload'
import { useEffect, useState } from 'react'

type ProfileImageUploaderProps = {
  preloadedImageURI?: string
  onImageUpload?: (imageURI: string, fileSize: number) => void
}

const ProfileImageUploader = ({
  preloadedImageURI,
  onImageUpload,
}: ProfileImageUploaderProps) => {
  const [uploadingImage, setUploadingImage] = useState<boolean>(false)

  const [fileSize, setFileSize] = useState<number>(0)

  const [imageURI, setImageURI] = useState<string | undefined>(
    preloadedImageURI
  )

  const checkImageBeforeUpload = (file: RcFile) => {
    const isImage = file.type === 'image/jpeg' || file.type === 'image/png'

    const smallerTo2M = file.size / 1024 / 1024 <= 1

    setFileSize(file.size)

    return isImage && smallerTo2M
  }

  useEffect(() => {
    if (imageURI && fileSize) onImageUpload?.(imageURI, fileSize)
    // The exclusion of onImageUpload in the dependency array is intentional
    // because it will cause an infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileSize, imageURI])

  return (
    <>
      <ImgCrop rotationSlider showReset>
        <Upload
          listType="picture-circle"
          className="avatar-uploader"
          showUploadList={false}
          accept="image/png, image/jpeg"
          beforeUpload={checkImageBeforeUpload}
          action="/api/mock"
          onChange={(info) => {
            setUploadingImage(true)
            if (info.file.originFileObj)
              getBase64(info.file.originFileObj).then((dataURI) => {
                setUploadingImage(false)
                setImageURI(dataURI)
              })
          }}
        >
          {imageURI ? (
            <UserImageIcon imageURI={imageURI} />
          ) : (
            <div>
              {uploadingImage ? <LoadingOutlined /> : <PlusOutlined />}
              <div style={{ marginTop: 8 }}>Upload</div>
            </div>
          )}
        </Upload>
      </ImgCrop>
    </>
  )
}

export default ProfileImageUploader
