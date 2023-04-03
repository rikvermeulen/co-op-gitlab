import { GitLab } from '@/util/connect.js';

interface Position {
  base_sha: string;
  start_sha: string;
  head_sha: string;
  position_type: string;
  new_path: string;
  old_path: string;
  new_line: number;
}

interface Payload {
  body: string;
  position: Position;
}

export async function addComment(
  projectId: number,
  mergeRequestId: number,
  oldPath: string,
  filePath: string,
  note: string,
  new_line: number,
): Promise<void> {
  try {
    const url = `projects/${projectId}/merge_requests/${mergeRequestId}`;

    const versionData = await getLatestVersion(url);
    const positionData = createPositionData(versionData, oldPath, filePath, new_line);

    const payload: Payload = {
      body: note,
      position: positionData,
    };

    const result = await new GitLab('POST', `${url}/discussions`, payload).connect();

    console.log('Comment added:', result);
  } catch (error) {
    console.error('Error adding comment to merge request:', error);
  }
}

async function getLatestVersion(url: string) {
  const version = await new GitLab('GET', `${url}/versions`).connect();
  return version[0];
}

function createPositionData(
  versionData: any,
  oldPath: string,
  filePath: string,
  new_line: number,
): Position {
  return {
    base_sha: versionData.base_commit_sha,
    start_sha: versionData.start_commit_sha,
    head_sha: versionData.head_commit_sha,
    position_type: 'text',
    new_path: filePath,
    old_path: oldPath,
    new_line: new_line,
  };
}