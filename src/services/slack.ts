import { WebClient } from '@slack/web-api';
import { config } from '@/server/Config';
import { Logger } from '@/server/Logger';

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

      Logger.status('Slack message sent to', result.channel);
    } catch (error) {
      Logger.error(`Error sending message to Slack: ${error}`);
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

      Logger.status('Slack message sent to', result.channel);
    } catch (error) {
      Logger.error(`Error sending reaction to Slack: ${error}`);
    }
  }

  // Function to delete all messages from the bot in the channel
  async deleteMessages(): Promise<void> {
    try {
      const history = await this.web.conversations.history({
        channel: this.channel,
        limit: 1000,
      });

      const messages = history.messages || [];

      if (!messages.length) {
        Logger.error('No messages to delete');
        return;
      }

      Logger.status(`Deleting ${messages.length} messages...`);

      for (const message of messages) {
        // Delete main channel messages from bot
        if (message.ts && message.bot_profile) {
          await this.deleteMessage(message.ts);
        }

        // Check if there are thread replies
        if (message.reply_users && message.ts) {
          await this.deleteThreadReplies(message.ts);
        }
      }

      Logger.success('All messages deleted');
    } catch (error) {
      Logger.error(`Error deleting message to Slack: ${error}`);
    }
  }

  async deleteMessage(ts: string): Promise<void> {
    try {
      await this.web.chat.delete({
        channel: this.channel,
        ts,
      });
    } catch (error) {
      Logger.error(`Error deleting message with ts=${ts}: ${error}`);
    }
  }

  async deleteThreadReplies(parentTs: string): Promise<void> {
    try {
      const threadReplies = await this.web.conversations.replies({
        channel: this.channel,
        ts: parentTs,
      });

      if (!threadReplies.messages) return;

      // Delete thread replies from bot
      for (const reply of threadReplies.messages) {
        if (reply.bot_profile && reply.ts) {
          await this.deleteMessage(reply.ts);
        }
      }
    } catch (error) {
      Logger.error(`Error deleting thread replies to message with ts=${parentTs}: ${error}`);
    }
  }

  async getTimeStamp(id: number, limit = 30): Promise<string> {
    try {
      const { messages } = await this.web.conversations.history({
        channel: this.channel,
        limit: limit,
      });

      const message = messages?.find((m) => m.text === id.toString());

      if (!message?.ts) throw new Error(`Message not found in channel ${this.channel}`);

      return message.ts;
    } catch (error) {
      Logger.error(`Error getting timestamp for message ${id}: ${error}`);
      return '';
    }
  }
}

export { Slack };
