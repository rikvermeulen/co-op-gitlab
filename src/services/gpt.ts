import { Configuration, OpenAIApi } from 'openai';

import { config } from '@/server/Config';

const { OPENAI_KEY, OPENAI_ORG } = config;

export const chatModels = ['gpt-4', 'gpt-3.5-turbo', 'gpt-3.5-turbo-0301'] as const;
export type AvailableChatModels = (typeof chatModels)[number];

class GPT {
  private user: string;
  private system: string;
  private model: AvailableChatModels;
  private tokens: number;
  private temperature: number;

  constructor(user: string, system: string, model: AvailableChatModels) {
    this.user = user;
    this.system = system;
    this.model = model;
    this.tokens = 2048;
    this.temperature = 0.2;
  }

  async connect(): Promise<any> {
    const configuration = new Configuration({
      organization: OPENAI_ORG,
      apiKey: OPENAI_KEY,
    });

    const openai = new OpenAIApi(configuration);

    if (!openai) {
      throw new Error(`No configuration found`);
    }

    try {
      const chatResponse = await openai.createChatCompletion({
        model: this.model,
        messages: [
          { role: 'system', content: `${this.system}` },
          { role: 'user', content: `${this.user}` },
        ],
        max_tokens: this.tokens,
        temperature: this.temperature,
      });

      if (!chatResponse.data.choices[0]) {
        throw new Error(`No response from OpenAI`);
      }

      return chatResponse.data.choices[0].message?.content;
    } catch (error) {
      throw new Error(`Error sending message to Slack: ${error}`);
    }
  }
}

export { GPT };
