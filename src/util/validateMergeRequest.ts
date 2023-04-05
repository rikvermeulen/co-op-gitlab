import { GitLab } from '@/services/gitlab';
import { checkFileFormat } from '@/util/checkFileFormat';
import { handleFeedback } from '@/util/handleFeedback';
import { asyncForEach } from '@/helpers/asyncForEach';

import type { GitLabChanges } from '@/types/index';
import { logger } from '@/server/Logger';

async function validateMergeRequest(id: number, iid: number) {
  const url = `projects/${id}/merge_requests/${iid}/diffs`;
  // Get all changes in the merge request
  const changes = await new GitLab('GET', url).connect();

  // Process each change
  await asyncForEach(changes, async (change: GitLabChanges) => {
    const isValid = await checkFileFormat(change.new_path);

    if (change.deleted_file || !isValid) {
      logger.info('File is deleted or not valid', change.new_path);
      return;
    }

    // await handleFeedback(change, projectId, iid);
  });
}

export { validateMergeRequest };
