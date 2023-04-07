import { Request, Response } from 'express';

import { Controller } from '@/server/Controllers';
import type { GitlabEvent } from '@/types/index';
import { Slack } from '@/services/slack';
import { createSlackMessage } from '@/util/slack/getMergeMessage';
import { getTimeStampMessage } from '@/util/slack/getTimeStamp';
import { logger } from '@/server/Logger';
import { handleMergeRequestFeedback } from '@/util/gitlab/handleMergeRequestFeedback';

const controller = new Controller('gitlabController');

const slack = new Slack();

controller.post('/', [], async (req: Request, res: Response) => {
  const event = req.header('X-Gitlab-Event');
  const payload = req.body;
  try {
    if (event === 'Merge Request Hook') {
      await handleMergeRequestEvent(payload);
    }
    res.sendStatus(200);
  } catch (error) {
    logger.error('Error handling GitLab event:', error);
    res.status(500).send('Error handling GitLab event');
  }
});

async function handleMergeRequestEvent(payload: GitlabEvent) {
  const {
    user: { name: user },
    project: { id, name },
    object_attributes: {
      title,
      state,
      action,
      iid,
      url,
      source_branch,
      target_branch,
      work_in_progress,
      description,
    },
  } = payload;

  if (!id || !iid) throw new Error('Invalid project ID or merge request ID');

  if (action === 'open' && state === 'opened' && !work_in_progress) {
    try {
      const text = createSlackMessage({
        id,
        name,
        title,
        user,
        description,
        url,
        source_branch,
        target_branch,
      });
      await slack.sendMessage(text);
      logger.info('Slack message sent');
    } catch (error) {
      logger.error('Error sending message to Slack:', error);
    }
    try {
      await handleMergeRequestFeedback(id, iid);
    } catch (error) {
      logger.error('Error validating merge request:', error);
    } finally {
      finalizeMergeRequest(id);
    }
  }
}

async function finalizeMergeRequest(id: number): Promise<void> {
  try {
    const timestamp = await getTimeStampMessage(id);
    await slack.sendMessage(
      { text: 'Hi, I added some feedback to your merge request :robot_face:' },
      timestamp,
    );
  } catch (error) {
    console.error(`Failed to finalize merge request with ID ${id}:`, error);
  }
}

export { controller };
