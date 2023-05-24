import NodeCache from 'node-cache';

const fileCache = new NodeCache();

/**
 * Checks if a file meets the requirements to receive feedback
 *
 * @param fileName The name of the file to check
 * @returns The language corresponding to the file extension if the file meets the requirements for feedback, false otherwise
 */

async function identifyFile(fileName: string): Promise<string | false> {
  const cachedLanguage = fileCache.get(fileName);
  if (cachedLanguage) {
    return cachedLanguage as string;
  }

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

  // Map of allowed file extensions and their corresponding languages
  const allowedExtensions: Record<string, string> = {
    '.js': 'JavaScript',
    '.jsx': 'JavaScript',
    '.ts': 'TypeScript',
    '.tsx': 'TypeScript',
    '.py': 'python',
    '.php': 'php',
    '.rs': 'Rust',
    '.vue': 'Vue',
    '.svelte': 'Svelte',
    '.scss': 'SCSS',
    '.sass': 'SASS',
    '.sql': 'SQL',
  };

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

  // If the file passes all checks, check if it's in the list of allowed extensions
  const language = allowedExtensions[fileExtension];

  if (language) {
    fileCache.set(fileName, language);
    return language;
  }

  return false;
}

export { identifyFile };
