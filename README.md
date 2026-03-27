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

## Installation

This tool is available as a native **Gemini CLI Extension** on the official Gemini extension marketplace.

Search for **subagent** in the marketplace and install it directly — no cloning or manual setup required.

Once installed, use it inside any Gemini CLI session:

```
/subagent:create
```

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
git clone https://github.com/your-username/gemini-subagent-wizard.git
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
