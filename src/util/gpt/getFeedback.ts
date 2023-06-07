import Sentiment from 'sentiment';
import { config } from '@/server/Config';
import { Logger } from '@/server/Logger';

import type { GitLabChanges } from '@/types/index';

import type { AvailableChatModels } from '@/services/gpt';
import { GPT } from '@/services/index';
import glossary from '@/util/glossary';
import {
  PromptParameters,
  replacePlaceholdersInString,
} from '@/helpers/replacePlaceholdersInString';

const sentiment = new Sentiment();

const options = {
  extras: {
    error: 0,
  },
};

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
    const parameters: PromptParameters = {
      language,
      framework,
      changes: change.diff,
    };

    //prompt for the user
    const user: string = replacePlaceholdersInString(userPrompt, parameters);

    const feedback: string = await new GPT(user, systemPrompt, model).connect();

    const result = sentiment.analyze(feedback, options);

    // If the sentiment is negative, handle it
    if (result.score < 0) {
      return;
    }

    return feedback;
  } catch (error) {
    Logger.error(`Error generating feedback for change ${change.new_path}: ${error}`);
    throw error;
  }
}

export { getFeedback };
