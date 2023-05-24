import { Logger } from '@/server/Logger';

import type { GitLabChanges } from '@/types/index';

import { GitLab } from '@/services/index';
import { checkFileFormat } from '@/util/checkFileFormat';
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
): Promise<void> {
  const url = `projects/${projectId}/merge_requests/${mergeRequestId}/diffs`;
  const commentManager = new CommentManager();

  try {
    const changes: GitLabChanges[] = await new GitLab('GET', url).connect();

    if (!changes) return;

    const promises = changes.map(async (change: GitLabChanges) => {
      try {
        const { diff, new_path, deleted_file, old_path } = change;

        if (!diff) return;

        const language: string | false = await checkFileFormat(new_path);

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

        const feedback: string | undefined = await getFeedback(change, language);

        if (!feedback) return;

        commentManager.create(projectId, mergeRequestId, old_path, new_path, feedback, lineNumber);
      } catch (error) {
        Logger.error(`Error processing change ${change.new_path}: ${error}`);
      }
    });

    await Promise.all(promises);

    Logger.info('Merge request validated');
  } catch (error) {
    Logger.error(`Error handling merge request feedback: ${error}`);
  }
}

export { handleMergeRequestFeedback };
