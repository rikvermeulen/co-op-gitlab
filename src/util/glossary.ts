export default {
  //openai
  systemPrompt: 'You are an AI code reviewer that provides feedback in the given code snippet.',
  userPrompt:
    'Please evaluate the provided code changes below, Focus on substantial updates indicated by "+". Consider improvements in terms of readability, efficiency, best practices, or any possible errors and provide useful feedback. If the changes are trivial, negligible, or don"t meaningfully impact the quality of the code (such as minor string changes, simple variable renaming, missing explanations or comments etc.), you can skip providing feedback. \n If you have suggestions for improvement, provide the updated code inside a markdown collapsible section with the title "Click here to view the revised snippet".\n Language: {language}\n Framework: {framework}\n Code snippet:\n\n{changes}\n\n',

  sentiment_error:
    'Sorry, but I am unable to provide useful feedback, because the sentiment analyse detected bad words.',

  //slack
  slack_message_feedback: 'Hi, I added some feedback to your merge request :robot_face:',
  slack_message_not_valid: 'This pull request is skipped for feedback :triangular_flag_on_post:',
  slack_message_skip_branch:
    'This pull request is skipped because the source or target branch is an expection :triangular_flag_on_post:',
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
