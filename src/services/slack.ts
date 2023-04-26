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

  // Function to send a message to the channel
  async sendMessage(text: Object, ts?: string): Promise<void> {
    try {
      const result = await this.web.chat.postMessage({
        channel: this.channel,
        ...text,
        ...(ts && { thread_ts: ts }),
        unfurl_links: false,
        unfurl_media: false,
      });

      logger.status('Slack message sent to', result.channel);
    } catch (error) {
      logger.error(`Error sending message to Slack: ${error}`);
      throw new Error(`Error sending message to Slack: ${error}`);
    }
  }

  // Function to send a reaction<emoji> to a message
  async sendReaction(emoji: string, ts: string): Promise<void> {
    try {
      const result = await this.web.reactions.add({
        channel: this.channel,
        timestamp: ts,
        name: emoji,
      });

      logger.status('Slack message sent to', result.channel);
    } catch (error) {
      logger.error(`Error sending reaction to Slack: ${error}`);
      throw new Error(`Error sending reaction to Slack: ${error}`);
    }
  }

  // Function to delete all messages from the bot in the channel
  async deleteAllMessages(): Promise<void> {
    try {
      let allMessages = await this.web.conversations.history({
        channel: this.channel,
        limit: 1000,
      });

      const messages = allMessages.messages || [];

      if (messages.length === 0) {
        logger.error(`No messages to delete`);
        throw new Error(`No messages to delete`);
      }

      logger.status(`Deleting ${messages.length} messages...`);

      for (const message of messages) {
        if (!message.ts) return;
        if (message.bot_profile) continue;
        await this.web.chat.delete({
          channel: this.channel,
          ts: message.ts,
        });
      }

      logger.success('All messages deleted');
    } catch (error) {
      logger.error(`Error deleting message to Slack: ${error}`);
      throw new Error(`Error deleting message to Slack: ${error}`);
    }
  }
}

export { Slack };
