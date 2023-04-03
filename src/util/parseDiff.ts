import { addComment } from '@/util/addComment.js';
import { GPT } from '@/util/connect.js';
import parseDiff from 'parse-diff';

import type { ChangesGitLab } from '@/types/index.js';

export async function processParsedDiff(
  change: ChangesGitLab,
  projectId: number,
  mergeRequestId: number,
) {
  const parsedDiff = parseDiff(change.diff);

  if (!parsedDiff) return;
  const codeSnippets: { file: string; lines: string; lineNumber: number }[] = [];

  await asyncForEach(parsedDiff, async (file: any) => {
    await asyncForEach(file.chunks, async (chunk: any) => {
      const addedLines = chunk.changes.filter((change: any) => change.type === 'add');
      if (addedLines.length > 0) {
        console.log();
        codeSnippets.push({
          file: change.new_path,
          lines: addedLines.map((line: any) => line.content),
          lineNumber: addedLines[addedLines.length - 1].ln,
        });
      }
    });
  });

  await asyncForEach(codeSnippets, async (code: any) => {
    const prompt = `Please provide feedback or suggestions for improvement on the following change in file '${change.new_path}', line ${code.lineNumber}:\n\n${code.lines}\n\nSuggestion in markdown format:`;

    const feedback = await fetchGPTFeedback(prompt);

    if (feedback) {
      await addComment(
        projectId,
        mergeRequestId,
        change.old_path,
        change.new_path,
        `Line ${code.lineNumber}: ${feedback}`,
        code.lineNumber,
      );
    }
  });
}

async function asyncForEach(array: any[], callback: Function) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

async function fetchGPTFeedback(prompt: string): Promise<string | null> {
  const feedback = await new GPT(prompt).connect();
  return feedback;
}
