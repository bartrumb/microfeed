import { FeedContent, SettingsData, SETTINGS_CATEGORY } from '../../common-src/types/FeedContent';

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  link: string;
}

interface ThemeTypography {
  fontFamily: string;
  fontSize: string;
  lineHeight: string;
  headingFont: string;
}

interface ThemeLayout {
  maxWidth: string;
  spacing: string;
  borderRadius: string;
}

interface ThemeConfig {
  colors: ThemeColors;
  typography: ThemeTypography;
  layout: ThemeLayout;
}

interface ThemeSection {
  html: string;
}

class Theme {
  private content: FeedContent;
  private settings: SettingsData;
  private config: ThemeConfig;
  private codeType: SETTINGS_CATEGORY;

  constructor(content: FeedContent, settings: SettingsData, codeType: SETTINGS_CATEGORY = SETTINGS_CATEGORY.CUSTOM_CODE) {
    this.content = content;
    this.settings = settings;
    this.codeType = codeType;
    this.config = this.initializeConfig();
  }

  private initializeConfig(): ThemeConfig {
    const customCode = this.settings[SETTINGS_CATEGORY.CUSTOM_CODE] || {};
    const customTheme = (customCode as Record<string, any>).theme || {};

    return {
      colors: {
        primary: customTheme.primaryColor || '#007bff',
        secondary: customTheme.secondaryColor || '#6c757d',
        accent: customTheme.accentColor || '#28a745',
        background: customTheme.backgroundColor || '#ffffff',
        text: customTheme.textColor || '#212529',
        link: customTheme.linkColor || '#007bff'
      },
      typography: {
        fontFamily: customTheme.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        fontSize: customTheme.fontSize || '16px',
        lineHeight: customTheme.lineHeight || '1.5',
        headingFont: customTheme.headingFont || 'inherit'
      },
      layout: {
        maxWidth: customTheme.maxWidth || '1200px',
        spacing: customTheme.spacing || '1rem',
        borderRadius: customTheme.borderRadius || '0.25rem'
      }
    };
  }

  getWebHeader(): ThemeSection {
    const customCode = this.settings[SETTINGS_CATEGORY.CUSTOM_CODE] || {};
    return {
      html: (customCode as Record<string, any>).webHeader || ''
    };
  }

  getWebBodyStart(): ThemeSection {
    const customCode = this.settings[SETTINGS_CATEGORY.CUSTOM_CODE] || {};
    return {
      html: (customCode as Record<string, any>).webBodyStart || ''
    };
  }

  getWebBodyEnd(): ThemeSection {
    const customCode = this.settings[SETTINGS_CATEGORY.CUSTOM_CODE] || {};
    return {
      html: (customCode as Record<string, any>).webBodyEnd || ''
    };
  }

  getWebItem(item: any): ThemeSection {
    const customCode = this.settings[SETTINGS_CATEGORY.CUSTOM_CODE] || {};
    return {
      html: (customCode as Record<string, any>).webItem || ''
    };
  }

  generateCss(): string {
    return `
      :root {
        --primary-color: ${this.config.colors.primary};
        --secondary-color: ${this.config.colors.secondary};
        --accent-color: ${this.config.colors.accent};
        --background-color: ${this.config.colors.background};
        --text-color: ${this.config.colors.text};
        --link-color: ${this.config.colors.link};
        
        --font-family: ${this.config.typography.fontFamily};
        --font-size: ${this.config.typography.fontSize};
        --line-height: ${this.config.typography.lineHeight};
        --heading-font: ${this.config.typography.headingFont};
        
        --max-width: ${this.config.layout.maxWidth};
        --spacing: ${this.config.layout.spacing};
        --border-radius: ${this.config.layout.borderRadius};
      }

      body {
        font-family: var(--font-family);
        font-size: var(--font-size);
        line-height: var(--line-height);
        color: var(--text-color);
        background-color: var(--background-color);
      }

      h1, h2, h3, h4, h5, h6 {
        font-family: var(--heading-font);
      }

      a {
        color: var(--link-color);
        text-decoration: none;
      }

      a:hover {
        text-decoration: underline;
      }

      .container {
        max-width: var(--max-width);
        margin: 0 auto;
        padding: var(--spacing);
      }

      .btn {
        display: inline-block;
        padding: calc(var(--spacing) * 0.5) var(--spacing);
        border-radius: var(--border-radius);
        background-color: var(--primary-color);
        color: white;
        text-decoration: none;
        cursor: pointer;
        border: none;
      }

      .btn:hover {
        opacity: 0.9;
        text-decoration: none;
      }

      .btn-secondary {
        background-color: var(--secondary-color);
      }

      .btn-accent {
        background-color: var(--accent-color);
      }
    `;
  }

  getConfig(): ThemeConfig {
    return this.config;
  }

  updateConfig(newConfig: Partial<ThemeConfig>): void {
    this.config = {
      ...this.config,
      colors: { ...this.config.colors, ...newConfig.colors },
      typography: { ...this.config.typography, ...newConfig.typography },
      layout: { ...this.config.layout, ...newConfig.layout }
    };
  }
}

export default Theme;
