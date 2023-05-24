import Sentiment from 'sentiment';
import { config } from '@/server/Config';
import { Logger } from '@/server/Logger';

import type { GitLabChanges } from '@/types/index';

import type { AvailableChatModels } from '@/services/gpt';
import { GPT } from '@/services/index';
import glossary from '@/util/glossary';
import { Parameter, createGPTPrompt } from '@/util/gpt/createGPTPrompt';

const sentiment = new Sentiment();

/**
 * Generates feedback for a given GitLab change and language
 *
 * @param change - A GitLab change object
 * @param language - The programming language of the file
 * @returns The generated feedback, or undefined if an error occurs
 */

async function getFeedback(
  change: GitLabChanges,
  language: string,
  framework: string,
): Promise<string | undefined> {
  try {
    const { userPrompt, systemPrompt } = glossary;

    const model = (config.OPENAI_MODEL as AvailableChatModels) || 'gpt-3.5-turbo';
    const parameters: Parameter[] = [
      {
        key: 'language',
        value: language,
      },
      {
        key: 'framework',
        value: framework,
      },
      {
        key: 'changes',
        value: change.diff,
      },
    ];

    //prompt for the user
    const user: string = createGPTPrompt(userPrompt, parameters);

    const feedback: string = await new GPT(user, systemPrompt, model).connect();

    const result = sentiment.analyze(feedback);

    // If the sentiment is negative, handle it
    if (result.score < 0) {
      return 'Sorry, but I am unable to provide useful feedback for this change.';
    }

    return feedback;
  } catch (error) {
    Logger.error(`Error generating feedback for change ${change.new_path}: ${error}`);
    return undefined;
  }
}

export { getFeedback };
