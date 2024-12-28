import React from 'react'
import Button from '../UI/Button'
import { EUploadStatus, FileIntermediate } from '../../types/FileIntermediate'
import { cloneDeep, isEmpty, uniqueId } from 'lodash'
import Divider from '../UI/Divider'
import ImageCard from './ImageCard'
import useImagesApi from '../../api/imagesApi'
import { EModel } from '../../types/Models'
import { ImageDetectionResponse } from '../../api/model/ImageDetectionResponse'
import Chart from '../chart'

const ALLOWED_FILE_TYPES = ['image/png', 'image/jpeg']
const BATCH_SIZE = 5

interface Row {
  image: FileIntermediate
  content?: ImageDetectionResponse
}

const ImageUploader = () => {
  const [isDragging, setIsDragging] = React.useState(false)
  const [images, setImages] = React.useState<FileIntermediate[]>([])
  const [results, setResults] = React.useState<
    Record<string, ImageDetectionResponse>
  >({})
  const [selectedModel, setSelectedModel] = React.useState<EModel>(
    EModel.RESNET
  )
  const [rows, setRows] = React.useState<Record<string, Row>>({})
  const [updateTrigger, setUpdateTrigger] = React.useState(0)

  React.useEffect(() => {
    const modifiedRows: Record<string, Row> = {}

    Object.keys(rows).forEach((k) => {
      const img = images.find((i) => i.id === k)
      modifiedRows[k] = {
        image: img!,
        content: results[k],
      }
    })

    setRows(modifiedRows)
    setUpdateTrigger((prev) => prev + 1)
  }, [images, results])

  const inputRef = React.useRef<HTMLInputElement>(null)

  const imageApi = useImagesApi()

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
    setImages([...images, ...cloneDeep(acceptedFiles)])

    const newRows: Record<string, Row> = {}

    acceptedFiles.forEach((file) => {
      newRows[file.id] = {
        image: file,
      }
    })
    setRows({ ...rows, ...newRows })
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
      updateFileStatus(image.id, EUploadStatus.Pending)
    }
    Object.keys(rows).forEach((key) => {
      rows[key].content = undefined
    })
    await startUpload()
  }

  async function startUpload() {
    const queue: Promise<void>[] = images
      .filter((img) => img.status === EUploadStatus.Pending)
      .slice(0, BATCH_SIZE)
      .map((image) => {
        const promise = uploadImage(image, selectedModel).finally(() => {
          const index = queue.indexOf(promise)
          if (index !== -1) queue.splice(index, 1)
        })
        return promise
      })

    // eslint-disable-next-line no-constant-condition
    while (true) {
      await Promise.any(queue)
      const isPendingLeft = images.some(
        (image) => image.status === EUploadStatus.Pending
      )

      if (!isPendingLeft) break

      const nextImage = images.find(
        (image) => image.status === EUploadStatus.Pending
      )
      if (nextImage) {
        const nextPromise = uploadImage(nextImage, selectedModel).finally(
          () => {
            const index = queue.indexOf(nextPromise)
            if (index !== -1) queue.splice(index, 1)
          }
        )
        queue.push(nextPromise)
      }
    }
    await Promise.allSettled(queue)
  }

  function updateFileStatus(id: string, status: EUploadStatus) {
    const idx = images.findIndex((img) => img.id === id)
    if (idx !== -1) {
      images[idx].status = status
      setUpdateTrigger((prev) => prev + 1)
    }
  }

  async function uploadImage(
    image: FileIntermediate,
    model: EModel
  ): Promise<void> {
    return new Promise((resolve) => {
      updateFileStatus(image.id, EUploadStatus.Uploading)
      imageApi
        .uploadImage(model, image.file)
        .then((res) => {
          setResults({ ...results, [image.id]: { ...res } })
          results[image.id] = res
          updateFileStatus(image.id, EUploadStatus.Done)
        })
        .catch((err) => {
          updateFileStatus(image.id, EUploadStatus.Error)
          throw err
        })
        .finally(resolve)
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

      <div className=" w-[600px] flex justify-between">
        <div className="flex gap-2 items-center">
          <span>Selected Model:</span>
          <select
            className="border-2 border-[#008080] rounded-md p-1 hover:cursor-pointer"
            onChange={(e) => setSelectedModel(e.target.value as EModel)}
          >
            <option value={EModel.RESNET}>ResNet</option>
            <option value={EModel.INCEPTION}>Inception</option>
            <option value={EModel.MOBILENET}>MobileNet</option>
          </select>
          <Button label="Upload" onClick={onUpload} />
        </div>

        <Button label="Clear" onClick={onClear} />
      </div>

      {Object.keys(rows).length ? (
        <div className="flex flex-col gap-2 w-[800px] h-[500px] border-black border-2 px-2 rounded-md overflow-auto">
          <div
            className="grid w-full justify-items-center z-10 items-center bg-white p-2 border-black border-b-2 sticky top-0"
            style={{ gridTemplateColumns: '1fr min-content 1fr' }}
          >
            <h2 className="text-xl">Files</h2>
            <Divider vertical />
            <h3 className="text-xl">Results</h3>
          </div>

          {Object.entries(rows).map(([key, row]) => (
            <div key={key}>
              <div
                className="grid w-full justify-items-center items-center h-[100px]"
                style={{ gridTemplateColumns: '1fr min-content 1fr' }}
              >
                <ImageCard file={row.image} />
                <Divider vertical />
                <span>
                  {Object.entries(row.content ?? {}).map(([key, val]) => (
                    <div key={key} className="flex flex-col gap-2">
                      <p>Predicted class: {val.predicted_class}</p>
                      <p>Confidence: {val.confidence}</p>
                    </div>
                  ))}
                </span>
              </div>
              <Divider />
            </div>
          ))}
        </div>
      ) : (
        <h2>Upload some images for prediction</h2>
      )}

      {!isEmpty(results) ? <Chart images={images} results={results} /> : <></>}
    </div>
  )
}

export default ImageUploader
