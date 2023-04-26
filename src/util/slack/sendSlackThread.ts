import { Slack } from '@/services/slack';
import { logger } from '@/server/Logger';
import { getTimeStampMessage } from '@/util/slack/getTimeStampMessage';

const slack = new Slack();

async function sendSlackThread(id: number, text: string, emoji?: string): Promise<void> {
  try {
    const timestamp = await getTimeStampMessage(id);
    await slack.sendMessage({ text: text }, timestamp);

    if (emoji) {
      await slack.sendReaction(emoji, timestamp);
    }
  } catch (error) {
    logger.error(`Failed to add message to slack thread ${id}: ${error}`);
    throw new Error(`Failed to add message to slack thread ${id}: ${error}`);
  }
}

export { sendSlackThread };
