import { Request, Response } from 'express';
import { Controller } from '@/server/Controllers';
import { Logger } from '@/server/Logger';

import { validateGitlabToken } from '@/middlewares/validateGitlabToken';
import { MERGE_REQUEST_HOOK, NOTE_HOOK, SYSTEM_HOOK } from '@/util/consts';
import { handleMergeRequestEvent, handleNoteEvent } from '@/util/gitlab/gitLabHandlers';

// Initial setup
const controller = new Controller('gitlabController');

// Controller POST route
controller.post('/', [validateGitlabToken], async (req: Request, res: Response) => {
  const event = req.header('X-Gitlab-Event');
  const payload = req.body;
  try {
    if (event === MERGE_REQUEST_HOOK || event === SYSTEM_HOOK) {
      await handleMergeRequestEvent(payload);
      res.status(201).send('Merge request handled successfully');
    }

    if (event === NOTE_HOOK) {
      await handleNoteEvent(payload);
      res.status(201).send('Note event handled successfully');
    }
  } catch (error) {
    Logger.error(`Error in gitlabController.post: ${error}`);
    res.status(500).send('Internal Server Error - an error occurred on the server');
  }
});

export { controller };
