import { Logger } from '@/server/Logger';

import type { GitlabCommentPayload } from '@/types/index.js';

import { GitLab } from '@/services/gitlab';

class LabelManager {
  /**
   * Create a comment for a merge request.
   * @param {number} projectId
   * @param {number} mergeRequestId
   * @param {string} labelName
   * @returns {Promise<void>}
   */

  async create(projectId: number, mergeRequestId: number, labelName: string): Promise<void> {
    try {
      const url = `projects/${projectId}/merge_requests/${mergeRequestId}`;

      // Payload for the comment
      const payload: GitlabCommentPayload = {
        labels: labelName,
      };

      // Add the comment to the merge request
      await new GitLab('PUT', `${url}`, payload).connect();
    } catch (error) {
      Logger.error(`Error adding comment to merge request: ${error}`);
    }
  }
}

export { LabelManager };
