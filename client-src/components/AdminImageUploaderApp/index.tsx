import React from 'react';
import clsx from 'clsx';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.min.css';
import FileUploaderWrapper from "../FileUploaderWrapper";
import Requests from '../../common/requests';
import { randomHex, urlJoinWithRelative } from '../../../common-src/StringUtils';
import AdminDialog from "../AdminDialog";
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import ExternalLink from "../ExternalLink";
import { showToast } from "../../common/ToastUtils";

const UPLOAD_STATUS__START = 1;

interface EmptyImageProps {
  fileTypes: string[];
}

function EmptyImage({ fileTypes }: EmptyImageProps): JSX.Element {
  return (
    <div className="text-brand-light text-sm flex flex-col justify-center items-center h-full">
      <div className="mb-2">
        <CloudArrowUpIcon className="w-8" />
      </div>
      <div className="font-semibold">
        Click or drag here to upload image
      </div>
      <div className="mt-2">
        {fileTypes.join(',')}
      </div>
    </div>
  );
}

interface PreviewImageProps {
  url: string;
}

function PreviewImage({ url }: PreviewImageProps): JSX.Element {
  return (
    <div className="relative flex justify-center">
      <img
        src={url}
        className={clsx('lh-upload-image-size object-cover', 'gradient-mask-b-20')}
        alt="Preview"
      />
      <div className="absolute bottom-4 text-sm font-normal text-brand-light">
        <em>
          Click or drag here to change image
        </em>
      </div>
    </div>
  );
}

function isInvalidImage(): string | undefined {
  // TODO: implement it -
  // - check if it's image
  // - square size
  // - at least 1400x1400
  // - ...
  // return 'error message'
  return undefined;
}

interface FeedSettings {
  webGlobalSettings?: {
    publicBucketUrl?: string;
  };
}

interface Feed {
  settings?: FeedSettings;
}

interface AdminImageUploaderProps {
  currentImageUrl?: string;
  mediaType?: string;
  feed?: Feed;
  onImageUploaded: (url: string, contentType: string) => void;
  imageSizeNotOkayFunc?: (width: number, height: number) => boolean;
  imageSizeNotOkayMsgFunc?: (width: number, height: number) => string;
}

interface AdminImageUploaderState {
  currentImageUrl?: string;
  mediaType: string;
  uploadStatus: number | null;
  progressText: string;
  publicBucketUrl: string;
  showModal: boolean;
  previewImageUrl: string | null;
  cropper: Cropper | null;
  cdnFilename: string | null;
  contentType: string;
  imageWidth: number;
  imageHeight: number;
}

interface AxiosError extends Error {
  response?: any;
}

export default class AdminImageUploaderApp extends React.Component<AdminImageUploaderProps, AdminImageUploaderState> {
  private inputFile: HTMLInputElement | null = null;
  private initState: AdminImageUploaderState;

  constructor(props: AdminImageUploaderProps) {
    super(props);

    this.onFileUploadClick = this.onFileUploadClick.bind(this);
    this.onFileUpload = this.onFileUpload.bind(this);
    this.onFileUploadToR2 = this.onFileUploadToR2.bind(this);

    const webGlobalSettings = props.feed?.settings?.webGlobalSettings || {};
    const publicBucketUrl = webGlobalSettings?.publicBucketUrl || '';

    this.initState = {
      currentImageUrl: props.currentImageUrl,
      mediaType: props.mediaType || 'channel',
      uploadStatus: null,
      progressText: '0.00%',
      publicBucketUrl,
      showModal: false,
      previewImageUrl: null,
      cropper: null,
      cdnFilename: null,
      contentType: '',
      imageWidth: 0,
      imageHeight: 0,
    };

    this.state = {
      ...this.initState,
    };
  }

  onFileUploadClick(e: React.MouseEvent<HTMLElement>): void {
    e.preventDefault();
    if (!this.inputFile) {
      return;
    }
    const { uploadStatus } = this.state;
    if (uploadStatus === UPLOAD_STATUS__START) {
      return;
    }

    this.inputFile.click();
  }

  onFileUpload(file: File): void {
    const { mediaType } = this.state;
    if (!file) {
      return;
    }

    const errorMessage = isInvalidImage();
    if (errorMessage) {
      // TODO: show error message
      return;
    }

    const { name, type } = file;
    const extension = name.slice((name.lastIndexOf(".") - 1 >>> 0) + 2);
    let newFilename = `${mediaType}-${randomHex(32)}`;
    if (extension && extension.length > 0) {
      newFilename += `.${extension}`;
    }
    const previewUrl = URL.createObjectURL(file);
    this.setState({
      previewImageUrl: previewUrl,
      showModal: true,
      cdnFilename: `images/${newFilename}`,
      contentType: type,
    });
  }

  onFileUploadToR2(): void {
    const { cropper, cdnFilename, contentType } = this.state;
    if (!cropper || !cdnFilename) {
      return;
    }
    this.setState({ uploadStatus: UPLOAD_STATUS__START });
    cropper.getCroppedCanvas().toBlob((blob) => {
      if (!blob) return;
      
      cropper.disable();

      // Create a File from the Blob
      const file = new File([blob], cdnFilename, { type: 'image/png' });

      Requests.upload(
        file,
        cdnFilename,
        (percentage) => {
          this.setState({
            progressText: `${parseFloat((percentage * 100.0).toString()).toFixed(2)}%`,
          });
        },
        (cdnUrl, arrayBuffer) => {
          this.props.onImageUploaded(cdnUrl, contentType);
          cropper.destroy();
          this.setState({
            ...this.initState,
            currentImageUrl: cdnUrl,
          });
        },
        () => {
          showToast('Failed to upload. Please refresh this page and try again.', 'error', 2000);
          this.setState({ ...this.initState });
        },
        (error: Error | Event) => {
          this.setState({ ...this.initState }, () => {
            if (error instanceof Error && (error as AxiosError).response === undefined) {
              showToast('Network error. Please refresh the page and try again.', 'error');
            } else {
              showToast('Failed. Please try again.', 'error');
            }
          });
        }
      );
    }, 'image/png');
  }

  render(): JSX.Element {
    const {
      uploadStatus,
      currentImageUrl,
      progressText,
      showModal,
      publicBucketUrl,
      previewImageUrl,
      imageWidth,
      imageHeight
    } = this.state;

    const absoluteImageUrl = currentImageUrl ? urlJoinWithRelative(publicBucketUrl, currentImageUrl) : null;
    const fileTypes = ['PNG', 'JPG', 'JPEG'];
    const uploading = uploadStatus === UPLOAD_STATUS__START;
    const { imageSizeNotOkayFunc, imageSizeNotOkayMsgFunc } = this.props;
    const imageSizeNotOkay = imageSizeNotOkayFunc
      ? imageSizeNotOkayFunc(imageWidth, imageHeight)
      : imageWidth < 1400 || imageHeight < 1400;
    const imageSizeNotOkayMsg = imageSizeNotOkayMsgFunc
      ? imageSizeNotOkayMsgFunc(imageWidth, imageHeight)
      : `Image too small: ${parseInt(imageWidth.toString())} x ${parseInt(imageHeight.toString())} pixels. ` +
        "If it's for a podcast image, Apple Podcasts requires the image to have 1400 x 1400 to 3000 x 3000 pixels.";

    return (
      <div className="lh-upload-wrapper">
        <FileUploaderWrapper
          handleChange={this.onFileUpload}
          name="imageUploader"
          types={fileTypes}
          disabled={uploading}
          classes="lh-upload-fileinput"
        >
          <div className="lh-upload-image-size lh-upload-box">
            {absoluteImageUrl ? (
              <PreviewImage url={absoluteImageUrl} />
            ) : (
              <EmptyImage fileTypes={fileTypes} />
            )}
          </div>
        </FileUploaderWrapper>
        {absoluteImageUrl && (
          <div className="text-sm flex justify-center mt-1">
            <ExternalLink
              linkClass="text-helper-color text-xs"
              text="preview image"
              url={absoluteImageUrl}
            />
          </div>
        )}
        <AdminDialog
          isOpen={showModal}
          setIsOpen={(trueOrFalse) => this.setState({ showModal: trueOrFalse })}
          disabledClose={uploading}
          title="Crop Image"
        >
          {previewImageUrl && (
            <div>
              <img
                className="w-full"
                src={previewImageUrl}
                alt="Upload preview"
                onLoad={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  const target = e.target as HTMLImageElement;
                  const { clientWidth, clientHeight } = target;
                  const size = Math.min(clientWidth, clientHeight);
                  const options: Cropper.Options = {
                    aspectRatio: 1.0,
                    viewMode: 1,
                    cropBoxResizable: true,
                    crop: (event: Cropper.CropEvent) => {
                      const { width, height } = event.detail;
                      this.setState({ imageWidth: width, imageHeight: height });
                    },
                    ready: () => {
                      if (this.state.cropper) {
                        this.state.cropper.setCropBoxData({ width: size, height: size });
                      }
                    }
                  };
                  const cropper = new Cropper(target, options);
                  this.setState({ cropper });
                }}
              />
            </div>
          )}
          <div className="mt-4 flex justify-center">
            <button
              className="lh-btn lh-btn-brand-dark"
              onClick={this.onFileUploadToR2}
              disabled={uploading}
            >
              {uploading ? `Uploading... ${progressText}` : 'Upload'}
            </button>
          </div>
          {imageWidth > 0 && imageHeight > 0 && (
            <div
              className={clsx(
                "mt-2 text-xs text-center",
                imageSizeNotOkay ? 'text-red-500' : 'text-green-500'
              )}
            >
              {imageSizeNotOkay ? (
                <div>{imageSizeNotOkayMsg}</div>
              ) : (
                <div>
                  Image ok: {parseInt(imageWidth.toString())} x {parseInt(imageHeight.toString())} pixels.
                </div>
              )}
            </div>
          )}
        </AdminDialog>
      </div>
    );
  }
}