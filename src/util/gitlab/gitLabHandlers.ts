import { config } from '@/server/Config';
import { Logger } from '@/server/Logger';

import type { GitlabMergeEvent, GitlabNoteEvent } from '@/types/index';

import {
  FAILED_LABEL,
  GITLAB_COMMAND,
  IN_PROGRESS_LABEL,
  NOT_SUPPORTED_LABEL,
  SUCCESS_LABEL,
} from '@/util/consts';
import { CommentManager } from '@/util/gitlab/CommentManager';
import { handleMergeRequestFeedback } from '@/util/gitlab/handleMergeRequestFeedback';
import { LabelManager } from '@/util/gitlab/labelManager';
import glossary from '@/util/glossary';
import { SlackManager } from '@/util/slack/slackManager';

const slack = new SlackManager();
const comment = new CommentManager();
const label = new LabelManager();

const SLACK_BOT_TOKEN = config.SLACK_BOT_TOKEN || '';
/**
 * This function handles a GitLab MergeRequest event.
 *
 * @async
 * @function handleMergeRequestEvent
 * @param {GitlabMergeEvent} payload - The GitLab MergeRequest event payload.
 * @returns {Promise<void>} No return value.
 */
async function handleMergeRequestEvent(payload: GitlabMergeEvent): Promise<void> {
  const {
    event_type,
    project: { id, name },
    object_attributes: {
      state,
      action,
      iid,
      work_in_progress,
      source_branch,
      title,
      url,
      target_branch,
    },
    user: { name: user },
  } = payload;

  if (event_type !== 'merge_request') return;

  if (state === 'opened' && !work_in_progress) {
    if (action === 'update') {
      await handleMergeRequestUpdated();
    } else {
      const text = `*New Merge Request Created for '${name}'*\n\nA new merge request has been created for the \`${source_branch}\` branch into \`${target_branch}\`:\n\n*Title:* ${title}\n*Author:* ${user}\n*Link:* ${url}\n\n @channel Please review the changes and leave any feedback or comments on the merge request page in GitLab.`;
      slack.messageWithMarkdown(id, text);

      Logger.status(`Handling event for merge request ${iid} for project ${name}:${id}`);
      await handleMergeRequestOpen(id, iid, source_branch);
    }
  }

  if (state === 'merged') {
    await handleMergeRequestMerged(id);
  }
}

/**
 * This function handles a GitLab Note event.
 *
 * @async
 * @function handleNoteEvent
 * @param {GitlabNoteEvent} payload - The GitLab Note event payload.
 * @returns {Promise<void>} No return value.
 */

async function handleNoteEvent(payload: GitlabNoteEvent): Promise<void> {
  const {
    object_attributes: { noteable_type, note, id },
    merge_request: { iid, source_project_id, source_branch },
    user: { username },
  } = payload;

  if (noteable_type !== 'MergeRequest') return;

  if (note && note.includes(GITLAB_COMMAND)) {
    Logger.info(`Handling note event for merge request ${iid} for project ${source_project_id}`);
    try {
      comment.reply(source_project_id, iid, id, username);

      await handleMergeRequestFeedback(source_project_id, iid, source_branch);
    } catch (error) {
      Logger.error(`Error handling merge request event: ${error}`);
      throw error;
    }
  }

  return;
}

/**
 * This function handles the opening of a GitLab MergeRequest.
 *
 * @async
 * @function handleMergeRequestOpen
 * @param {number} id - The ID of the project.
 * @param {number} iid - The internal ID of the merge request.
 * @param {string} source_branch - The source branch of the merge request.
 * @returns {Promise<void>} No return value.
 */

async function handleMergeRequestOpen(
  id: number,
  iid: number,
  source_branch: string,
): Promise<void> {
  try {
    label.create(id, iid, IN_PROGRESS_LABEL);
    const result = await handleMergeRequestFeedback(id, iid, source_branch);
    if (result) {
      label.create(id, iid, SUCCESS_LABEL);
      handleSlackMessaging(id, 'speech_balloon', glossary.slack_message_feedback);
    } else {
      label.create(id, iid, NOT_SUPPORTED_LABEL);
      handleSlackMessaging(id, 'triangular_flag_on_post', glossary.slack_message_not_valid);
    }
  } catch (error) {
    label.create(id, iid, FAILED_LABEL);
    Logger.error(`Error validating merge request: ${error}`);
    throw error;
  }
}

/**
 * This function handles a updated GitLab MergeRequest.
 *
 * @async
 * @function handleMergeRequestUpdated
 * @returns {Promise<void>} No return value.
 */

async function handleMergeRequestUpdated(): Promise<void> {
  try {
  } catch (error) {
    Logger.error(`Error validating merge request: ${error}`);
    throw error;
  }
}

/**
 * This function handles a merged GitLab MergeRequest.
 *
 * @async
 * @function handleMergeRequestMerged
 * @param {number} id - The ID of the project.
 * @returns {Promise<void>} No return value.
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
  if (SLACK_BOT_TOKEN) {
    if (emoji) slack.emoji(id, emoji);
    if (message) slack.thread(id, message);
  }
}

export { handleMergeRequestEvent, handleNoteEvent };
