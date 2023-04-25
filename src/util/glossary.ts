export default {
  system_prompt_gpt:
    'You are an AI code reviewer that provides feedback on the given code snippet.',
  prompt_gpt:
    'Please provide a review and feedback on the following code snippet, with a focus on the added lines (indicated by "+") and their line numbers. Suggest any improvements that can be made to the code in terms of readability, efficiency, or best practices and check on possible errors and data checking. Please do not provide feedback on missing explanations or comments in the code. Providing the updated code snippet within a markdown collapsible section titled "Click here to expand to see the snippet." \n Language: {language}\n Code snippet:\n\n{changes}\n\n',
  slack_message_feedback: 'Hi, I added some feedback to your merge request :robot_face:',
  slack_message_merged: 'This Merge-request has been merged  :robot_face:',
  gitlab_command: '/feedback',
};
