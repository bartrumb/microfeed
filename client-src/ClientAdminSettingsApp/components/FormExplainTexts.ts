import { ExplainTextProps } from '../../components/types';

export const FORM_EXPLAIN_TEXTS: Record<string, ExplainTextProps> = {
  'access-policy': {
    title: 'Access Policy',
    description: 'Control who can access your feed content.',
    learnMoreUrl: 'https://docs.microfeed.dev/settings/access-policy'
  },
  'api-key': {
    title: 'API Key',
    description: 'Secure key for accessing the API endpoints.',
    learnMoreUrl: 'https://docs.microfeed.dev/settings/api-key'
  },
  'custom-code': {
    title: 'Custom Code',
    description: 'Add custom HTML, CSS, and JavaScript to your feed pages.',
    learnMoreUrl: 'https://docs.microfeed.dev/settings/custom-code'
  },
  'tracking-code': {
    title: 'Tracking Code',
    description: 'Add analytics tracking code to monitor feed usage.',
    learnMoreUrl: 'https://docs.microfeed.dev/settings/tracking'
  }
};