import { Logger } from '@/server/Logger';

import type { GitLabChanges } from '@/types/index';

import { GitLab } from '@/services/index';
import { identifyFramework } from '@/util/base/identifyFramework';
import { processChange } from '@/util/gitlab/processChange';

/**
 * Handles feedback for a GitLab Merge Request
 *
 * @param projectId - The ID of the GitLab project
 * @param mergeRequestId - The ID of the Merge Request
 * @param sourceBranch - The source branch name
 */

async function handleMergeRequestFeedback(
  projectId: number,
  mergeRequestId: number,
): Promise<boolean> {
  const perPage = 20;
  let page = 1;
  let feedbackAdded = false;

  try {
    do {
      const url = `projects/${projectId}/merge_requests/${mergeRequestId}/diffs?page=${page}&per_page=${perPage}`;

      let changes = await getDiffs(url);

      if (!changes) {
        Logger.error(`Failed to fetch changes from GitLab API: ${projectId}`);
        return false;
      }

      // If no changes, break the loop
      if (changes.length < 1) {
        Logger.error(`No more changes found in the PR: ${projectId} for page ${page}`);
        break;
      }

      const framework = await identifyFramework(projectId);

      const errors: Error[] = [];
      const promises = changes.map((change) =>
        processChange(change, mergeRequestId, projectId, framework)
          .then((res) => {
            feedbackAdded = feedbackAdded || res;
          })
          .catch((error) => errors.push(error)),
      );

      await Promise.all(promises);

      if (errors.length > 0) {
        errors.forEach((error) =>
          Logger.error(`Some changes failed to process ${error.toString()}`),
        );

        throw new Error('Some changes failed to process');
      }

      Logger.info(`Processed page ${page} of changes`);

      page++;
    } while (true);

    Logger.info('Merge request validated');

    return feedbackAdded;
  } catch (error) {
    Logger.error(`Error handling merge request feedback: ${error}`);
    throw error;
  }
}

//Gitlab has a delay on processing the changes for a MR. So this func tries a couple of times to fetch the changes
const getDiffs = async (url: string, count = 0): Promise<GitLabChanges[]> => {
  const maxRetries = 5;
  const start = Date.now(); // Start time

  const changes: GitLabChanges[] = await new GitLab('GET', url).connect();

  if (changes.length < 1 && count < maxRetries) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return getDiffs(url, count + 1);
  }

  const duration = Date.now() - start;
  Logger.info(`Got diffs after ${duration} ms and ${count + 1} attempts`);

  return changes;
};

export { handleMergeRequestFeedback };
