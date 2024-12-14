import {
  configureStore,
  createAsyncThunk,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit'
import { EUploadStatus, FileIntermediate } from '../types/FileIntermediate'

interface ImagesState {
  images: FileIntermediate[]
}

const initialState: ImagesState = {
  images: [],
}

const imagesSlice = createSlice({
  name: 'images',
  initialState,
  reducers: {
    addImages(state, action: PayloadAction<FileIntermediate[]>) {
      state.images.push(...action.payload)
    },
    updateImageStatus(
      state,
      action: PayloadAction<{ id: string; status: EUploadStatus }>
    ) {
      const image = state.images.find((img) => img.id === action.payload.id)
      if (image) {
        image.status = action.payload.status
      }
    },
  },
})

export const uploadImage = createAsyncThunk(
  'images/uploadImage',
  async (image: FileIntermediate, { dispatch }) => {
    dispatch(
      imagesSlice.actions.updateImageStatus({
        id: image.id,
        status: EUploadStatus.Uploading,
      })
    )
    // Simulate upload
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000))
    console.log('uploaded', image.file.name)
    dispatch(
      imagesSlice.actions.updateImageStatus({
        id: image.id,
        status: EUploadStatus.Done,
      })
    )
  }
)

export const imagesStore = configureStore({
  reducer: {
    images: imagesSlice.reducer,
  },
})

export type RootState = ReturnType<typeof imagesStore.getState>
export type AppDispatch = typeof imagesStore.dispatch
