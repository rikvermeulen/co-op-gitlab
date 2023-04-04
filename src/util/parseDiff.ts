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
        codeSnippets.push({
          file: change.new_path,
          lines: addedLines.map((line: any) => `${line.ln}${line.content}`),
          lineNumber: addedLines[addedLines.length - 1].ln,
        });
      }
    });
  });

  await asyncForEach(codeSnippets, async (code: any) => {
    const prompt = `Please provide feedback on the following code snippet, with a focus on the added lines (indicated by '+') and their line numbers. Suggest any improvements that can be made to the code in terms of readability, efficiency, or best practices and check on possible errors and data checking. Please do not provide feedback on missing explanations or comments in the code. After providing updated code snippet, please include it within a markdown collapsible section titled "Click to expand."
          Language: ${change.new_path.split('.').pop()}
          Code snippet:
          \n\n${change.diff}\n\n`;

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
