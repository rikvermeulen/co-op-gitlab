/**
 * Generates a customized prompt for ChatGPT by performing search and replace operations
 * on the given parameters in the base prompt.
 *
 * @param {string} basePrompt - The base prompt containing placeholders for the parameters in the format `{parameterKey}`.
 * @param {Array<Parameter>} parameters - An array of Parameter objects to be used for replacements.
 * @returns {string} The updated prompt with placeholders replaced by their respective values.
 */

export type Parameter = {
  key: string;
  value: string;
};

export function createGPTPrompt(basePrompt: string, parameters: Parameter[]): string {
  let updatedPrompt = basePrompt;

  parameters.forEach((param) => {
    const { key, value } = param;
    const search = new RegExp(`{${key}}`, 'g');
    updatedPrompt = updatedPrompt.replace(search, value);
  });

  return updatedPrompt;
}
