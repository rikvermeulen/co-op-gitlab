import { WebClient } from '@slack/web-api';
import { config } from '@/server/Config';

const { SLACK_BOT_TOKEN, SLACK_CHANNEL } = config;

const web = new WebClient(SLACK_BOT_TOKEN);

/**
 * Get the timestamp for a Slack message with the given ID.
 *
 * @param messageId The ID of the Slack message to get the timestamp for.
 * @param limit The maximum number of messages to fetch from the Slack channel.
 * @returns The timestamp of the Slack message with the given ID.
 * @throws An error if the message is not found.
 */
async function getTimeStampMessage(messageId: number, limit = 30): Promise<string> {
  try {
    const channel = SLACK_CHANNEL as string;

    const { messages } = await web.conversations.history({ channel, limit });

    const message = messages?.find((m) => m.text === messageId.toString());

    if (!message?.ts) throw new Error(`Message not found in channel ${channel}`);

    return message.ts;
  } catch (error) {
    throw new Error(`Error getting timestamp for message ${messageId}: ${error}`);
  }
}

export { getTimeStampMessage };
