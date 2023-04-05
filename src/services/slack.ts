import { WebClient } from '@slack/web-api';
import { config } from '@/server/Config';
import { logger } from '@/server/Logger';

const { SLACK_BOT_TOKEN, SLACK_CHANNEL } = config;

class Slack {
  private web: WebClient;
  private channel: string;

  constructor() {
    this.web = new WebClient(SLACK_BOT_TOKEN);
    this.channel = SLACK_CHANNEL as string;
  }

  async sendMessage(text: Object, ts?: string): Promise<void> {
    try {
      const result = await this.web.chat.postMessage({
        channel: this.channel,
        ...text,
        ...(ts && { thread_ts: ts }),
      });

      logger.status('Slack message sent', result);
    } catch (error) {
      logger.error('Error sending message to Slack:', error);
    }
  }

  async sendReaction(ts: string, emoji: string): Promise<void> {
    try {
      const result = await this.web.reactions.add({
        channel: this.channel,
        timestamp: ts,
        name: emoji,
      });

      logger.status('Slack message sent', result);
    } catch (error) {
      logger.error('Error sending message to Slack:', error);
    }
  }

  async deleteAllMessages(): Promise<void> {
    //This func deleltes only messages from the bot
    try {
      let allMessages = await this.web.conversations.history({
        channel: this.channel,
        limit: 1000,
      });

      const messages = allMessages.messages || [];

      if (messages.length === 0) {
        logger.status('No messages to delete');
        return;
      }

      logger.status(`Deleting ${messages.length} messages...`);

      for (const message of messages) {
        if (message.bot_profile) {
          await this.web.chat.delete({
            channel: this.channel,
            ts: message.ts || '',
          });
        }
      }

      logger.success('All messages deleted');
    } catch (error) {
      logger.error(`Error deleting messages: ${error}`);
    }
  }
}

export { Slack };
