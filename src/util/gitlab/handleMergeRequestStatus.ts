import { Logger } from '@/server/Logger';

import { FAILED_LABEL, IN_PROGRESS_LABEL, NOT_SUPPORTED_LABEL, SUCCESS_LABEL } from '@/util/consts';
import { handleChanges } from '@/util/gitlab/handleChanges';
import { LabelManager } from '@/util/gitlab/labelManager';
import glossary from '@/util/glossary';
import { SlackManager } from '@/util/slack/slackManager';

const slack = new SlackManager();
/**
 * This function handles the opening of a GitLab MergeRequest.
 */
async function handleMergeRequestOpen(
  id: number,
  iid: number,
  sourceBranch: string,
  action: string,
  message: string,
): Promise<void> {
  const label = new LabelManager();

  if (action === 'open') slack.messageWithMarkdown(id, message);

  try {
    label.create(id, iid, IN_PROGRESS_LABEL);

    const result = await handleChanges(id, iid, sourceBranch);

    if (result) {
      label.create(id, iid, SUCCESS_LABEL);
      handleSlackMessaging(id, ':speech_balloon:', glossary.slack_message_feedback);
    } else {
      label.create(id, iid, NOT_SUPPORTED_LABEL);
      handleSlackMessaging(id, ':triangular_flag_on_post:', glossary.slack_message_not_valid);
    }
  } catch (error) {
    label.create(id, iid, FAILED_LABEL);
    Logger.error(`Error validating merge request: ${error}`);
    throw error;
  }
}

/**
 * This function handles a updated GitLab MergeRequest.
 */

async function handleMergeRequestUpdated(): Promise<void> {
  try {
    Logger.info('Update is triggerd');
  } catch (error) {
    Logger.error(`Error validating merge request: ${error}`);
    throw error;
  }
}

/**
 * This function handles a merged GitLab MergeRequest.
 */

async function handleMergeRequestMerged(id: number): Promise<void> {
  try {
    handleSlackMessaging(id, 'white_check_mark');
  } catch (error) {
    Logger.error(`Error validating merge request: ${error}`);
    throw error;
  }
}

// Utility function to handle Slack messaging
function handleSlackMessaging(id: number, emoji?: string, message?: string) {
  if (emoji) slack.emoji(id, emoji);
  if (message) slack.thread(id, message);
}

export { handleMergeRequestOpen, handleMergeRequestUpdated, handleMergeRequestMerged };
