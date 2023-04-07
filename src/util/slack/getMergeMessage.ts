import { addTextWithMarkdown } from '@/util/slack/addTextWithMarkdown';
import type { slackMergeRequestMessage } from '@/types/index';

/**
 * Creates a Slack message for a new merge request.
 *
 * @param mergeRequest The merge request object to create the Slack message for.
 * @returns The created Slack message object.
 */
function createSlackMessage(mergeRequest: slackMergeRequestMessage) {
  // Create the basic message object with the merge request ID and an empty array of blocks.
  const message = {
    text: mergeRequest.id,
    blocks: [],
  };

  // Define the text for the merge request information.
  const text = `*New Merge Request Created for ${mergeRequest.name}*\n\nA new merge request has been created for the \`${mergeRequest.source_branch}\` branch into \`${mergeRequest.target_branch}\`:\n\n- *Title:* ${mergeRequest.title}\n- *Author:* ${mergeRequest.user}\n- *Link:* ${mergeRequest.url}\n\nPlease review the changes and leave any feedback or comments on the merge request page in GitLab.`;

  // Add the formatted text to the message blocks using the addTextWithMarkdown util function.
  addTextWithMarkdown(message, text);

  // Return the created Slack message.
  return message;
}

export { createSlackMessage };
