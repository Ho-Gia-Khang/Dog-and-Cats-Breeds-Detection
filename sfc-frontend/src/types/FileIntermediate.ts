export enum EUploadStatus {
  Idle = 'idle',
  Pending = 'Pending',
  Uploading = 'uploading',
  Done = 'done',
  Error = 'error',
  Canceled = 'canceled',
}

export interface FileIntermediate {
  id: string
  file: File
  status: EUploadStatus
  task?: {
    cancel: () => Promise<void>
    retry: () => Promise<void>
  }
}
