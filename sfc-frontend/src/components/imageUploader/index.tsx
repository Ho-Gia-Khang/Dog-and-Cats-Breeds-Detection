import React from 'react'
import Button from '../UI/Button'
import { EUploadStatus, FileIntermediate } from '../../types/FileIntermediate'
import { uniqueId } from 'lodash'
import Divider from '../UI/Divider'
import ImageCard from './ImageCard'

const ALLOWED_FILE_TYPES = ['image/png', 'image/jpeg']
const BATCH_SIZE = 5

const ImageUploader = () => {
  const [isDragging, setIsDragging] = React.useState(false)
  const [images, setImages] = React.useState<FileIntermediate[]>([])

  const inputRef = React.useRef<HTMLInputElement>(null)

  function receiveFiles(fileList: FileList | null) {
    if (!fileList) return

    const files = Array.from(fileList)
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

    receiveFiles(e.dataTransfer.files)
  }
  function onClick() {
    if (!inputRef.current) return
    inputRef.current.click()
  }

  function onClear() {
    setImages([])
  }

  async function onUpload() {
    for (const image of images) {
      image.status = EUploadStatus.Pending
    }
    await startUpload()
  }

  async function startUpload() {
    const queue: Promise<void>[] = images
      .filter((img) => img.status === EUploadStatus.Pending)
      .slice(0, BATCH_SIZE)
      .map((image) => {
        const promise = uploadImage(image).finally(() => {
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
        const nextPromise = uploadImage(nextImage).finally(() => {
          const index = queue.indexOf(nextPromise)
          if (index !== -1) queue.splice(index, 1)
        })
        queue.push(nextPromise)
      }
    }
    await Promise.allSettled(queue)
  }

  async function uploadImage(image: FileIntermediate): Promise<void> {
    return new Promise((resolve) => {
      image.status = EUploadStatus.Uploading
      setTimeout(() => {
        console.log('uploaded', image.file.name)
      }, Math.random() * 1000)
      resolve()
    })
  }

  return (
    <div className="w-full h-full flex flex-col items-center gap-2 overflow-auto">
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
                multiple
                onChange={(e) => receiveFiles(e.target.files)}
              />
            </div>
          )}
        </div>
      </div>

      <div className=" w-[600px] flex justify-evenly">
        <Button label="Upload" onClick={onUpload} />
        <Button label="Clear" onClick={onClear} />
      </div>

      {images.length ? (
        <div className="flex flex-col gap-2 w-[800px] h-full border-black border-2 p-2 rounded-md overflow-auto">
          <div
            className="grid w-full justify-items-center items-center p-2 border-black border-b-2 sticky top-0"
            style={{ gridTemplateColumns: '1fr min-content 1fr' }}
          >
            <h2 className="text-xl">Files</h2>
            <Divider vertical />
            <h3 className="text-xl">Results</h3>
          </div>

          {images.map((img, idx) => (
            <div key={idx}>
              <div
                className="grid w-full justify-items-center items-center h-[100px]"
                style={{ gridTemplateColumns: '1fr min-content 1fr' }}
              >
                <ImageCard file={img} />
                <Divider vertical />
                <span></span>
              </div>
              <Divider />
            </div>
          ))}
        </div>
      ) : (
        <h2>Upload some images for prediction</h2>
      )}
    </div>
  )
}

export default ImageUploader
