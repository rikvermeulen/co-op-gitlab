import { Configuration, OpenAIApi } from 'openai';
import { config } from '@/server/Config.js';

const { OPENAI_KEY, OPENAI_ORG } = config;

export const chatModels = ['gpt-4', 'gpt-3.5-turbo', 'gpt-3.5-turbo-0301'] as const;
export type AvailableChatModels = typeof chatModels[number];

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

export { GPT };
