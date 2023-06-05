import * as path from 'path';
import NodeCache from 'node-cache';

const fileCache = new NodeCache();

// List of excluded file names
const excludedFileNames: Set<string> = new Set(['LICENSE']);

// List of excluded directories
const excludedDirectories: Set<string> = new Set(['translations', 'node_modules', 'vendor']);

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
  '.blade.php': 'Blade',
  '.sql': 'SQL',
  '.twig': 'Twig',
  '.phtml': 'PHP',
  '.graphql': 'GraphQL',
};

async function identifyFile(fileName: string): Promise<string | false> {
  const cachedLanguage = fileCache.get(fileName);
  if (cachedLanguage) {
    return cachedLanguage as string;
  }

  const directoryName = path.dirname(fileName); // the path without the file, like "template/pages"
  const baseFileName: string = path.basename(fileName); // the file itself, like "product.twig"

  // Skip if file is hidden or directory is excluded
  if (baseFileName.startsWith('.') || excludedDirectories.has(directoryName)) {
    return false;
  }

  // Skip if the file has an excluded name
  if (excludedFileNames.has(baseFileName)) {
    return false;
  }

  // Extract extension and check if it's in the list of allowed extensions
  const fileExtensionMatch = /(?:\.([^.]+))?$/.exec(baseFileName);
  const fileExtension: string = '.' + (fileExtensionMatch?.[1] ?? '');

  const language = allowedExtensions[fileExtension];

  if (language) {
    fileCache.set(fileName, language);
    return language;
  }

  return false;
}

export { identifyFile };
