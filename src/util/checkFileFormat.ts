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
];

// List of excluded file names
const excludedFileNames: string[] = ['LICENSE', 'node_modules', 'vendor'];

export async function checkFileFormat(fileName: string): Promise<boolean> {
  // Check if the file has an excluded extension
  const fileExtension: string = fileName.slice(fileName.lastIndexOf('.'));
  if (excludedExtensions.includes(fileExtension)) {
    return false;
  }

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
