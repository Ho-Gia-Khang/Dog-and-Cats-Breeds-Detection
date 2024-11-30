import React from 'react'
import Button from '../UI/Button'
import { EUploadStatus, FileIntermediate } from '../../types/FileIntermediate'
import { uniqueId } from 'lodash'

const ALLOWED_FILE_TYPES = ['image/png', 'image/jpg']
const BATCH_SIZE = 5

const ImageUploader = () => {
  const [isDragging, setIsDragging] = React.useState(false)
  const [images, setImages] = React.useState<FileIntermediate[]>([])

  const inputRef = React.useRef<HTMLInputElement>(null)

  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
  }
  function onDragEnter(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(true)
    e.dataTransfer.dropEffect = 'copy'
  }
  function ondragleave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
  }
  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (!files.length) return

    const acceptedFiles = files
      .filter((file) => ALLOWED_FILE_TYPES.includes(file.type))
      .map((file) => ({
        id: uniqueId(),
        file: file,
        status: EUploadStatus.Idle,
      }))
    setImages([...images, ...acceptedFiles])
  }
  function onClick() {
    if (!inputRef.current) return
    inputRef.current.click()
  }

  function onClear() {
    setImages([])
  }

  async function startUpload() {
    const queue: Promise<void>[] = images.slice(0, BATCH_SIZE).map((image) => {
      const promise = uploadImage(image.file).finally(() => {
        const index = queue.indexOf(promise)
        if (index !== -1) queue.splice(index, 1)
      })
      return promise
    })

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const isPendingLeft = images.some(
        (image) => image.status === EUploadStatus.Pending
      )
      if (!isPendingLeft) break

      await Promise.any(queue)

      const nextImage = images.find(
        (image) => image.status === EUploadStatus.Pending
      )
      if (nextImage) {
        const nextPromise = uploadImage(nextImage.file).finally(() => {
          const index = queue.indexOf(nextPromise)
          if (index !== -1) queue.splice(index, 1)
        })
      }
    }
    await Promise.allSettled(queue)
  }

  async function uploadImage(image: File): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => console.log('uploaded', image.name), 1000)
      resolve()
    })
  }

  return (
    <div className="w-full h-full flex flex-col items-center gap-2">
      <div
        className={`h-[300px] w-[600px] border-black border-dashed border-2 ${isDragging ? `border-green-600` : ``}`}
      >
        <div
          className="h-full w-full flex justify-center items-center hover:cursor-pointer"
          onDragEnter={onDragEnter}
          onDragOver={onDragOver}
          onDragLeave={ondragleave}
          onDrop={onDrop}
          onClick={onClick}
        >
          {isDragging ? (
            <div>Drop images here</div>
          ) : (
            <div className="flex gap-1">
              <span>Drag and drop images here or</span>
              <span className="hover:underline hover:cursor-pointer text-[#008080]">
                Choose
              </span>
              <input
                ref={inputRef}
                className="hidden"
                type="file"
                accept=".png, .jpg"
              />
            </div>
          )}
        </div>
      </div>

      <div className=" w-[600px] flex justify-evenly">
        <Button label="Upload" onClick={startUpload} />
        <Button label="Clear" onClick={onClear} />
      </div>
    </div>
  )
}

export default ImageUploader
