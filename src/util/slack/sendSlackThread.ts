import { getTimeStampMessage } from '@/util/slack/getTimeStamp';
import { Slack } from '@/services/slack';

const slack = new Slack();

async function sendSlackThread(id: number, text: string, emoji?: string): Promise<void> {
  try {
    const timestamp = await getTimeStampMessage(id);
    await slack.sendMessage({ text: text }, timestamp);

    if (emoji) {
      await slack.sendReaction(emoji, timestamp);
    }
  } catch (error) {
    console.error(`Failed to finalize merge request with ID ${id}:`, error);
  }
}

export { sendSlackThread };
