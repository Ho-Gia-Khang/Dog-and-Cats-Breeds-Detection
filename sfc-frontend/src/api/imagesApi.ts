import useHttpClient from './httpClient/httpClient'

const url = process.env.REACT_APP_APP_URL

const useImagesApi = () => {
  const httpClient = useHttpClient()

  async function getImages() {
    return await httpClient.httpGet(`${url}`)
  }

  async function uploadImage(model: string, file: File) {
    return await httpClient.httpPost(`${url}/api/upload/${model}`, file)
  }

  return {
    getImages,
    uploadImage,
  }
}

export default useImagesApi
