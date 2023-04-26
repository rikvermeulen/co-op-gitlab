import { Request, Response } from 'express';

import { Controller } from '@/server/Controllers';
import { logger } from '@/server/Logger';

import { validateGitlabToken } from '@/middlewares/validateGitlabToken';

import { sendSlackMessage } from '@/util/slack/sendSlackMessage';
import { sendSlackThread } from '@/util/slack/sendSlackThread';
import { handleMergeRequestFeedback } from '@/util/gitlab/handleMergeRequestFeedback';
import glossary from '@/util/glossary';

import type { GitlabMergeEvent, GitlabNoteEvent } from '@/types/index';
import { CommentManager } from '@/util/gitlab/CommentManager';

const controller = new Controller('gitlabController');

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
    logger.error('Invalid project ID or merge request ID');
    throw new Error('Invalid project ID or merge request ID');
  }

  if (state === 'opened' && !work_in_progress) {
    if (action === 'open') {
      sendSlackMessage(payload);
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
    try {
      await comment.reply(source_project_id, iid, id, username);
      await handleMergeRequestFeedback(source_project_id, iid, source_branch);
    } catch (error) {
      logger.error('Error validating merge request:', error);
    }
  }

  return;
}

async function handleMergeRequestOpen(id: number, iid: number, source_branch: string) {
  try {
    await handleMergeRequestFeedback(id, iid, source_branch);
  } catch (error) {
    logger.error('Error validating merge request:', error);
  } finally {
    sendSlackThread(id, glossary.slack_message_feedback, 'speech_balloon');
  }
}

async function handleMergeRequestUpdated() {
  try {
  } catch {}
}

async function handleMergeRequestMerged(id: number) {
  try {
    sendSlackThread(id, glossary.slack_message_merged, 'white_check_mark');
  } catch {}
}

export { controller };
