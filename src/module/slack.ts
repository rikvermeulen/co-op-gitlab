// src/utils/slack.js

import { WebClient } from '@slack/web-api';
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.SLACK_BOT_TOKEN;

const web = new WebClient(token);

export async function sendMessage(channel: string, text: string) {
  try {
    const result = await web.chat.postMessage({
      channel,
      text,
    });

    console.log('Message sent: ', result.ts);
  } catch (error) {
    console.error('Error sending message to Slack: ', error);
  }
}
