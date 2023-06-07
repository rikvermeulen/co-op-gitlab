import { Request, Response } from 'express';
import { Controller } from '@/server/Controllers';
import { Logger } from '@/server/Logger';

import { GitlabMergeEvent } from '@/types/index';

import { validateGitlabToken } from '@/middlewares/validateGitlabToken';
import {
  IGNORED_BRANCHES,
  IGNORED_USERS,
  MERGE_REQUEST_HOOK,
  REVIEW_REQUESTED_LABEL,
  SYSTEM_HOOK,
} from '@/util/consts';
import {
  handleMergeRequestMerged,
  handleMergeRequestOpen,
  handleMergeRequestUpdated,
} from '@/util/gitlab/handleMergeRequestStatus';
import glossary from '@/util/glossary';
import { replacePlaceholdersInString } from '@/helpers/replacePlaceholdersInString';

// Initial setup
const controller = new Controller('gitlabController');

// Controller POST route
controller.post('/', [validateGitlabToken], async (req: Request, res: Response) => {
  const event = req.header('X-Gitlab-Event');
  const payload: GitlabMergeEvent = req.body;
  try {
    if (event === MERGE_REQUEST_HOOK || event === SYSTEM_HOOK) {
      await handleMergeRequest(payload);
      res.status(201).send('Merge request handled successfully');
    }
  } catch (error) {
    Logger.error(`Error in gitlabController.post: ${error}`);
    res.status(500).send('Internal Server Error - an error occurred on the server');
  }
});

// This function handles a GitLab MergeRequest event.
async function handleMergeRequest(payload: GitlabMergeEvent): Promise<void> {
  const {
    object_attributes: {
      state,
      action,
      iid,
      work_in_progress,
      labels,
      source_branch,
      target_branch,
      url,
      title,
    },
    project: { name, id },
    user,
    event_type,
  } = payload;

  const event = validateMergeRequest(event_type, user.id, source_branch, target_branch);

  const parameters = { name, source_branch, target_branch, title, url, user: user.name };
  const message = replacePlaceholdersInString(glossary.slack_message_merge_request, parameters);

  if (event) {
    if (state === 'opened' && !work_in_progress) {
      const isRequested = labels.find((label) => label.title === REVIEW_REQUESTED_LABEL);

      if (action === 'open' || action === 'reopen' || isRequested) {
        Logger.status(`Handling event for merge request ${iid} for project ${name}:${id}`);
        await handleMergeRequestOpen(id, iid, source_branch, action, message);
      }

      if (action === 'update') await handleMergeRequestUpdated();
    }

    if (state === 'merged') await handleMergeRequestMerged(id);
  } else {
    Logger.status(`Ignoring event for merge request ${iid} for project ${user.name}:${id}`);
  }
}

// This function validates a GitLab MergeRequest event.
function validateMergeRequest(
  event_type: string,
  userId: number,
  source_branch: string,
  target_branch: string,
): boolean {
  if (event_type !== 'merge_request') return false;

  if (IGNORED_USERS.includes(userId)) {
    Logger.error(`User ${userId} is ignored`);
    return false;
  }

  if (IGNORED_BRANCHES.includes(source_branch) || IGNORED_BRANCHES.includes(target_branch)) {
    Logger.error(`Branch ${source_branch} or ${target_branch} is ignored`);
    return false;
  }

  return true;
}

export { controller };
