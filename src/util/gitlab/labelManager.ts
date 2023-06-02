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

      const existingLabels = await this.get(projectId, mergeRequestId);

      // Add new label
      existingLabels.push(labelName);

      // Payload for the comment
      const payload: GitlabCommentPayload = {
        labels: existingLabels,
      };

      // Add the comment to the merge request
      await new GitLab('PUT', `${url}`, payload).connect();
    } catch (error) {
      Logger.error(`Error adding labels to merge request: ${error}`);
    }
  }

  async get(projectId: number, mergeRequestId: number) {
    try {
      const url = `projects/${projectId}/merge_requests/${mergeRequestId}`;

      // Add the comment to the merge request
      const existingLabels = (await new GitLab('GET', `${url}`).connect()).labels || [];

      return existingLabels;
    } catch (error) {
      Logger.error(`Error fetching labels to merge request: ${error}`);
    }
  }
}

export { LabelManager };
