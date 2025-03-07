import React from "react";
import ReactQuill from "react-quill";
import {FileUploader} from "react-drag-drop-files";
import AdminDialog from "../../../AdminDialog";
import AdminRadio from "../../../AdminRadio";
import AdminInput from "../../../AdminInput";
import {CloudArrowUpIcon} from "@heroicons/react/24/outline";
import {ENCLOSURE_CATEGORIES_DICT, ENCLOSURE_CATEGORIES} from "../../../../../common-src/constants";
import {randomHex, urlJoinWithRelative} from "../../../../../common-src/StringUtils";
import Requests from "../../../../common/requests";
import {showToast} from "../../../../common/ToastUtils";

const UPLOAD_STATUS__START = 1;

interface FromUrlProps {
  url: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInsert: (e: React.FormEvent) => void;
}

interface UploadNewFileProps {
  uploading: boolean;
  onFileUpload: (file: File) => void;
  mediaType: 'image' | 'video';
  progressText: string | null;
}

interface RichEditorMediaDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  mediaType: 'image' | 'video';
  quill: {
    insertEmbed: (index: number, type: string, url: string, source: string) => void;
  } | null;
  quillSelection: { index: number; length: number } | null;
  extra?: {
    publicBucketUrl?: string;
    folderName?: string;
  };
}

interface RichEditorMediaDialogState {
  url: string | null;
  mode: 'upload' | 'url';
  uploadStatus: number | null;
  progressText: string | null;
}

function FromUrl({url, onChange, onInsert}: FromUrlProps) {
  let disabled = false;
  if (!url || url.length <= 3) {
    disabled = true;
  }
  return (
    <form>
      <div>
        <AdminInput
          label=""
          value={url || ''}
          type="url"
          placeholder="e.g., https://example.com/something.jpg"
          onChange={onChange}
        />
      </div>
      <div className="py-4 flex justify-center">
        <button 
          type="submit" 
          className="lh-btn lh-btn-brand-dark" 
          disabled={disabled} 
          onClick={onInsert}
        >
          Insert
        </button>
      </div>
    </form>
  );
}

function UploadNewFile({uploading, onFileUpload, mediaType, progressText}: UploadNewFileProps) {
  const {fileTypes} = mediaType === 'image' 
    ? ENCLOSURE_CATEGORIES_DICT[ENCLOSURE_CATEGORIES.IMAGE] 
    : ENCLOSURE_CATEGORIES_DICT[ENCLOSURE_CATEGORIES.VIDEO];

  return (
    <div className="lh-upload-wrapper">
      <FileUploader
        handleChange={onFileUpload}
        name="audioUploader"
        types={fileTypes}
        disabled={uploading}
        classes="lh-upload-fileinput"
      >
        <div className="w-full h-24 lh-upload-box p-4 flex items-center justify-center">
          {uploading ? (
            <div className="text-helper-color">
              <div className="font-semibold">Uploading...</div>
              <div className="text-sm">{progressText}</div>
            </div>
          ) : (
            <div className="text-brand-light">
              <div className="flex items-center">
                <div className="mr-1"><CloudArrowUpIcon className="w-8"/></div>
                <div className="font-semibold">Click or drag here to upload {mediaType}</div>
              </div>
              <div className="text-sm">{fileTypes.join(', ')}</div>
            </div>
          )}
        </div>
      </FileUploader>
    </div>
  );
}

export default class RichEditorMediaDialog extends React.Component<RichEditorMediaDialogProps, RichEditorMediaDialogState> {
  constructor(props: RichEditorMediaDialogProps) {
    super(props);

    this.state = {
      url: null,
      mode: 'upload',
      uploadStatus: null,
      progressText: null,
    };
  }

  onFileUpload = (file: File) => {
    const {mediaType, setIsOpen} = this.props;
    this.setState({uploadStatus: UPLOAD_STATUS__START});
    const {name} = file;
    const extension = name.slice((name.lastIndexOf('.') - 1 >>> 0) + 2);
    let newFilename = `${mediaType}-${randomHex(32)}`;
    if (extension && extension.length > 0) {
      newFilename += `.${extension}`;
    }
    const extra = this.props.extra || {};
    const publicBucketUrl = extra.publicBucketUrl || '';
    const folderName = extra.folderName || 'unknown';
    const cdnFilename = `media/rich-editor/${folderName}/${newFilename}`;

    Requests.upload(
      file, 
      cdnFilename, 
      (percentage: number) => {
        this.setState({progressText: `${parseFloat((percentage * 100.0).toString()).toFixed(2)}%`});
      }, 
      (cdnUrl: string) => {
        const url = urlJoinWithRelative(publicBucketUrl, cdnUrl);
        this.setState({
          url,
          progressText: 'Done!',
          uploadStatus: null,
        }, () => {
          this.insertMedia();
          setIsOpen(false);
        });
      }, 
      () => {
        this.setState({uploadStatus: null, progressText: null}, () => {
          setIsOpen(false);
          showToast('Failed. Please try again.', 'error');
        });
      }, 
      (error: unknown) => {
        this.setState({uploadStatus: null, progressText: null}, () => {
          setIsOpen(false);
          if (error && typeof error === 'object' && 'response' in error) {
            showToast('Failed. Please try again.', 'error');
          } else {
            showToast('Network error. Please refresh the page and try again.', 'error');
          }
        });
      }
    );
  }

  insertMedia = () => {
    const {quill, quillSelection, mediaType} = this.props;
    if (!quill) {
      return;
    }
    const {url} = this.state;
    if (url) {
      const index = quillSelection ? quillSelection.index : 0;
      // Using string literal for source since ReactQuill doesn't export Sources type
      quill.insertEmbed(index, mediaType, url, 'user');
      this.setState({url: null});
    }
  }

  render() {
    const {
      isOpen,
      setIsOpen,
      mediaType,
    } = this.props;
    const {mode, url, uploadStatus, progressText} = this.state;
    const disabledClose = false;
    const uploading = uploadStatus === UPLOAD_STATUS__START;

    return (
      <AdminDialog
        title={`Insert ${mediaType}`}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        disabledClose={disabledClose}
      >
        <div className="pt-4 pb-8">
          <AdminRadio
            label=""
            groupName="media-insert"
            buttons={[
              {
                name: 'Upload a new file',
                value: 'upload',
                checked: mode === 'upload',
              },
              {
                name: 'From URL',
                value: 'url',
                checked: mode === 'url',
              },
            ]}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              this.setState({mode: e.target.value as 'upload' | 'url'});
            }}
            disabled={false}
          />
        </div>
        <div>
          {mode === 'upload' ? (
            <UploadNewFile
              mediaType={mediaType}
              uploading={uploading}
              progressText={progressText}
              onFileUpload={this.onFileUpload}
            />
          ) : (
            <FromUrl
              url={url}
              onChange={(e) => this.setState({url: e.target.value})}
              onInsert={(e) => {
                e.preventDefault();
                this.insertMedia();
                setIsOpen(false);
              }}
            />
          )}
        </div>
      </AdminDialog>
    );
  }
}