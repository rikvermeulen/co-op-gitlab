import { Logger } from '@/server/Logger';

import type { GitLabChanges } from '@/types/index';

import { identifyFile } from '@/util/base/identifyFile';
import { CommentManager } from '@/util/gitlab/CommentManager';
import { getLastChangedLine } from '@/util/gitlab/getLastChangedLine';
import { getFeedback } from '@/util/gpt/getFeedback';

const MINIMUM_CHANGE_COUNT = 3;

/**
 * Processes a change in the GitLab Merge Request
 */

async function processChange(
  change: GitLabChanges,
  mergeRequestId: number,
  projectId: number,
  framework: string,
): Promise<boolean> {
  const commentManager = new CommentManager();

  try {
    const hasValidChanges = await validChanges(change);

    if (!hasValidChanges) return false;

    const { language, lineNumber } = hasValidChanges;

    Logger.status(`Changes for ${change.new_path} are send for feedback`);
    const feedback: string | undefined = await getFeedback(change, language, framework);

    if (!feedback) {
      Logger.info("Couldn't getter feedback for the given changes");
      return false;
    }

    commentManager.create(
      projectId,
      mergeRequestId,
      change.old_path,
      change.new_path,
      feedback,
      lineNumber,
    );

    return true;
  } catch (error) {
    Logger.error(`Error processing change ${change.new_path}: ${error}`);
    throw error;
  }
}
async function validChanges(change: GitLabChanges) {
  const { diff, new_path, deleted_file } = change;

  if (!diff || deleted_file) {
    Logger.info(`Ignored: ${new_path} - because file is deleted or has no changes`);
    return false;
  }

  const language: string | false = await identifyFile(new_path);

  if (!language) {
    Logger.info(`Ignored: ${new_path} - because language or Directory is not supported`);
    return false;
  }

  const totalChanges: number = countChangesInDiff(diff);

  if (totalChanges <= MINIMUM_CHANGE_COUNT) {
    Logger.info(`Ignored: ${new_path} - because the change is too small`);
    return false;
  }

  const lineNumber: number = await getLastChangedLine(change);

  if (lineNumber <= 1) {
    Logger.info('The line number is unset');
    return false;
  }

  return {
    language: language,
    lineNumber: lineNumber,
  };
}

function countChangesInDiff(diff: string) {
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
