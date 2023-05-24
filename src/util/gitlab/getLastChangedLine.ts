import { Logger } from '@/server/Logger';

import type { GitLabChanges } from '@/types/index';

import { GitLab } from '@/services/index';

async function getLastChangedLine(
  change: GitLabChanges,
  sourceBranch: string,
  projectId: number,
): Promise<number> {
  const { diff, new_path } = change;

  try {
    const fileContentUrl = `/projects/${projectId}/repository/files/${encodeURIComponent(
      new_path,
    )}?ref=${encodeURIComponent(sourceBranch)}`;
    const fileContentResponse = await new GitLab('GET', fileContentUrl).connect();
    const fileContent = Buffer.from(fileContentResponse.content, 'base64').toString('utf-8');

    if (!fileContent) return 0;

    const diffLines = diff.split('\n');
    let lineNumber = 0;
    let lastChangedLine = 0;

    for (const line of diffLines) {
      if (line.startsWith('+')) {
        lastChangedLine = lineNumber;
      } else if (line.startsWith('@@')) {
        const match = line.match(/\+([0-9]+)/);
        if (match && match[1]) {
          lineNumber = parseInt(match[1], 10) - 1;
        }
      }

      if (!line.startsWith('-')) {
        lineNumber++;
      }
    }

    return lastChangedLine;
  } catch (error) {
    Logger.error(`Error getting line number: ${error}`);
    return 0;
  }
}

export { getLastChangedLine };
