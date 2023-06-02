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
  sourceBranch: string,
): Promise<boolean> {
  const perPage = 20;
  let page = 1;
  let feedbackAdded = false;

  try {
    do {
      const url = `projects/${projectId}/merge_requests/${mergeRequestId}/diffs?page=${page}&per_page=${perPage}`;
      console.log(sourceBranch);

      const changes: GitLabChanges[] = await new GitLab('GET', url).connect();

      if (!changes) {
        Logger.error(`Failed to fetch changes from GitLab API at url: ${url}`);
        return false;
      }

      // If no changes, break the loop
      if (changes.length === 0) {
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

export { handleMergeRequestFeedback };
