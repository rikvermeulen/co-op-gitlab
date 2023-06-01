import { Logger } from '@/server/Logger';

import type { GitLabChanges } from '@/types/index';

import { GitLab } from '@/services/index';
import { identifyFile } from '@/util/base/identifyFile';
import { identifyFramework } from '@/util/base/identifyFramework';
import { CommentManager } from '@/util/gitlab/CommentManager';
import { getLastChangedLine } from '@/util/gitlab/getLastChangedLine';
import { getFeedback } from '@/util/gpt/getFeedback';

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
        processChange(change, mergeRequestId, sourceBranch, projectId, framework)
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

/**
 * Processes a change in the GitLab Merge Request
 *
 * @param change - The GitLab change
 * @param mergeRequestId - The ID of the Merge Request
 * @param sourceBranch - The source branch name
 * @param projectId - The ID of the GitLab project
 * @param framework - The project's framework
 */

async function processChange(
  change: GitLabChanges,
  mergeRequestId: number,
  sourceBranch: string,
  projectId: number,
  framework: string,
): Promise<boolean> {
  const commentManager = new CommentManager();

  try {
    const { diff, new_path, deleted_file, old_path } = change;

    const language: string | false = await identifyFile(new_path);

    console.log('lang', language, 'frame', framework, 'diff', diff);

    if (!diff || deleted_file || !language) {
      Logger.info(`Ignored: ${new_path}`);
      return false;
    }

    const lineNumber: number = await getLastChangedLine(change, sourceBranch, projectId);

    const feedback: string | undefined = await getFeedback(change, language, framework);

    console.log('feedback', feedback, 'line', lineNumber);

    if (!feedback || !lineNumber) {
      Logger.info("couldn't process feedback");
      return false;
    }

    commentManager.create(projectId, mergeRequestId, old_path, new_path, feedback, lineNumber);

    return true;
  } catch (error) {
    Logger.error(`Error processing change ${change.new_path}: ${error}`);
    throw error;
  }
}

export { handleMergeRequestFeedback };
