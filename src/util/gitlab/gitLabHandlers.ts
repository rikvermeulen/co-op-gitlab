import { config } from '@/server/Config';
import { Logger } from '@/server/Logger';

import type { GitlabMergeEvent, GitlabNoteEvent } from '@/types/index';

import { CommentManager } from '@/util/gitlab/CommentManager';
import { handleMergeRequestFeedback } from '@/util/gitlab/handleMergeRequestFeedback';
import glossary from '@/util/glossary';
import { SlackManager } from '@/util/slack/slackManager';

const slack = new SlackManager();
const comment = new CommentManager();

const command = glossary.gitlab_command;

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

  Logger.status(`Handling event for merge request ${iid} for project ${id}`);

  if (state === 'opened' && !work_in_progress) {
    if (action === 'open' || action === 'reopen') {
      const text = `*New Merge Request Created for '${name}'*\n\nA new merge request has been created for the \`${source_branch}\` branch into \`${target_branch}\`:\n\n*Title:* ${title}\n*Author:* ${user}\n*Link:* ${url}\n\n @channel Please review the changes and leave any feedback or comments on the merge request page in GitLab.`;
      slack.messageWithMarkdown(id, text);

      await handleMergeRequestOpen(id, iid, source_branch);
    }

    if (action === 'update') {
      await handleMergeRequestUpdated();
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
  Logger.info(`Handling note event for merge request ${iid} for project ${source_project_id}`);

  if (note && note.includes(command)) {
    try {
      comment.reply(source_project_id, iid, id, username);

      await handleMergeRequestFeedback(source_project_id, iid, source_branch);
    } catch (error) {
      Logger.error(`Error validating merge request: ${error}`);
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

async function handleMergeRequestOpen(id: number, iid: number, source_branch: string) {
  try {
    const result = await handleMergeRequestFeedback(id, iid, source_branch);
    if (result) handleSlackMessaging(id, 'speech_balloon', glossary.slack_message_feedback);
  } catch (error) {
    Logger.error(`Error validating merge request: ${error}`);
  }
}

/**
 * This function handles a updated GitLab MergeRequest.
 *
 * @async
 * @function handleMergeRequestUpdated
 * @returns {Promise<void>} No return value.
 */

async function handleMergeRequestUpdated() {
  try {
  } catch {}
}

/**
 * This function handles a merged GitLab MergeRequest.
 *
 * @async
 * @function handleMergeRequestMerged
 * @param {number} id - The ID of the project.
 * @returns {Promise<void>} No return value.
 */

async function handleMergeRequestMerged(id: number) {
  try {
    handleSlackMessaging(id, 'white_check_mark', glossary.slack_message_feedback);
  } catch (error) {
    Logger.error(`Error validating merge request: ${error}`);
  }
}

// Utility function to handle Slack messaging
function handleSlackMessaging(id: number, emoji: string, message: string) {
  if (config.SLACK_BOT_TOKEN) {
    slack.emoji(id, emoji);
    slack.thread(id, message);
  }
}

export { handleMergeRequestEvent, handleNoteEvent };
