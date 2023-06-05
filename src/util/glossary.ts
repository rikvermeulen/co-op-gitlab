export default {
  //openai
  systemPrompt:
    'You are an AI code reviewer that provides feedback on significant changes in the given code snippet.',
  userPrompt:
    'Please review the following code snippet, focusing on significant changes (indicated by "+") and their line numbers. If you find areas of improvement in terms of readability, efficiency, best practices, or any possible errors, please provide constructive feedback. If the changes are trivial, negligible, or don"t meaningfully impact the quality of the code (such as minor string changes, simple variable renaming, etc.), you can skip providing feedback. Do not provide feedback on missing explanations or comments in the code.\n If you do provide feedback, please include the updated code snippet within a markdown collapsible section titled "Click here to expand to see the snippet."\n Language: {language}\n Framework: {framework}\n Code snippet:\n\n{changes}\n\n',

  sentiment_error:
    'Sorry, but I am unable to provide useful feedback, because the sentiment analyse detected bad words.',

  //slack
  slack_message_feedback: 'Hi, I added some feedback to your merge request :robot_face:',
  slack_message_not_valid: 'This pull request is skipped for feedback :triangular_flag_on_post:',
  slack_message_merged: 'This Merge-request has been merged  :robot_face:',

  //support frameworks
  frameworkSignatures: {
    React: { type: 'package', signature: ['react', 'react-dom'] },
    'Next.js': { type: 'package', signature: ['next', 'react', 'react-dom'] },
    Express: { type: 'package', signature: ['express'] },
    Angular: { type: 'package', signature: ['@angular/core'] },
    Magento: { type: 'composer', signature: ['magento/product-community-edition'] },
    WordPress: { type: 'composer', signature: ['wp-cli/wp-cli'] },
    TYPO3: { type: 'composer', signature: ['typo3/cms-core'] },
    'Craft CMS': { type: 'composer', signature: ['craftcms/cms'] },
  },
};
