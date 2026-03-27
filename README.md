# Gemini Subagent Wizard

**An interactive TUI for creating and managing specialist subagents in the Gemini CLI.**

Inspired by the subagent creation experience in Claude, this tool brings the same concept to the **Gemini CLI** — letting you spin up specialist agents with a guided workflow instead of hand-editing config files.

Writing YAML frontmatter by hand is error-prone. The **Gemini Subagent Wizard** provides a beautiful, interactive TUI to draft complex agent personas using Gemini itself, select whitelisted tools, and save them exactly where the Gemini CLI expects to find them.

## Key Features

* **AI-Powered Drafting:** Tell the wizard what you need, and it uses Gemini to write a professional system prompt for your subagent.
* **Safety Check:** Automatically verifies your `settings.json` to ensure experimental agents are enabled.
* **Strict Tool Mapping:** Only allows officially whitelisted Gemini CLI tools (`read_file`, `grep_search`, `run_shell_command`, etc.) to prevent validation crashes.
* **Responsive Previews:** See exactly what your `.md` agent file looks like before saving.
* **Dual-Scope Support:** Save agents to your local project (`.gemini/agents/`) or your global user profile (`~/.gemini/agents/`).

---


## Quickstart: create your first subagent

### 1. Open the wizard

Inside any Gemini CLI session, run:

```
/subagent:create
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

You now have a reusable specialist agent scoped exactly where you need it.


The wizard will launch and walk you through creating your subagent. After saving, run `/agents refresh` to load it immediately.

---

## Alternative: Direct Command (No AI Thinking)

If you prefer instant execution without AI processing, copy the command template to your global commands:

```bash
cp templates/subagent.toml ~/.gemini/commands/
```

Then use `/subagent` for immediate execution.

---

## How It Works

The extension registers a `create` command that the AI can invoke. The `GEMINI.md` context file also lets Gemini proactively suggest the wizard whenever you mention creating a specialist or setting up a subagent.

---

## Prerequisites

* **Gemini CLI** installed and authenticated
* **Subagents Enabled:** Ensure your `~/.gemini/settings.json` contains:
    ```json
    "experimental": {
      "enableAgents": true
    }
    ```
  The wizard will warn you if this isn't set.

---

## Development

To build from source:

```bash
git clone https://github.com/he-jiaxin/gemini-subagent-wizard.git
cd gemini-subagent-wizard
npm install
npm run build
gemini extensions link .
```

Run directly without building:

```bash
npm run dev
```

## License
ISC © 2026
