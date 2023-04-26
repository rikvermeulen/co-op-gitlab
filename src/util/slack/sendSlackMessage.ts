import { addTextWithMarkdown } from '@/util/slack/addTextWithMarkdown';
import { Slack } from '@/services/slack';
import { logger } from '@/server/Logger';

import type { GitlabMergeEvent } from '@/types/index';

/**
 * Creates a Slack message for a new merge request.
 *
 * @param mergeRequest The merge request object to create the Slack message for.
 * @returns The created Slack message object.
 */

const slack = new Slack();

function sendSlackMessage(payload: GitlabMergeEvent) {
  const {
    project: { id, name },
    object_attributes: { title, url, source_branch, target_branch },
    user: { name: user },
  } = payload;

  const message = {
    text: id,
    blocks: [],
  };

  try {
    const labels = payload.labels.map((label) => label.title).join(', ');

    // Define the text for the merge request information.
    const text = `*New Merge Request Created for '${name}'*\n\nA new merge request has been created for the \`${source_branch}\` branch into \`${target_branch}\`:\n\n*Title:* ${title}\n*Author:* ${user}\n*Link:* ${url}\n*Labels:* ${labels}\n\n @channel Please review the changes and leave any feedback or comments on the merge request page in GitLab.`;

    // Add the formatted text to the message blocks using the addTextWithMarkdown util function.
    addTextWithMarkdown(message, text);

    // Return the created Slack message.
    slack.sendMessage(message);
  } catch (error) {
    logger.error(`Failed to create Slack message for merge request with ID ${id}: ${error}`);
    throw new Error(`Failed to create Slack message for merge request with ID ${id}: ${error}`);
  }
}

export { sendSlackMessage };
