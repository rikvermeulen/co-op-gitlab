import { Logger } from '@/server/Logger';

import type { GitlabCommentPayload } from '@/types/index.js';

import { GitLab } from '@/services/gitlab';

class CommentManager {
  /**
   * Create a comment for a merge request.
   * @param {number} projectId
   * @param {number} mergeRequestId
   * @param {string} oldPath
   * @param {string} filePath
   * @param {string} note
   * @param {number} newLine
   * @returns {Promise<void>}
   */

  async create(
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
      await new GitLab('POST', `${url}/discussions`, payload).connect();

      Logger.info('Comment added to:', filePath);
    } catch (error) {
      Logger.error(`Error adding comment to merge request: ${error}`);
    }
  }

  /**
   * Create a reply for a merge request.
   * @param {number} projectId
   * @param {number} mergeRequestId
   * @param {number} parentNoteId
   * @param {string} user
   * @returns {Promise<void>}
   */
  async reply(
    projectId: number,
    mergeRequestId: number,
    parentNoteId: number,
    user: string,
  ): Promise<void> {
    try {
      const url = `projects/${projectId}/merge_requests/${mergeRequestId}/notes`;

      const payload = {
        body: `@${user} The feedback process has started.`,
        in_reply_to_id: parentNoteId,
      };

      const result = await new GitLab('POST', url, payload).connect();

      Logger.info('Comment added to:', result.id);
    } catch (error) {
      Logger.error(`Error adding reply to merge request: ${error}`);
    }
  }
}

export { CommentManager };
