import { config } from '@/server/Config';
import { Logger } from '@/server/Logger';

import type { GitlabMergeEvent, GitlabNoteEvent } from '@/types/index';

import {
  FAILED_LABEL,
  GITLAB_COMMAND,
  IGNORED_BRANCHES,
  IGNORED_USERS,
  IN_PROGRESS_LABEL,
  NOT_SUPPORTED_LABEL,
  REVIEW_REQUESTED_LABEL,
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
 */

async function handleMergeRequestEvent(payload: GitlabMergeEvent): Promise<void> {
  const { event_type, project, object_attributes, user } = payload;
  const { state, action, iid, work_in_progress, labels, source_branch, target_branch, url, title } =
    object_attributes;
  const { id, name } = project;

  const validUser = !IGNORED_USERS.includes(user.id);
  const validBranch =
    !IGNORED_BRANCHES.includes(source_branch) && !IGNORED_BRANCHES.includes(target_branch);

  if (event_type !== 'merge_request' || !validBranch || !validUser) return;

  const text = `*New Merge Request Created for '${name}'*\n\nA new merge request has been created for the \`${source_branch}\` branch into \`${target_branch}\`:\n\n*Title:* ${title}\n*Author:* ${user.name}\n*Link:* ${url}\n\n @channel Please review the changes and leave any feedback or comments on the merge request page in GitLab.`;
  const isRequested = labels.find((label) => label.title === REVIEW_REQUESTED_LABEL);

  if (state === 'opened' && !work_in_progress) {
    if (action === 'open' || action === 'reopen' || isRequested) {
      if (!isRequested) slack.messageWithMarkdown(project.id, text);
      Logger.status(`Handling event for merge request ${iid} for project ${name}:${project.id}`);
      await handleMergeRequestOpen(id, iid);
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
 */

async function handleNoteEvent(payload: GitlabNoteEvent): Promise<void> {
  // Extract relevant data
  const {
    object_attributes: { noteable_type, note, id },
    merge_request: { iid, source_project_id },
    user: { username },
  } = payload;

  if (noteable_type !== 'MergeRequest' || !note.includes(GITLAB_COMMAND)) return;

  try {
    comment.reply(source_project_id, iid, id, username);
    await handleMergeRequestFeedback(source_project_id, iid);
  } catch (error) {
    Logger.error(`Error handling merge request event: ${error}`);
    throw error;
  }
}

/**
 * This function handles the opening of a GitLab MergeRequest.
 */

async function handleMergeRequestOpen(id: number, iid: number): Promise<void> {
  try {
    label.create(id, iid, IN_PROGRESS_LABEL);

    const result = await handleMergeRequestFeedback(id, iid);
    const statusLabel = result ? SUCCESS_LABEL : NOT_SUPPORTED_LABEL;
    const message = result ? glossary.slack_message_feedback : glossary.slack_message_not_valid;

    label.create(id, iid, statusLabel);
    handleSlackMessaging(id, 'speech_balloon', message);
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
  if (SLACK_BOT_TOKEN) {
    if (emoji) slack.emoji(id, emoji);
    if (message) slack.thread(id, message);
  }
}

export { handleMergeRequestEvent, handleNoteEvent };
