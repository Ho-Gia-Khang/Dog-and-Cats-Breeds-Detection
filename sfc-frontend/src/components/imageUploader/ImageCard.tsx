import React from 'react'
import { EUploadStatus, FileIntermediate } from '../../types/FileIntermediate'
import Image from '../UI/Image'
import Message from '../UI/Message'

const ImageUploader = ({ file }: { file: FileIntermediate }) => {
  function convertToFileSizeMb(size: number) {
    return (size / 1024 / 1024).toFixed(3)
  }

  return (
    <div className="h-full w-full bg-gray-200 flex flex-row gap-2 items-center">
      <Image src={URL.createObjectURL(file.file)} />
      <div className="h-full flex flex-col p-2">
        <span className="font-semibold text-ellipsis">{file.file.name}</span>
        <span className="text-gray-500">
          {convertToFileSizeMb(file.file.size)}MB
        </span>
        {file.status === EUploadStatus.Idle ? (
          <></>
        ) : (
          <Message message={file.status} />
        )}
      </div>
    </div>
  )
}

export default ImageUploader
