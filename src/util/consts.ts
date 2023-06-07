// Constants
export const MERGE_REQUEST_HOOK = 'Merge Request Hook';
export const SYSTEM_HOOK = 'System Hook';
export const NOTE_HOOK = 'Note Hook';

export const GITLAB_COMMAND = '/feedback-gpt';

export const IN_PROGRESS_LABEL = 'bot::review::in-progress';
export const SUCCESS_LABEL = 'bot::review::success';
export const NOT_SUPPORTED_LABEL = 'bot::review::not-supported';
export const FAILED_LABEL = 'bot::review::failed';
export const REVIEW_REQUESTED_LABEL = 'bot::review::request';

export const IGNORED_USERS = [27];
export const IGNORED_BRANCHES = ['accept'];

export const supportedFrameworks = {
  React: { type: 'package', signature: ['react', 'react-dom'] },
  'Next.js': { type: 'package', signature: ['next', 'react', 'react-dom'] },
  Express: { type: 'package', signature: ['express'] },
  Angular: { type: 'package', signature: ['@angular/core'] },
  Magento: { type: 'composer', signature: ['magento/product-community-edition'] },
  WordPress: { type: 'composer', signature: ['wp-cli/wp-cli'] },
  TYPO3: { type: 'composer', signature: ['typo3/cms-core'] },
  'Craft CMS': { type: 'composer', signature: ['craftcms/cms'] },
};
