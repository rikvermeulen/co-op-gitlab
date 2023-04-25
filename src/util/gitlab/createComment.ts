import { GitLab } from '@/services/gitlab';
import type { GitlabCommentPayload } from '@/types/index.js';
import { logger } from '@/server/Logger';

/**
 * Creates a comment on a merge request in GitLab.
 *
 * @param projectId The ID of the GitLab project.
 * @param mergeRequestId The ID of the merge request to add the comment to.
 * @param oldPath The old path of the file being commented on.
 * @param filePath The new path of the file being commented on.
 * @param note The comment to add.
 * @param newLine The line number in the new file to add the comment to.
 */

async function createComment(
  projectId: number,
  mergeRequestId: number,
  oldPath: string,
  filePath: string,
  note: string,
  newLine: number,
): Promise<void> {
  try {
    const url = `projects/${projectId}/merge_requests/${mergeRequestId}`;

    // Get the metadata for the merge request
    const metadata = await new GitLab('GET', `${url}/versions`).connect();

    // Payload for the comment
    const payload: GitlabCommentPayload = {
      body: note,
      position: {
        base_sha: metadata[0].base_commit_sha,
        start_sha: metadata[0].start_commit_sha,
        head_sha: metadata[0].head_commit_sha,
        position_type: 'text',
        new_path: filePath,
        old_path: oldPath,
        new_line: newLine,
      },
    };

    // Add the comment to the merge request
    const result = await new GitLab('POST', `${url}/discussions`, payload).connect();

    logger.info('Comment added to:', result.id);
  } catch (error) {
    throw new Error(`Error adding comment to merge request: ${error}`);
  }
}

export { createComment };
