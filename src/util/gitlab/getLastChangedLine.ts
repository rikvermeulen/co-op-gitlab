import { Logger } from '@/server/Logger';

import type { GitLabChanges } from '@/types/index';

function parseDiff(diff: string): number {
  if (typeof diff !== 'string') {
    Logger.error(`Expected diff to be a string, but got ${typeof diff}`);
    return 0;
  }

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

async function getLastChangedLine(change: GitLabChanges): Promise<number> {
  const { diff } = change;

  try {
    return parseDiff(diff);
  } catch (error) {
    Logger.error(`Error getting line number: ${error}`);
    return 0;
  }
}

export { getLastChangedLine };
