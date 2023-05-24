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
    if (event === 'Merge Request Hook') {
      await handleMergeRequestEvent(payload);
    }

    if (event === 'Note Hook') {
      await handleNoteEvent(payload);
    }

    res.sendStatus(200);
  } catch (error) {
    res.status(500).send('Error handling GitLab event');
  }
});

async function handleMergeRequestEvent(payload: GitlabMergeEvent) {
  const {
    project: { id },
    object_attributes: { state, action, iid, work_in_progress, source_branch },
  } = payload;

  if (!id || !iid) {
    return Logger.error('Invalid project ID or merge request ID');
  }

  Logger.info(`Handling note event for merge request ${iid} for project ${id}`, payload);

  if (state === 'opened' && !work_in_progress) {
    if (action === 'open') {
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
      if (slack_token) await comment.reply(source_project_id, iid, id, username);
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
    if (slack_token) {
      slack.emoji(id, 'speech_balloon');
      slack.thread(id, glossary.slack_message_feedback);
    }
  }
}

async function handleMergeRequestUpdated() {
  try {
  } catch {}
}

async function handleMergeRequestMerged(id: number) {
  try {
    if (slack_token) {
      slack.emoji(id, 'white_check_mark');
      slack.thread(id, glossary.slack_message_feedback);
    }
  } catch {}
}

export { controller };
