# Contributing to Path Lens

Thank you for taking the time to contribute to Path Lens! This document provides guidelines for contributing to the project.

## Guidelines

Before contributing, please review the [GitHub Community Guidelines](https://docs.github.com/en/site-policy/github-terms/github-community-guidelines).

We fully support and follow the GitHub Community Guidelines.

## Language

Please use **English** for all contributions, including issues, discussions, and pull requests.

If you are not a native English speaker, please proofread and refine your message before submitting it.
You may use any of the following services:

- ChatGPT
- Gemini
- Claude
- DeepL

Using these tools is encouraged to help make your contributions clear and easy to understand for others.

## How to Submit a Pull Request

Please follow these steps to submit a pull request:

1. Fork the [Path Lens repository](https://github.com/tetsutohara/path-lens).

2. Clone your forked repository:

   ```bash
   git clone https://github.com/yourname/path-lens.git
   ```

3. Create a branch using one of the following naming conventions:

   | Branch prefix | Description           |
   | ------------- | --------------------- |
   | `doc/`        | Documentation changes |
   | `feat/`       | New features          |
   | `fix/`        | Bug fix               |
   | `test/`       | New test code         |
   | `chore/`      | Maintenance tasks     |

4. Follow the following format for commit messages:

   ```text
   doc/feat/chore: A short description of what you did

   - Detailed description
   - Detailed description
   - Detailed description
   - Detailed description
   ```

> [!WARNING]
> Please keep the detailed description to a maximum of four bullet points. If your changes require more than four bullet points, consider splitting the work into multiple branches and pull requests.

5. If you add a new feature, please run the tests before submitting your pull request:

   ```bash
   npm run test
   ```

6. Before submitting your pull request, please make sure you have completed all the items in the pull request template on GitHub.
