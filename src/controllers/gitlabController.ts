import { Request, Response } from 'express';
import { Controller } from '@/server/Controllers';
import { Logger } from '@/server/Logger';

import { validateGitlabToken } from '@/middlewares/validateGitlabToken';
import { handleMergeRequestEvent, handleNoteEvent } from '@/util/gitlab/gitLabHandlers';

// Constants
const MERGE_REQUEST_HOOK = 'Merge Request Hook';
const SYSTEM_HOOK = 'System Hook';
const NOTE_HOOK = 'Note Hook';

// Initial setup
const controller = new Controller('gitlabController');

// Controller POST route
controller.post('/', [validateGitlabToken], async (req: Request, res: Response) => {
  const event = req.header('X-Gitlab-Event');
  const payload = req.body;
  try {
    if (event === MERGE_REQUEST_HOOK || event === SYSTEM_HOOK) {
      await handleMergeRequestEvent(payload);
    }

    if (event === NOTE_HOOK) {
      await handleNoteEvent(payload);
    }

    res.status(200).send('Merge request handled successfully');
  } catch (error) {
    Logger.error(`Error in gitlabController.post: ${error}`);
    res.status(500).send('Error handling GitLab event');
  }
});

export { controller };
