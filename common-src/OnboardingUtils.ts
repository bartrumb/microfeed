import { OnboardingResult } from './types/FeedContent';
import { Env } from './types/CloudflareTypes';

interface OnboardingStatus {
  ready: boolean;
  required: boolean;
}

interface OnboardingResults {
  [key: string]: OnboardingStatus;
}

export class OnboardingChecker {
  private env: Env;
  private results: OnboardingResults;

  constructor(env: Env) {
    this.env = env;
    this.results = {};
  }

  async checkDb(): Promise<void> {
    try {
      const result = await this.env.MICROFEED_DB.prepare('SELECT 1').first();
      this.results.db = {
        ready: !!result,
        required: true
      };
    } catch (error) {
      this.results.db = {
        ready: false,
        required: true
      };
    }
  }

  async checkR2(): Promise<void> {
    try {
      await this.env.MICROFEED_BUCKET.head('test');
      this.results.r2 = {
        ready: true,
        required: true
      };
    } catch (error) {
      this.results.r2 = {
        ready: false,
        required: true
      };
    }
  }

  async checkAll(): Promise<OnboardingResult> {
    await Promise.all([
      this.checkDb(),
      this.checkR2()
    ]);

    const cloudflareUrls = {
      r2BucketSettingsUrl: `https://dash.cloudflare.com/${this.env.CLOUDFLARE_ACCOUNT_ID}/r2/overview/buckets/${this.env.R2_PUBLIC_BUCKET}/settings`,
      addAccessGroupUrl: `https://dash.cloudflare.com/${this.env.CLOUDFLARE_ACCOUNT_ID}/access/groups`,
      addAppUrl: `https://dash.cloudflare.com/${this.env.CLOUDFLARE_ACCOUNT_ID}/access/apps/new`,
      pagesCustomDomainUrl: `https://dash.cloudflare.com/${this.env.CLOUDFLARE_ACCOUNT_ID}/pages/view/${this.env.CLOUDFLARE_PROJECT_NAME}/domains`,
      pagesDevUrl: `${this.env.CLOUDFLARE_PROJECT_NAME}.pages.dev`
    };

    let requiredOk = true;
    let allOk = true;

    for (const key in this.results) {
      if (!this.results[key].ready) {
        allOk = false;
        if (this.results[key].required) {
          requiredOk = false;
        }
      }
    }

    return {
      requiredOk,
      allOk,
      result: this.results,
      cloudflareUrls
    };
  }
}

export async function getOnboardingResult(env: Env): Promise<OnboardingResult> {
  const checker = new OnboardingChecker(env);
  return checker.checkAll();
}
