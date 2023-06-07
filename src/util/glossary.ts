export default {
  //openai
  systemPrompt:
    'You are an developer that reviews code that provides feedback top the given code snippet.',
  userPrompt:
    'Please give feedback on the provided code changes below, Focus on substantial updates indicated by "+". Consider improvements in terms of readability, efficiency, best practices, or any possible errors and provide useful feedback. If the changes are trivial, negligible, or don"t meaningfully impact the quality of the code (such as minor string changes, simple variable renaming, missing explanations or comments etc.), you can skip providing feedback. \n If you have suggestions for improvement, provide the updated code inside a markdown collapsible section with the title "Click here to view the revised snippet".\n Language: {language}\n Framework: {framework}\n Code snippet:\n\n{changes}\n\n',

  //slack
  slack_message_merge_request: `*New Merge Request Created for '{name}'*\n\nA new merge request has been created for the \`{source_branch}\` branch into \`{target_branch}\`:\n\n*Title:* {title}\n*Author:* {user.name}\n*Link:* {url}\n\n @channel Please review the changes and leave any feedback or comments on the merge request page in GitLab.`,
  slack_message_feedback: 'Hi, I added some feedback to your merge request :robot_face:',
  slack_message_not_valid: 'This pull request is skipped for feedback :triangular_flag_on_post:',
  slack_message_skip_branch:
    'This pull request is skipped because the source or target branch is an expection :triangular_flag_on_post:',
  slack_message_merged: 'This Merge-request has been merged  :robot_face:',
};
