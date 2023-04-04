import { Request, Response } from 'express';
import { Controller } from '@/server/Controllers.js';
import { GitLab } from '@/util/connect.js';
import { checkFileFormat } from '@/util/checkFileFormat.js';
import { processParsedDiff } from '@/util/parseDiff.js';

import type { ChangesGitLab } from '@/types/index.js';
import { sendMessage } from 'src/module/slack.js';

const controller = new Controller('gitlabController');

controller.post('/', [], async (req: Request, res: Response) => {
  const event = req.header('X-Gitlab-Event');
  const payload = req.body;

  if (event === 'Merge Request Hook') {
    await handleMergeRequestEvent(payload);
  }

  res.sendStatus(200);
});

async function handleMergeRequestEvent(payload: any) {
  //acion = opened, closed, merged, etc and idd = merge request id
  const { state, iid } = payload.object_attributes;
  const projectId = payload.project.id;

  if (!projectId || !iid) throw new Error('Invalid project ID or merge request ID');

  // Only process merge requests that are opened
  if (state === 'opened') {
    const url = `projects/${projectId}/merge_requests/${iid}/diffs`;
    // Get all changes in the merge request
    const changes = await new GitLab('GET', url).connect();

    // Process each change
    await asyncForEach(changes, async (change: ChangesGitLab) => {
      const isValid = await checkFileFormat(change.new_path);

      if (change.deleted_file || !isValid) return;

      await processParsedDiff(change, projectId, iid);
    });
  }
}

async function asyncForEach(array: any[], callback: Function) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

export { controller };
