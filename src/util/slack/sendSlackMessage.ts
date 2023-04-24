import { addTextWithMarkdown } from '@/util/slack/addTextWithMarkdown';
import { Slack } from '@/services/slack';

import type { GitlabEvent } from '@/types/index';

/**
 * Creates a Slack message for a new merge request.
 *
 * @param mergeRequest The merge request object to create the Slack message for.
 * @returns The created Slack message object.
 */

const slack = new Slack();

function sendSlackMessage(payload: GitlabEvent) {
  const {
    project: { id, name },
    object_attributes: { title, url, source_branch, target_branch },
    user: { name: user },
  } = payload;

  const message = {
    text: id,
    blocks: [],
  };

  // Define the text for the merge request information.
  const text = `*New Merge Request Created for ${name}*\n\nA new merge request has been created for the \`${source_branch}\` branch into \`${target_branch}\`:\n\n- *Title:* ${title}\n- *Author:* ${user}\n- *Link:* ${url}\n\nPlease review the changes and leave any feedback or comments on the merge request page in GitLab.`;

  // Add the formatted text to the message blocks using the addTextWithMarkdown util function.
  addTextWithMarkdown(message, text);

  // Return the created Slack message.
  slack.sendMessage(message);
}

export { sendSlackMessage };
