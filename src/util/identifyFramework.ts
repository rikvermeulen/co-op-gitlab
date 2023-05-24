import NodeCache from 'node-cache';

import { GitLab } from '@/services/gitlab';
import glossary from '@/util/glossary';

interface File {
  name: string;
  path: string;
}

interface PackageJson {
  dependencies?: Record<string, unknown>;
  devDependencies?: Record<string, unknown>;
}

const frameworkCache = new NodeCache();

async function identifyFramework(projectId: number, branch: string = 'main') {
  const { frameworkSignatures } = glossary;
  const cachedFramework = frameworkCache.get(`framework-${projectId}`);
  if (cachedFramework) {
    return cachedFramework as string;
  }

  try {
    const repoTree = await getRepoTree(projectId, branch);

    if (!repoTree) return 'Unknown';

    const packageJson = repoTree.find((file: File) => file.name === 'package.json')
      ? await getFileContent(projectId, 'package.json', branch)
      : null;
    const dependencies = packageJson ? getDependencies(packageJson) : new Set();

    for (const [framework, { type, signature }] of Object.entries(frameworkSignatures)) {
      switch (type) {
        case 'package':
          if (packageJson && signature.every((dependency) => dependencies.has(dependency))) {
            frameworkCache.set(`framework-${projectId}`, framework);
            return framework;
          }
          break;
        case 'file':
          if (signature.every((file) => repoTree.find((node: any) => node.path === file))) {
            frameworkCache.set(`framework-${projectId}`, framework);
            return framework;
          }
          break;
      }
    }
    frameworkCache.set(`framework-${projectId}`, 'Unknown');
    return 'Unknown';
  } catch (error) {
    console.error(error);
    return 'Unknown';
  }
}

async function getRepoTree(projectId: number, branch: string) {
  const url = `projects/${encodeURIComponent(projectId)}/repository/tree?ref=${branch}`;

  return await new GitLab('GET', url).connect();
}

async function getFileContent(projectId: number, filePath: string, branch: string) {
  const url = `projects/${encodeURIComponent(projectId)}/repository/files/${encodeURIComponent(
    filePath,
  )}/raw?ref=${branch}`;

  return await new GitLab('GET', url).connect();
}

function getDependencies(packageJson: PackageJson): Set<string> {
  return new Set([
    ...Object.keys(packageJson.dependencies || {}),
    ...Object.keys(packageJson.devDependencies || {}),
  ]);
}

export { identifyFramework };
