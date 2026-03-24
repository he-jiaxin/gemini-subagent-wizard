# Gemini CLI Subagent Wizard

**The fastest way to build, configure, and deploy specialist agents for the Gemini CLI.**

Writing YAML frontmatter by hand is error-prone. The **Gemini Subagent Wizard** provides a beautiful, interactive TUI (Terminal User Interface) to draft complex agent personas using Gemini itself, select whitelisted tools, and save them exactly where the Gemini CLI expects to find them.

## Key Features

* **AI-Powered Drafting:** Tell the wizard what you need, and it uses Gemini to write a professional system prompt for your subagent.
* **Safety Check:** Automatically verifies your `settings.json` to ensure experimental agents are enabled.
* **Strict Tool Mapping:** Only allows officially whitelisted Gemini CLI tools (`read_file`, `grep_search`, `run_shell_command`, etc.) to prevent validation crashes.
* **Responsive Previews:** See exactly what your `.md` agent file looks like before saving.
* **Dual-Scope Support:** Save agents to your local project (`.gemini/agents/`) or your global user profile (`~/.gemini/agents/`).

---

## Installation

You don't even need to install it to start using it! Run the wizard instantly via `npx`:

```bash
npx gemini-subagent
```

Or install it globally for frequent use:

```bash
npm install -g gemini-subagent
```

---

## Usage

### 1. Standalone Mode
Run the wizard from any terminal to prep your agents before starting a Gemini session:
```bash
gemini-subagent
```

### 2. Inside the Gemini CLI (Native Shell Escape)
You can trigger the wizard without leaving your active chat session. Type this directly into the Gemini prompt:
```bash
> !npx gemini-subagent
```
*After saving, run `/agents refresh` to load your new specialist immediately.*

### 3. As a Slash Command
To make it a permanent part of your Gemini CLI menu:
1.  Copy `templates/gemini-subagent.toml` from this repo to `~/.gemini/commands/`.
2.  Inside Gemini, run `/commands reload`.
3.  Type `/gemini-subagent` to launch the wizard.

---

## Development

If you want to contribute or build from source:

1.  **Clone & Install:**
    ```bash
    git clone https://github.com/your-username/gemini-agent-wizard.git
    cd gemini-agent-wizard
    npm install
    ```
2.  **Build:**
    ```bash
    npm run build
    ```
3.  **Local Link:**
    ```bash
    npm link --force
    ```

---

## Prerequisites

* **Node.js** v18+ 
* **Gemini CLI** (`npm install -g @google/genai-cli`)
* **Subagents Enabled:** Ensure your `~/.gemini/settings.json` contains:
    ```json
    "experimental": {
      "enableAgents": true
    }
    ```

## License
ISC © 2026

---

### Pro-Tip for your GitHub Repo:
Since you've already posted it to a repo, make sure to add a **"Usage"** GIF or a screenshot of the TUI in action to the top of the README. It makes a huge difference for people discovering your project!

Would you like me to help you draft a **`CHANGELOG.md`** for this version 1.8 release, or are you all set to push these final updates?
