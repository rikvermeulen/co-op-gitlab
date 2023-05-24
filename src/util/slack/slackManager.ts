import { Logger } from '@/server/Logger';

import { Slack } from '@/services/slack';
import { addTextWithMarkdown } from '@/util/slack/addTextWithMarkdown';

const slack = new Slack();

class SlackManager {
  message(message: Object) {
    try {
      // Return the created Slack message.
      slack.sendMessage(message);
    } catch (error) {
      Logger.error(`Failed to create Slack message for merge request: ${error}`);
    }
  }

  messageWithMarkdown(id: number, text: string) {
    try {
      const message = {
        text: id,
        blocks: [],
      };
      // Add the formatted text to the message blocks using the addTextWithMarkdown util function.
      addTextWithMarkdown(message, text);

      // Return the created Slack message.
      slack.sendMessage(message);
    } catch (error) {
      Logger.error(`Failed to delete messages from Slack: ${error}`);
    }
  }

  deleteMessages() {
    try {
      slack.deleteMessages();
    } catch (error) {
      Logger.error(`Failed to delete messages from Slack: ${error}`);
    }
  }

  async thread(id: number, text: string): Promise<void> {
    try {
      const timestamp = await slack.getTimeStamp(id);
      slack.sendMessage({ text: text }, timestamp);
    } catch (error) {
      Logger.error(`Failed to add message to slack thread ${id}: ${error}`);
    }
  }

  async emoji(id: number, emoji: string): Promise<void> {
    try {
      const timestamp = await slack.getTimeStamp(id);

      slack.sendReaction(emoji, timestamp);
    } catch (error) {
      Logger.error(`Failed to add emoji to slack thread ${id}: ${error}`);
    }
  }
}

export { SlackManager };
