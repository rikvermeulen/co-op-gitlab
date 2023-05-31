export default {
  //openai
  systemPrompt: 'You are an AI code reviewer that provides feedback on the given code snippet.',
  userPrompt:
    'Please provide a code review and feedback on the following code snippet, with a focus on the added lines (indicated by "+") and their line numbers. Suggest any improvements that can be made to the code in terms of readability, efficiency, or best practices and check on possible errors and data checking. Please do not provide feedback on missing explanations or comments in the code. Providing the updated code snippet within a markdown collapsible section titled "Click here to expand to see the snippet." \n Language: {language}\n Framework: {framework}\n Code snippet:\n\n{changes}\n\n',

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

    Magento: { type: 'file', signature: ['app/etc/env.php'] },
    WordPress: { type: 'file', signature: ['wp-config.php'] },
    TYPO3: { type: 'file', signature: ['typo3/index.php'] },
    'Craft CMS': { type: 'file', signature: ['craft/app/index.php'] },
  },
};
