import NodeCache from 'node-cache';

const fileCache = new NodeCache();

/**
 * Checks if a file meets the requirements to receive feedback
 *
 * @param fileName The name of the file to check
 * @returns The language corresponding to the file extension if the file meets the requirements for feedback, false otherwise
 */
// List of excluded file extensions
const excludedExtensions: Set<string> = new Set([
  '.md',
  '.txt',
  '.json',
  '.lock',
  '.yml',
  '.yaml',
  '.xml',
  '.csv',
  '.toml',
]);

// List of excluded file names
const excludedFileNames: Set<string> = new Set(['LICENSE', 'node_modules', 'vendor']);

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
  '.twig': 'Twig',
};

async function identifyFile(fileName: string): Promise<string | false> {
  const cachedLanguage = fileCache.get(fileName);
  if (cachedLanguage) {
    return cachedLanguage as string;
  }

  // Check if the file is hidden
  if (fileName.startsWith('.')) {
    return false;
  }

  // Check if the file has an excluded extension
  const fileExtensionMatch = /(?:\.([^.]+))?$/.exec(fileName);
  const fileExtension: string =
    fileExtensionMatch && fileExtensionMatch[1] ? '.' + fileExtensionMatch[1] : '';

  if (excludedExtensions.has(fileExtension)) {
    return false;
  }

  // Check if the file has an excluded name
  const baseFileName: string = fileName.substring(fileName.lastIndexOf('/') + 1);
  if (excludedFileNames.has(baseFileName)) {
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
