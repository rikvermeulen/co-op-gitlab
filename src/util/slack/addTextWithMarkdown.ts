/**
 * Adds text with Markdown formatting to a Slack message
 *
 * @param message The Slack message to add the text to
 * @param text The text to add
 * @param bold Whether to make the text bold or not
 * @param italic Whether to make the text italic or not
 */

export type slackMergeRequestMessage = {
  blocks: {
    push(arg0: { type: string; text: { type: string; text: string } }): unknown;
  };
};

export function addTextWithMarkdown(
  message: slackMergeRequestMessage,
  text: string,
  bold = false,
  italic = false,
): void {
  let formattedText = text;

  if (bold) {
    formattedText = `*${formattedText}*`;
  }

  if (italic) {
    formattedText = `_${formattedText}_`;
  }

  message.blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: formattedText,
    },
  });
}
