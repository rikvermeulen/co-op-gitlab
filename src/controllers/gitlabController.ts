import { Request, Response } from 'express';
import { config } from '@/server/Config';
import { Controller } from '@/server/Controllers';
import { Logger } from '@/server/Logger';

import type { GitlabMergeEvent, GitlabNoteEvent } from '@/types/index';

import { validateGitlabToken } from '@/middlewares/validateGitlabToken';
import { CommentManager } from '@/util/gitlab/CommentManager';
import { handleMergeRequestFeedback } from '@/util/gitlab/handleMergeRequestFeedback';
import glossary from '@/util/glossary';
import { sendSlackMessage } from '@/util/slack/sendSlackMessage';
import { SlackManager } from '@/util/slack/slackManager';

const controller = new Controller('gitlabController');

const slack = new SlackManager();

const slack_token = config.SLACK_BOT_TOKEN;

controller.post('/', [validateGitlabToken], async (req: Request, res: Response) => {
  const event = req.header('X-Gitlab-Event');
  const payload = req.body;
  try {
    if (event === 'Merge Request Hook' || event === 'System Hook') {
      await handleMergeRequestEvent(payload);
    }

    if (event === 'Note Hook') {
      await handleNoteEvent(payload);
    }

    res.status(200).send('Merge request handled successfully');
  } catch (error) {
    res.status(500).send('Error handling GitLab event');
  }
});

async function handleMergeRequestEvent(payload: GitlabMergeEvent) {
  const {
    event_type,
    project: { id },
    object_attributes: { state, action, iid, work_in_progress, source_branch },
  } = payload;

  if (!id || !iid) {
    Logger.error('Invalid project ID or merge request ID');
    return;
  }

  if (event_type !== 'merge_request') return;

  Logger.status(`Handling event for merge request ${iid} for project ${id}`);

  if (state === 'opened' && !work_in_progress) {
    if (action === 'open' || action === 'reopen') {
      if (slack_token) sendSlackMessage(payload);
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

async function handleNoteEvent(payload: GitlabNoteEvent) {
  const {
    object_attributes: { noteable_type, note, id },
    merge_request: { iid, source_project_id, source_branch },
    user: { username },
  } = payload;

  const command = glossary.gitlab_command;
  const comment = new CommentManager();

  if (noteable_type !== 'MergeRequest') return;

  if (note && note.includes(command)) {
    Logger.info(
      `Handling note event for merge request ${iid} for project ${source_project_id}`,
      payload,
    );
    try {
      comment.reply(source_project_id, iid, id, username);

      await handleMergeRequestFeedback(source_project_id, iid, source_branch);
    } catch (error) {
      Logger.error(`Error validating merge request: ${error}`);
    }
  }

  return;
}

async function handleMergeRequestOpen(id: number, iid: number, source_branch: string) {
  try {
    await handleMergeRequestFeedback(id, iid, source_branch);
  } catch (error) {
    Logger.error(`Error validating merge request: ${error}`);
  } finally {
    handleSlackMessaging(id, 'speech_balloon', glossary.slack_message_feedback);
  }
}

async function handleMergeRequestUpdated() {
  try {
  } catch {}
}

async function handleMergeRequestMerged(id: number) {
  try {
  } catch (error) {
    Logger.error(`Error validating merge request: ${error}`);
  } finally {
    handleSlackMessaging(id, 'white_check_mark', glossary.slack_message_feedback);
  }
}

// Utility function to handle Slack messaging
function handleSlackMessaging(id: number, emoji: string, message: string) {
  if (config.SLACK_BOT_TOKEN) {
    slack.emoji(id, emoji);
    slack.thread(id, message);
  }
}

export { controller };
