import { config } from '@/server/Config';
import { Logger } from '@/server/Logger';

import type { GitLabChanges } from '@/types/index';

import type { AvailableChatModels } from '@/services/gpt';
import { GPT } from '@/services/index';
import glossary from '@/util/glossary';
import { Parameter, createGPTPrompt } from '@/util/gpt/createGPTPrompt';

/**
 * Generates feedback for a given GitLab change and language
 *
 * @param change - A GitLab change object
 * @param language - The programming language of the file
 * @returns The generated feedback, or undefined if an error occurs
 */

async function getFeedback(change: GitLabChanges, language: string): Promise<string | undefined> {
  try {
    const { userPrompt, systemPrompt } = glossary;

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

    const system: string = createGPTPrompt(systemPrompt, parameters);
    const user: string = createGPTPrompt(userPrompt, parameters);

    const feedback: string = await new GPT(user, system, model).connect();

    return feedback;
  } catch (error) {
    Logger.error(`Error generating feedback for change ${change.new_path}: ${error}`);
    throw new Error(`Error generating feedback for change ${change.new_path}: ${error}`);
  }
}

export { getFeedback };
