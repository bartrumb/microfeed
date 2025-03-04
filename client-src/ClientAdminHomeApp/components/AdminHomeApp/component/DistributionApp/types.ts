export interface DistributionBundle {
  label: 'rss' | 'web' | 'json';
  url: string;
  summary: string;
  details: JSX.Element;
}

export interface DistributionAppProps {
  // No props required for this component
}

export interface DistributionAppState {
  // No state required for this component
}