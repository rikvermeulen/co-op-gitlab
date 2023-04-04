import fetch, { Response } from 'node-fetch';
import { Configuration, OpenAIApi } from 'openai';
import { config } from '../../server/Config.js';

const { GITLAB_HOST, GITLAB_TOKEN, OPENAI_KEY, OPENAI_ORG } = config;

export const chatModels = ['gpt-4', 'gpt-3.5-turbo', 'gpt-3.5-turbo-0301'] as const;
export type AvailableChatModels = typeof chatModels[number];

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

class GPT {
  private prompt: string;
  private model: AvailableChatModels;
  private tokens: number;
  private temperature: number;

  constructor(prompt: string) {
    this.prompt = prompt;
    this.model = 'gpt-4';
    this.tokens = 2048;
    this.temperature = 0.5;
  }

  async connect(): Promise<any> {
    const configuration = new Configuration({
      organization: OPENAI_ORG,
      apiKey: OPENAI_KEY,
    });

    const openai = new OpenAIApi(configuration);

    if (!openai) {
      return console.error('No configuration found');
    }

    try {
      const chatResponse = await openai.createChatCompletion({
        model: this.model,
        messages: [{ role: 'user', content: `${this.prompt}` }],
        max_tokens: this.tokens,
        temperature: this.temperature,
      });

      if (!chatResponse.data.choices[0]) {
        return console.error('No response from OpenAI');
      }

      return chatResponse.data.choices[0].message?.content;
    } catch (error) {
      return console.log(error);
    }
  }
}

export { GitLab, GPT };
