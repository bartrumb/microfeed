export interface SubscribeMethod {
  name: string;
  type: string;
  url: string;
  image: string;
  enabled: boolean;
  editable: boolean;
  id: string;
}

export interface SubscribeSettings {
  methods?: SubscribeMethod[];
}

export interface SubscribeSettingsAppProps {
  settings: SubscribeSettings;
  onSave: (settings: SubscribeSettings) => Promise<void>;
}

export interface NewSubscribeDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onAdd: (method: Omit<SubscribeMethod, 'id'>) => void;
}