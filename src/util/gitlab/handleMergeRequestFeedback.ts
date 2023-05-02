import { logger } from '@/server/Logger';
import { GitLab } from '@/services/index';
import { checkFileFormat } from '@/util/checkFileFormat';
import { CommentManager } from '@/util/gitlab/CommentManager';
import { getFeedback } from '@/util/gpt/getFeedback';
import { getLastChangedLine } from '@/util/gitlab/getLastChangedLine';

import type { GitLabChanges } from '@/types/index';

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

    await Promise.all(
      changes.map(async (change: GitLabChanges) => {
        const { diff, new_path, deleted_file, old_path } = change;

        if (!diff) return;

        const language: string | false = await checkFileFormat(new_path);

        if (deleted_file || !language) {
          logger.info(`Ignored: ${new_path}`);
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
      }),
    );

    logger.info('Merge request validated');
  } catch (error) {
    logger.error(`Error handling merge request feedback: ${error}`);
    throw new Error(`Error handling merge request feedback: ${error}`);
  }
}

export { handleMergeRequestFeedback };
