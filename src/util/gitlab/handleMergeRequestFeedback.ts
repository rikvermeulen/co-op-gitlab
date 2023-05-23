import { Logger } from '@/server/Logger';

import type { GitLabChanges } from '@/types/index';

import { GitLab } from '@/services/index';
import { CommentManager } from '@/util/gitlab/CommentManager';
import { getLastChangedLine } from '@/util/gitlab/getLastChangedLine';
import { getFeedback } from '@/util/gpt/getFeedback';
import { identifyFile } from '@/util/identifyFile';
import { identifyFramework } from '@/util/identifyFramework';

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
): Promise<void> {
  const url = `projects/${projectId}/merge_requests/${mergeRequestId}/diffs`;

  try {
    const changes: GitLabChanges[] = await new GitLab('GET', url).connect();

    const errors: Error[] = [];
    const promises = changes.map((change) =>
      processChange(change, mergeRequestId, sourceBranch, projectId).catch((error) =>
        errors.push(error),
      ),
    );

    await Promise.all(promises);

    if (errors.length > 0) {
      Logger.error(`Some changes failed to process ${errors}`);
      throw new Error('Some changes failed to process');
    }

    Logger.info('Merge request validated');
  } catch (error) {
    Logger.error(`Error handling merge request feedback: ${error}`);
  }
}

async function processChange(
  change: GitLabChanges,
  mergeRequestId: number,
  sourceBranch: string,
  projectId: number,
): Promise<void> {
  const commentManager = new CommentManager();

  try {
    const { diff, new_path, deleted_file, old_path } = change;

    if (!diff) return;

    const language: string | false = await identifyFile(new_path);

    if (deleted_file || !language) {
      Logger.info(`Ignored: ${new_path}`);
      return;
    }

    const lineNumber: number | undefined = await getLastChangedLine(
      change,
      sourceBranch,
      projectId,
    );

    if (!lineNumber) return;

    const framework = await identifyFramework(projectId);

    const feedback: string | undefined = await getFeedback(change, language, framework);

    if (!feedback) return;

    commentManager.create(projectId, mergeRequestId, old_path, new_path, feedback, lineNumber);
  } catch (error) {
    Logger.error(`Error processing change ${change.new_path}: ${error}`);
    throw error;
  }
}

export { handleMergeRequestFeedback };
