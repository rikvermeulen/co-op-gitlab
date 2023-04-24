import { Request, Response } from 'express';

import { Controller } from '@/server/Controllers';
import { logger } from '@/server/Logger';

import { validateGitlabToken } from '@/middlewares/validateGitlabToken';

import { sendSlackMessage } from '@/util/slack/sendSlackMessage';
import { sendSlackThread } from '@/util/slack/sendSlackThread';
import { handleMergeRequestFeedback } from '@/util/gitlab/handleMergeRequestFeedback';
import glossary from '@/util/glossary';

import type { GitlabEvent } from '@/types/index';

const controller = new Controller('gitlabController');

controller.post('/', [validateGitlabToken], async (req: Request, res: Response) => {
  const event = req.header('X-Gitlab-Event');
  const payload = req.body;
  try {
    if (event === 'Merge Request Hook') {
      await handleMergeRequestEvent(payload);
    }
    res.sendStatus(200);
  } catch (error) {
    res.status(500).send('Error handling GitLab event');
  }
});

async function handleMergeRequestEvent(payload: GitlabEvent) {
  const {
    project: { id },
    object_attributes: { state, action, iid, work_in_progress },
  } = payload;

  if (!id || !iid) throw new Error('Invalid project ID or merge request ID');

  if (state === 'opened' && !work_in_progress) {
    if (action === 'open') {
      sendSlackMessage(payload);
      await handleMergeRequestOpen(id, iid);
    }

    if (action === 'update') {
      await handleMergeRequestUpdated(id);
    }
  }

  if (state === 'merged') {
    await handleMergeRequestMerged(id);
  }
}

async function handleMergeRequestOpen(id: number, iid: number) {
  try {
    await handleMergeRequestFeedback(id, iid);
  } catch (error) {
    logger.error('Error validating merge request:', error);
  } finally {
    sendSlackThread(id, glossary.slack_message_feedback, 'speech_balloon');
  }
}

async function handleMergeRequestUpdated(id: number) {
  try {
  } catch {}
}

async function handleMergeRequestMerged(id: number) {
  try {
    sendSlackThread(id, glossary.slack_message_merged, 'white_check_mark');
  } catch {}
}

export { controller };
