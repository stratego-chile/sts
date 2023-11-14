'use client'

import '@/styles/components/image-upload.sass'
import 'antd/es/modal/style'
import 'antd/es/slider/style'

import UserImageIcon from '@/components/user/image-icon'
import { getBase64, getBase64BlobSize } from '@/lib/file-upload'
import { formatFileSize } from '@/lib/format'
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons'
import ImgCrop from 'antd-img-crop'
import type { RcFile } from 'antd/es/upload'
import Upload from 'antd/es/upload'
import classNames from 'classnames'
import { useEffect, useState } from 'react'

type SizeMagnitudePrefix = 'K' | 'M'

type SizeMagnitudeSuffix = 'B'

type SizeMagnitude = `${SizeMagnitudePrefix}${SizeMagnitudeSuffix}`

type FormattedSize = `${number} ${SizeMagnitude}`

type ProfileImageUploaderProps = {
  imageURI?: string
  maxFileSize?: FormattedSize
  onImageUpload?: (imageURI: string | undefined, fileSize: number) => void
}

const ProfileImageUploader = ({
  imageURI,
  maxFileSize = '1 MB',
  onImageUpload,
}: ProfileImageUploaderProps) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif']

  const [uploadingImage, setUploadingImage] = useState<boolean>(false)

  const [fileSize, setFileSize] = useState<number>(0)

  const validateFile = (file: RcFile) => {
    const isImage = allowedMimeTypes.includes(file.type)

    const $maxFileSizeUnit = maxFileSize.split(
      ' ',
    )[1] as `${SizeMagnitudePrefix}B`

    const $maxFileSize = parseFloat(maxFileSize.split(' ')[0])

    const equalsOrSmallerThanSupportedSize =
      file.size / 1024 / 1024 <=
      ($maxFileSizeUnit.startsWith('K') ? $maxFileSize / 1024 : $maxFileSize)

    return isImage && equalsOrSmallerThanSupportedSize
  }

  useEffect(() => {
    setFileSize(imageURI ? getBase64BlobSize(imageURI) : 0)
  }, [imageURI])

  useEffect(() => {
    if (!imageURI) setFileSize(0)
  }, [imageURI])

  useEffect(() => {
    onImageUpload?.(imageURI, fileSize)
    // The exclusion of onImageUpload in the dependency array is intentional
    // because it will cause an infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileSize, imageURI])

  return (
    <div className="flex justify-center lg:justify-start items-center lg:items-start">
      <div className="inline-flex flex-col gap-6 items-center">
        <ImgCrop rotationSlider showReset>
          <Upload
            listType="picture-circle"
            className="avatar-uploader"
            showUploadList={false}
            accept="image/png, image/jpeg"
            action="/api/mock"
            onChange={(info) => {
              if (info.file.originFileObj)
                if (validateFile(info.file.originFileObj!)) {
                  setUploadingImage(true)

                  getBase64(info.file.originFileObj).then((dataURI) => {
                    setUploadingImage(false)
                    onImageUpload?.(dataURI, getBase64BlobSize(dataURI))
                  })
                } else onImageUpload?.(undefined, 0)
            }}
          >
            {imageURI ? (
              <UserImageIcon sizeUnit="px" size={120} imageURI={imageURI} />
            ) : (
              <div>
                {uploadingImage ? <LoadingOutlined /> : <PlusOutlined />}

                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            )}
          </Upload>
        </ImgCrop>

        <div
          className={classNames(
            'inline-flex flex-col gap-1 whitespace-nowrap',
            'text-center lg:text-left text-xs text-gray-500',
          )}
        >
          {imageURI ? (
            <span className="inline-flex gap-1">
              <span>{formatFileSize(fileSize).human('jedec')}</span>

              <span className="font-bold">/</span>

              <span>{maxFileSize}</span>
            </span>
          ) : (
            <span>Max size: {maxFileSize}</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfileImageUploader
