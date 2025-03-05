import axios, { AxiosResponse } from 'axios';

interface R2OpsResponse {
  mediaBaseUrl: string;
  presignedUrl: string;
}

const axiosPost = (url: string, bodyDict: Record<string, any>): Promise<AxiosResponse> => {
  return axios.post(url, bodyDict, {});
};

type ProgressCallback = (progress: number) => void;
type UploadedCallback = (mediaUrl: string, arrayBuffer: ArrayBuffer) => void;
type ErrorCallback = (error: Event | Error) => void;

function uploadFile(
  file: File,
  cdnFilename: string,
  onProgress: ProgressCallback,
  onUploaded: UploadedCallback,
  onFailure?: ErrorCallback,
  onR2OpsFailure?: ErrorCallback
): void {
  const { size, type } = file;
  axiosPost('/admin/ajax/r2-ops', {
    size,
    key: cdnFilename,
    type,
  }).then((res) => {
    const fileReader = new FileReader();
    fileReader.onloadend = (e: ProgressEvent<FileReader>) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      if (arrayBuffer) {
        const { mediaBaseUrl, presignedUrl } = res.data as R2OpsResponse;
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", presignedUrl, true);
        xhr.upload.addEventListener("progress", (event: ProgressEvent) => {
          if (event.lengthComputable) {
            onProgress(event.loaded / event.total);
          }
        });
        xhr.addEventListener("loadend", () => {
          const mediaUrl = `${mediaBaseUrl}/${cdnFilename}`;
          if (xhr.readyState === 4 && xhr.status === 200) {
            onUploaded(mediaUrl, arrayBuffer);
          }
        });
        xhr.addEventListener("error", (event: Event) => {
          if (onFailure) {
            onFailure(event);
          }
        });
        xhr.send(arrayBuffer);
      }
    };
    fileReader.readAsArrayBuffer(file);
  }).catch((error: Error) => {
    if (onR2OpsFailure) {
      onR2OpsFailure(error);
    }
  });
}

const Requests = {
  axiosPost,
  upload: uploadFile,
} as const;

export default Requests;