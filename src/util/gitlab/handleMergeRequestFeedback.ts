import { GPT, GitLab } from '@/services/index';
import { GitLabChanges } from '@/types/index';
import { asyncForEach } from '@/helpers/asyncForEach';
import { checkFileFormat } from '@/util/checkFileFormat';
import { createComment } from '@/util/gitlab/createComment';
import { type Parameter, createGPTPrompt } from '../createGPTPrompt';
import { logger } from '@/server/Logger';
import glossary from '@/util/glossary';
import { config } from '@/server/Config';
import type { AvailableChatModels } from '@/services/gpt';

/**
 * Handles feedback for a GitLab Merge Request
 *
 * @param projectId - The ID of the GitLab project
 * @param mergeRequestId - The ID of the Merge Request
 */

async function handleMergeRequestFeedback(
  projectId: number,
  mergeRequestId: number,
): Promise<void> {
  const url = `projects/${projectId}/merge_requests/${mergeRequestId}/diffs`;

  try {
    // Get all changes in the merge request
    const changes: GitLabChanges[] = await new GitLab('GET', url).connect();

    // Process each change
    await asyncForEach(changes, async (change: GitLabChanges) => {
      const language: string | false = await checkFileFormat(change.new_path);
      const lineNumber: number = change.diff.match(/\n/g)?.length || 0;

      if (change.deleted_file || !language) {
        logger.info(`Ignored: ${change.new_path}`);
        return;
      }

      const feedback: string | undefined = await getFeedback(change, language);

      if (feedback) {
        await createComment(
          projectId,
          mergeRequestId,
          change.old_path,
          change.new_path,
          feedback,
          lineNumber - 2,
        );
      }
    });

    logger.info('Merge request validated');
  } catch (error) {
    throw new Error(`Error handling merge request feedback: ${error}`);
  }
}

/**
 * Generates feedback for a given GitLab change and language
 *
 * @param change - A GitLab change object
 * @param language - The programming language of the file
 * @returns The generated feedback, or undefined if an error occurs
 */

async function getFeedback(change: GitLabChanges, language: string): Promise<string | undefined> {
  try {
    const basePrompt = glossary.prompt_gpt;
    const model = config.OPENAI_MODEL as AvailableChatModels;
    const parameters: Parameter[] = [
      {
        key: 'language',
        value: language,
      },
      {
        key: 'changes',
        value: change.diff,
      },
    ];

    const prompt: string = createGPTPrompt(basePrompt, parameters);

    const feedback: string = await new GPT(prompt, model).connect();

    return feedback;
  } catch (error) {
    throw new Error(`Error generating feedback for change ${change.new_path}: ${error}`);
  }
}

export { handleMergeRequestFeedback };
