import React from 'react'
import { FileIntermediate } from '../../types/FileIntermediate'

const ImageUploader = ({ file }: { file: FileIntermediate }) => {
  return (
    <div className="h-[300px] w-[600px] border-black border-dashed border-2">
      <div className="flex gap-1">
        <span>Drag and drop images here or</span>
        <span className="hover:underline hover:cursor-pointer">Choose</span>
      </div>
    </div>
  )
}

export default ImageUploader
