import NodeCache from 'node-cache';
import { Logger } from '@/server/Logger';

import { DependencyManifest, Glossary } from '@/types/index';

import { GitLab } from '@/services/gitlab';
import glossary from '@/util/glossary';

const frameworkCache = new NodeCache();

async function identifyFramework(projectId: number, branch: string = 'main') {
  const key = `framework-${projectId}`;

  const { frameworkSignatures } = glossary as Glossary;
  const cachedFramework = frameworkCache.get(key);

  if (cachedFramework) {
    return cachedFramework as string;
  }

  try {
    const urlRepoTree = `/tree?ref=${branch}`;
    const repoTree = await getFromGitlab(projectId, urlRepoTree);

    if (!repoTree) return 'Unknown';

    const fileContents = await getJsonFiles(repoTree, projectId, branch);

    let framework = 'Unknown';
    for (const [frameworkName, { type, signature }] of Object.entries(frameworkSignatures)) {
      const fileContent = fileContents[type];
      if (fileContent) {
        const dependencies = getDependencies(fileContent);
        if (signature.every((dependency) => dependencies.has(dependency))) {
          framework = frameworkName;
          break;
        }
      }
    }

    frameworkCache.set(key, framework);

    return framework;
  } catch (error) {
    Logger.error(`${error}`);
    return 'Unknown';
  }
}

async function getFromGitlab(projectId: number, url: string) {
  const baseUrl = `projects/${encodeURIComponent(projectId)}/repository${url}`;
  try {
    return await new GitLab('GET', baseUrl).connect();
  } catch (error) {
    Logger.error(`${error}`);
    throw error;
  }
}

function getDependencies(json: DependencyManifest): Set<string> {
  const dependencies = new Set<string>();

  const keys: (keyof DependencyManifest)[] = [
    'dependencies',
    'devDependencies',
    'require',
    'require-dev',
  ];

  keys.forEach((key) => {
    const value = json[key];
    if (value) {
      Object.keys(value).forEach((dependency) => dependencies.add(dependency));
    }
  });

  return dependencies;
}

async function getJsonFiles(repoTree: File[], projectId: number, branch: string) {
  const jsonFileNames = ['package.json', 'composer.json'];
  const fileContents: Partial<DependencyManifest> = {};

  const promises = jsonFileNames.map(async (file) => {
    if (repoTree.some((fileNode) => fileNode.name === file)) {
      const urlFileContent = `/files/${encodeURIComponent(file)}/raw?ref=${branch}`;
      const key = file.split('.')[0];
      fileContents[key as keyof DependencyManifest] = await getFromGitlab(
        projectId,
        urlFileContent,
      );
    }
  });

  await Promise.all(promises);
  return fileContents as DependencyManifest;
}

export { identifyFramework };
