import fetch, { Response } from 'node-fetch';
import { config } from '@/server/Config';
import { Logger } from '@/server/Logger';

const { GITLAB_HOST, GITLAB_TOKEN } = config.gitlab;

class GitLab {
  private baseURL: string;
  private payload: string;
  private method: string;
  private gitlabHost: string;
  private gitlabToken: string;

  constructor(method: string, baseURL: string, payload?: any) {
    this.baseURL = baseURL;
    this.payload = payload;
    this.method = method || 'GET';
    this.gitlabHost = GITLAB_HOST as string;
    this.gitlabToken = GITLAB_TOKEN as string;
  }

  async connect(): Promise<any> {
    try {
      const response: Response = await fetch(`${this.gitlabHost}/api/v4/${this.baseURL}`, {
        method: this.method,
        headers: {
          Authorization: `Bearer ${this.gitlabToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.payload),
      });

      if (!response.ok) {
        Logger.error('Error while fetching data from gitlab', response.status);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      Logger.error(`Error connecting to GitLab: ${error}`, 503);
    }
  }
}

export { GitLab };
