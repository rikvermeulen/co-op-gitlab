/**
 * Checks if a file meets the requirements to receive feedback
 *
 * @param fileName The name of the file to check
 * @returns True if the file meets the requirements for feedback, false otherwise
 */

async function checkFileFormat(fileName: string): Promise<boolean> {
  // List of excluded file extensions
  const excludedExtensions: string[] = [
    '.md',
    '.txt',
    '.json',
    '.lock',
    '.yml',
    '.yaml',
    '.xml',
    '.csv',
    '.toml',
  ];

  // List of excluded file names
  const excludedFileNames: string[] = ['LICENSE', 'node_modules', 'vendor'];

  // Check if the file has an excluded extension
  const fileExtension: string = fileName.slice(fileName.lastIndexOf('.'));
  if (excludedExtensions.includes(fileExtension)) {
    return false;
  }

  // Check if the file has a hidden file name (starting with a dot)
  if (fileName.startsWith('.')) {
    return false;
  }

  // Check if the file has an excluded name
  if (excludedFileNames.includes(fileName)) {
    return false;
  }

  // If the file passes all checks, it should be checked for feedback
  return true;
}

export { checkFileFormat };
