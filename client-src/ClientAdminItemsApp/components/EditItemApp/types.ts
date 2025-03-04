import { OnboardingResult } from '../../../../common-src/types/FeedContent';

export interface MediaFile {
  category: number;
  url: string;
  durationSecond?: number;
  contentType?: string;
}

export interface ItunesMetadata {
  'itunes:explicit'?: boolean;
  'itunes:block'?: boolean;
  'itunes:episodeType'?: 'full' | 'trailer' | 'bonus';
  'itunes:title'?: string;
  'itunes:season'?: number;
  'itunes:episode'?: number;
}

export interface Item extends ItunesMetadata {
  id?: string;
  status: number;
  pubDateMs: number;
  guid?: string;
  title?: string;
  link?: string;
  description?: string;
  image?: string;
  mediaFile?: MediaFile;
}

export interface WebGlobalSettings {
  publicBucketUrl: string;
  [key: string]: any;
}

export interface Feed {
  items: Record<string, Item>;
  item?: Item;
  settings: {
    webGlobalSettings: WebGlobalSettings;
    [key: string]: any;
  };
}

export interface EditItemAppProps {
  // No props required for this component
}

export interface EditItemAppState {
  feed: Feed;
  onboardingResult: OnboardingResult;
  item: Item;
  submitStatus: number | null;
  itemId: string;
  action: 'edit' | 'create';
  userChangedLink: boolean;
  changed: boolean;
}

export type StateUpdate = Partial<EditItemAppState>;

export interface MediaManagerProps {
  labelComponent: React.ReactNode;
  feed: Feed;
  initMediaFile: Partial<MediaFile>;
  onMediaFileUpdated: (mediaFile: MediaFile) => void;
}

export interface AdminRadioButton {
  name: string;
  value?: string | number;
  checked: boolean;
}

export interface AdminRadioProps {
  labelComponent: React.ReactNode;
  groupName: string;
  buttons: AdminRadioButton[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface AdminInputProps {
  labelComponent?: React.ReactNode;
  value?: string | number;
  type?: string;
  extraParams?: Record<string, string>;
  setRef?: (ref: HTMLInputElement | null) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface AdminDatetimePickerProps {
  label: string | null;
  labelComponent?: React.ReactNode | null;
  value?: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface AdminRichEditorProps {
  labelComponent: React.ReactNode;
  value?: string;
  onChange: (value: string) => void;
  extra?: {
    publicBucketUrl: string;
    folderName: string;
  };
}

export interface AdminImageUploaderProps {
  mediaType: string;
  feed: Feed;
  currentImageUrl?: string;
  onImageUploaded: (url: string) => void;
}

export const DEFAULT_FEED: Feed = {
  items: {},
  settings: {
    webGlobalSettings: {
      publicBucketUrl: '',
    }
  }
};

export const DEFAULT_ITEM: Item = {
  status: 1, // STATUSES.PUBLISHED
  pubDateMs: 0,
  'itunes:explicit': false,
  'itunes:block': false,
  'itunes:episodeType': 'full'
};

export type ItemUpdate = Partial<Item>;

export interface FeedUpdate {
  items?: Record<string, Item>;
  [key: string]: any;
}

export type SetStateCallback = (prevState: EditItemAppState) => EditItemAppState;
export type SetStateAction = EditItemAppState | SetStateCallback;