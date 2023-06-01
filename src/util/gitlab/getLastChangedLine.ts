import { Logger } from '@/server/Logger';

import type { GitLabChanges } from '@/types/index';

import { GitLab } from '@/services/index';

function parseDiff(diff: string): number {
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
}

async function getLastChangedLine(
  change: GitLabChanges,
  sourceBranch: string,
  projectId: number,
): Promise<number> {
  const { diff, new_path } = change;

  try {
    const url = `/projects/${projectId}/repository/files/${encodeURIComponent(
      new_path,
    )}?ref=${encodeURIComponent(sourceBranch)}`;
    const res = await new GitLab('GET', url).connect();

    const content = Buffer.from(res.content, 'base64').toString('utf-8');

    if (!content) return 0;

    return parseDiff(diff);
  } catch (error) {
    Logger.error(`Error getting line number: ${error}`);
    return 0;
  }
}

export { getLastChangedLine };
