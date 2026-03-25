# Gemini Subagent Wizard

Subagents are defined as Markdown files with YAML frontmatter. You can create them manually or use the `/gemini-subagent-wizard:create` command.

This walkthrough guides you through creating a subagent using the interactive wizard. The wizard handles frontmatter generation, tool selection, and file placement automatically.

---

## Quickstart: create your first subagent

### 1. Open the wizard

Inside any Gemini CLI session, run:

```
/gemini-subagent-wizard:create
```

### 2. Choose a scope

Select **Project-level** to save the agent to `.gemini/agents/` in your current repo, or **User-level** to save it to `~/.gemini/agents/` so it's available across all your projects.

### 3. Choose a creation method

Select **Generate with Gemini** to have Gemini draft the agent for you. When prompted, describe what you need:

```
A security auditor that reviews code for vulnerabilities, explains each
issue with the affected lines, and suggests a safe fix.
```

Gemini generates the agent name, description, and system prompt for you.

Prefer full control? Select **Manual configuration** to type the name, description, and system prompt yourself.

### 4. Select tools

Choose which tools the agent can use:

| Option | Tools included |
|---|---|
| All tools | `read_file`, `glob`, `grep_search`, `write_file`, `run_shell_command`, `google_web_search` |
| Read-only | `read_file`, `glob`, `grep_search` |
| Edit | `write_file` |
| Execution | `run_shell_command` |
| Other | `google_web_search` |
| Advanced | Pick individual tools from the full list |

For a read-only reviewer, select **Read-only tools** only. If you select nothing, the agent inherits all tools from the main conversation.

### 5. Select a model

Choose which model the agent runs on:

- **Inherit** — uses whatever model the main conversation is using
- **Gemini 2.5 Flash** — fast, great for straightforward tasks
- **Gemini 2.5 Pro** — more capable, better for complex analysis

### 6. Review and save

The wizard shows a full preview of the `.md` file before writing anything:

```
---
name: security-auditor
description: Use this agent to review code for security vulnerabilities.
model: gemini-2.5-pro
tools:
  - read_file
  - glob
  - grep_search
---

You are an expert security engineer...
```

Select **Save and create agent** to write the file, or **Discard** to exit without saving.

### 7. Load the agent

Run `/agents refresh` in your Gemini CLI session to load the new agent immediately. Then try it:

```
Use the security-auditor agent to review the auth module for vulnerabilities.
```

Gemini delegates to your new subagent, which scans the files and returns its findings.

---

You now have a reusable specialist agent scoped exactly where you need it.

---

## Installation

Available as a native **Gemini CLI Extension** on the official Gemini extension marketplace. Search for **gemini-subagent-wizard** and install it directly — no cloning or manual setup required.

## Prerequisites

- **Gemini CLI** installed and authenticated
- **Subagents enabled** in `~/.gemini/settings.json`:
  ```json
  "experimental": {
    "enableAgents": true
  }
  ```
  The wizard will warn you if this isn't configured.

## Development

```bash
git clone https://github.com/he-jiaxin/gemini-subagent-wizard.git
cd gemini-subagent-wizard
npm install
npm run build   # or: npm run dev (no build needed)
```

## License
ISC © 2026
