/**
 * Generates a customized string by performing search and replace operations
 * on the given parameters in the base string.
 *
 * @param {string} baseString - The base string containing placeholders for the parameters in the format `{parameterKey}`.
 * @param {PromptParameters} parameters - An object of key-value pairs to be used for replacements.
 * @returns {string} The updated string with placeholders replaced by their respective values.
 */

export interface PromptParameters {
  [key: string]: string;
}

export function replacePlaceholdersInString(
  baseString: string,
  parameters: PromptParameters,
): string {
  let updatedString = baseString;

  for (let key in parameters) {
    const value = parameters[key];
    if (value !== undefined) {
      const search = new RegExp(`{${key}}`, 'g');
      updatedString = updatedString.replace(search, value);
    }
  }

  return updatedString;
}
