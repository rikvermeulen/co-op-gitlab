import { GPT } from '@/services/gpt';
import { GitLab } from '@/services/gitlab';
import { GitLabChanges } from '@/types/index';
import { asyncForEach } from '@/helpers/asyncForEach';
import { checkFileFormat } from '@/util/checkFileFormat';
import { createComment } from '@/util/gitlab/createComment';
import { type Parameter, createGPTPrompt } from './createGPTPrompt';
import { logger } from '@/server/Logger';

async function validateMergeRequest(id: number, iid: number): Promise<void> {
  const url = `projects/${id}/merge_requests/${iid}/diffs`;

  try {
    // Get all changes in the merge request
    const changes = await new GitLab('GET', url).connect();

    // Process each change
    await asyncForEach(changes, async (change: GitLabChanges) => {
      const language = await checkFileFormat(change.new_path);

      if (change.deleted_file || !language) {
        logger.info(
          `File is deleted or does not meet the requirements for feedback: ${change.new_path}`,
        );
        return;
      }

      await handleFeedback(change, id, iid, language);
    });

    logger.info('Merge request validated');
  } catch (error) {
    logger.error(`Error validating merge request: ${error}`);
  }
}

async function handleFeedback(
  change: GitLabChanges,
  projectId: number,
  mergeRequestId: number,
  language: string,
) {
  try {
    const lineNumber = change.diff.match(/\n/g)?.length || 0;

    const basePrompt = `Please provide a review and feedback on the following code snippet, with a focus on the added lines (indicated by '+') and their line numbers. Suggest any improvements that can be made to the code in terms of readability, efficiency, or best practices and check on possible errors and data checking. Please do not provide feedback on missing explanations or comments in the code. Providing the updated code snippet within a markdown collapsible section titled "Click here to expand to see the snippet." \n Language: {language}\n Code snippet:\n\n{changes}\n\n`;
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

    const prompt = createGPTPrompt(basePrompt, parameters);

    const feedback = await new GPT(prompt, 'gpt-3.5-turbo').connect();

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
  } catch (error) {
    logger.error(`Error handling feedback for change ${change.new_path}: ${error}`);
  }
}

export { validateMergeRequest };
