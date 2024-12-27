import useHttpClient from './httpClient/httpClient'
import { ImageDetectionResponse } from './model/ImageDetectionResponse'

const url = process.env.REACT_APP_APP_URL

const useImagesApi = () => {
  const httpClient = useHttpClient()

  async function getImages() {
    return await httpClient.httpGet(`${url}`)
  }

  async function uploadImage(
    model: string,
    file: File
  ): Promise<ImageDetectionResponse> {
    const form = new FormData()
    form.append('file', file)

    return await httpClient.httpPost(`${url}/api/upload/${model}`, form)
  }

  return {
    getImages,
    uploadImage,
  }
}

export default useImagesApi
