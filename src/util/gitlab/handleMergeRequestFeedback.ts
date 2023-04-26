import { GitLab } from '@/services/index';
import { GitLabChanges } from '@/types/index';
import { asyncForEach } from '@/helpers/asyncForEach';
import { checkFileFormat } from '@/util/checkFileFormat';
import { CommentManager } from '@/util/gitlab/CommentManager';
import { logger } from '@/server/Logger';
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

    await asyncForEach(changes, async (change: GitLabChanges) => {
      const { diff, new_path, deleted_file, old_path } = change;

      if (!diff) return;

      const language: string | false = await checkFileFormat(new_path);
      const lineNumber: number | undefined = await getLineNumber(change, sourceBranch, projectId);

      if (deleted_file || !language || !lineNumber) {
        logger.info(`Ignored: ${new_path}`);
        return;
      }

      const feedback: string | undefined = await getFeedback(change, language);

      if (!feedback) return;

      commentManager.create(projectId, mergeRequestId, old_path, new_path, feedback, lineNumber);
    });

    logger.info('Merge request validated');
  } catch (error) {
    logger.error(`Error handling merge request feedback: ${error}`);
    throw new Error(`Error handling merge request feedback: ${error}`);
  }
}

async function getLineNumber(change: GitLabChanges, sourceBranch: string, projectId: number) {
  const { diff, new_path } = change;

  const fileContentUrl = `/projects/${projectId}/repository/files/${encodeURIComponent(
    new_path,
  )}?ref=${sourceBranch}`;
  const fileContentResponse = await new GitLab('GET', fileContentUrl).connect();
  const fileContent = Buffer.from(fileContentResponse.content, 'base64').toString('utf-8');

  if (!fileContent) return;

  const newCode = diff
    .split('\n')
    .filter((line) => line.startsWith('+'))
    .join('\n')
    .substring(1);
  const lineNumbers = fileContent.split(newCode)?.[0]?.split('\n').length ?? 0;

  return lineNumbers;
}

export { handleMergeRequestFeedback };
