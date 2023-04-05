import { WebClient } from '@slack/web-api';
import { config } from '@/server/Config';
import { logger } from '@/server/Logger';

const { SLACK_BOT_TOKEN } = config;

class Slack {
  private web: WebClient;

  constructor() {
    this.web = new WebClient(SLACK_BOT_TOKEN);
  }

  async sendMessage(channel: string, text: string): Promise<void> {
    try {
      const result = await this.web.chat.postMessage({
        channel: channel,
        text: text,
      });

      logger.status('Slack message sent', result);
    } catch (error) {
      logger.error('Error sending message to Slack:', error);
    }
  }
}

export { Slack };
