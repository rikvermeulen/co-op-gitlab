import { Logger } from '@/server/Logger';

import { Slack } from '@/services/slack';
import { getTimeStampMessage } from '@/util/slack/getTimeStampMessage';

const slack = new Slack();

class SlackManager {
  async message(message: Object): Promise<void> {
    try {
      // Return the created Slack message.
      slack.sendMessage(message);
    } catch (error) {
      Logger.error(`Failed to create Slack message for merge request: ${error}`);
    }
  }

  async thread(id: number, text: string): Promise<void> {
    try {
      const timestamp = await getTimeStampMessage(id);
      await slack.sendMessage({ text: text }, timestamp);
    } catch (error) {
      Logger.error(`Failed to add message to slack thread ${id}: ${error}`);
    }
  }

  async emoji(id: number, emoji: string): Promise<void> {
    try {
      const timestamp = await getTimeStampMessage(id);

      await slack.sendReaction(emoji, timestamp);
    } catch (error) {
      Logger.error(`Failed to add emoji to slack thread ${id}: ${error}`);
    }
  }
}

export { SlackManager };
