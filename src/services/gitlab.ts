import fetch, { Response } from 'node-fetch';
import { config } from '../../server/Config.js';

const { GITLAB_HOST, GITLAB_TOKEN } = config;

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
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error connecting to GitLab:', error);
      return null;
    }
  }
}

export { GitLab };
