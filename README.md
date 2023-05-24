<h1 align="center">Code Reviewer</h1>
<p align="center">
  Automate code reviews and feedback for GitLab Merge Requests using OpenAI GPT-3/4
</p>

<p align="center">
  Get started with Code Reviewer by following the instructions in the <a href="#-getting-started"><strong>Getting Started</strong></a> section
</p>

<p align="center">
  <a href="#-introduction"><strong>Introduction</strong></a> ·
  <a href="#-features"><strong>Features</strong></a> ·
  <a href="#-getting-started"><strong>Getting Started</strong></a> ·
  <a href="#-usage"><strong>Usage</strong></a> ·
  <a href="#-author"><strong>Author</strong></a>
</p>

## 👋 Introduction

Code Reviewer is a tool that integrates with GitLab and OpenAI GPT-3/4 to automatically review and provide feedback on Merge Requests. It validates code snippets, suggests improvements, and ensures that best practices are followed.

### Requirements

- Node.js 18+ and npm
- GitLab account
- OpenAI API key

## 🎁 Features

- Integrates with GitLab Merge Requests
- Provides automated code review and feedback using OpenAI GPT-3/4
- Supports multiple programming languages
- Ensures adherence to best practices and coding standards
- Simplifies the code review process

## 👨🏻‍💻 Getting started

To get started with Code Reviewer, follow the steps below:

1. Clone the repository:

```shell
git clone https://github.com/yourusername/code-reviewer.git
cd code-reviewer
```

2. Install dependencies:

```shell
npm install
```

3. Create a .env file in the root folder and add the following variables:

```shell
GITLAB_TOKEN=your_gitlab_token
OPENAI_API_KEY=your_openai_api_key
```

Replace your_gitlab_token with your GitLab personal access token, and your_openai_api_key with your OpenAI API key.

4. Build the project:

```shell
npm run build
```

5. Start the server:

```shell
npm run start
```

## 💻 Usage

1. In your GitLab project, create a webhook that triggers on Merge Request events.

2. Set the webhook URL to the endpoint of your Code Reviewer server (e.g., https://your-code-reviewer-server.com/webhook).

3. When a Merge Request is created or updated in your GitLab project, Code Reviewer will automatically review the code and provide feedback as comments on the Merge Request.

## 🤝 Contributing

1. Fork this repository;
2. Create your branch: `git checkout -b my-awesome-contribution`;
3. Commit your changes: `git commit -m 'feat: Add some awesome contribution'`;
4. Push to the branch: `git push origin my-awesome-contribution`.

## 📋 License

Licensed under the MIT License, Copyright © 2023

See [LICENSE](LICENSE) for more information.

## 👤 Author

- Rik Vermeulen ([@rikvermeulen\_](https://twitter.com/rikvermeulen_))
