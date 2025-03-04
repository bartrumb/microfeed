export interface WhatsNewItem {
  id: string;
  title: string;
  _microfeed: {
    web_url: string;
    date_published_short: string;
  };
}

export interface WhatsNewResponse {
  items: WhatsNewItem[];
}

export interface WhatsNewAppProps {
  // No props required for this component
}

export interface WhatsNewAppState {
  items: WhatsNewItem[];
  fetchStatus: number | null;
}