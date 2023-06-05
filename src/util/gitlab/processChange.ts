import { Logger } from '@/server/Logger';

import type { GitLabChanges } from '@/types/index';

import { identifyFile } from '@/util/base/identifyFile';
import { CommentManager } from '@/util/gitlab/CommentManager';
import { getLastChangedLine } from '@/util/gitlab/getLastChangedLine';
import { getFeedback } from '@/util/gpt/getFeedback';

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
  // sourceBranch: string,
  projectId: number,
  framework: string,
): Promise<boolean> {
  const commentManager = new CommentManager();

  try {
    const { diff, new_path, deleted_file, old_path } = change;

    if (!diff || deleted_file) {
      Logger.info(`Ignored: ${new_path} - because file is deleted or has no changes`);
      return false;
    }

    const language: string | false = await identifyFile(new_path);

    if (!language) {
      Logger.info(`Ignored: ${new_path} - because langauge or Dir is not supported`);
      return false;
    }

    const totalChanges: number = countChangesInDiff(diff);

    if (totalChanges <= 3) {
      Logger.info(`Ignored: ${new_path} - because the change is too small`);
      return false;
    }

    const lineNumber: number = await getLastChangedLine(change);

    if (lineNumber <= 1) {
      Logger.info('The linenumber is unset');
      return false;
    }

    Logger.status(`Changes for ${new_path} are send for feedback`);
    const feedback: string | undefined = await getFeedback(change, language, framework);

    if (!feedback) {
      Logger.info("Couldn't getter feedback for the given changes");
      return false;
    }

    commentManager.create(projectId, mergeRequestId, old_path, new_path, feedback, lineNumber);

    return true;
  } catch (error) {
    Logger.error(`Error processing change ${change.new_path}: ${error}`);
    throw error;
  }
}

export function countChangesInDiff(diff: string) {
  // Split the diff into lines
  const lines = diff.split('\n');

  // Count the lines that start with '+', ignoring the first line (diff header)
  let totalChangedLines = 0;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i]!.startsWith('+')) {
      totalChangedLines++;
    }
  }

  return totalChangedLines;
}

export { processChange };
