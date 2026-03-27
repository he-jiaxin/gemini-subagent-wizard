#!/usr/bin/env node

// index.ts
import { intro, outro, text, select, multiselect, spinner, isCancel, note } from "@clack/prompts";
import color from "picocolors";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { execFile } from "child_process";
import { promisify } from "util";
var execFileAsync = promisify(execFile);
var TOOL_GROUPS = {
  read: ["read_file", "glob", "grep_search", "list_directory"],
  edit: ["write_file", "replace"],
  exec: ["run_shell_command"],
  other: ["google_web_search", "web_fetch", "save_memory", "ask_user", "codebase_investigator"]
};
function checkGeminiSettings() {
  var _a;
  const settingsPath = path.join(os.homedir(), ".gemini", "settings.json");
  if (fs.existsSync(settingsPath)) {
    try {
      const settings = JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
      const isEnabled = (_a = settings.experimental) == null ? void 0 : _a.enableAgents;
      if (isEnabled !== true) {
        console.log("\n");
        note(
          color.yellow("Subagents are not yet enabled in your Gemini CLI.\n") + color.dim("To fix this, add the following to ~/.gemini/settings.json:\n\n") + color.cyan('  "experimental": {\n    "enableAgents": true\n  }'),
          "\u26A0\uFE0F  Configuration Required"
        );
      }
    } catch (e) {
    }
  }
}
async function generateAgentContent(intent) {
  const s = spinner();
  s.start("Asking Gemini (via your CLI) to design your subagent");
  const prompt = `
    You are an expert prompt engineer. The user wants to create an AI subagent for a CLI tool.
    User's request: "${intent}"
    
    Respond strictly in JSON format with three keys:
    1. "name": A short, hyphenated name (e.g., "security-auditor").
    2. "description": A one-sentence description of when to trigger this subagent.
    3. "system_prompt": A detailed system prompt giving the agent its persona.
    `;
  try {
    const { stdout } = await execFileAsync("gemini", ["-p", prompt]);
    s.stop("Gemini has drafted your agent!");
    let rawText = stdout.trim();
    if (rawText.startsWith("```json")) {
      rawText = rawText.replace(/^```json\n?/, "").replace(/```$/, "").trim();
    } else if (rawText.startsWith("```")) {
      rawText = rawText.replace(/^```\n?/, "").replace(/```$/, "").trim();
    }
    return JSON.parse(rawText);
  } catch (error) {
    s.stop(color.red("Failed to communicate with the Gemini CLI."));
    throw new Error("CLI execution failed");
  }
}
function handleCancel(value) {
  if (isCancel(value) || value === void 0) {
    outro(color.yellow("Wizard cancelled. No files were created."));
    process.exit(0);
  }
}
async function main() {
  console.clear();
  intro(`${color.bgCyan(color.black(" Gemini Subagent Wizard "))} ${color.dim("v1.9.1")}`);
  checkGeminiSettings();
  const scope = await select({
    message: "Create new agent\n" + color.dim("Select agent scope"),
    options: [
      { value: "project", label: "1. Project-level (.gemini/agents/)" },
      { value: "user", label: "2. User-level (~/.gemini/agents/)" }
    ]
  });
  handleCancel(scope);
  const method = await select({
    message: "Create new agent\n" + color.dim("Creation method"),
    options: [
      { value: "auto", label: "1. Generate with Gemini (recommended)" },
      { value: "manual", label: "2. Manual configuration" }
    ]
  });
  handleCancel(method);
  let agentData = { name: "", description: "", system_prompt: "" };
  if (method === "auto") {
    const intent = await text({
      message: "What should this subagent do?",
      placeholder: "e.g., Review code for security flaws",
      validate(value) {
        if (!value || value.trim().length === 0) return "Please provide a description!";
      }
    });
    handleCancel(intent);
    try {
      agentData = await generateAgentContent(intent);
    } catch (e) {
      outro(color.red("Exiting due to AI generation error."));
      process.exit(1);
    }
  } else {
    const manualName = await text({
      message: "Agent Name:",
      placeholder: "e.g., code-quality-reviewer",
      validate: (val) => !val ? "Name is required" : void 0
    });
    handleCancel(manualName);
    const manualDesc = await text({
      message: "Description (Trigger constraint):",
      placeholder: "e.g., Use this agent to review python code.",
      validate: (val) => !val ? "Description is required" : void 0
    });
    handleCancel(manualDesc);
    const manualPrompt = await text({
      message: "System Prompt (Role and expertise):",
      placeholder: "You are an expert...",
      validate: (val) => !val ? "System prompt is required" : void 0
    });
    handleCancel(manualPrompt);
    agentData = {
      name: manualName,
      description: manualDesc,
      system_prompt: manualPrompt
    };
  }
  let finalTools = [];
  const categoryChoices = await multiselect({
    message: "Create new agent\n" + color.dim("Select tools (Space to toggle, Enter to continue)"),
    options: [
      { value: "all", label: "All tools" },
      { value: "read", label: "Read-only tools" },
      { value: "edit", label: "Edit tools" },
      { value: "exec", label: "Execution tools" },
      { value: "other", label: "Other tools" },
      { value: "advanced", label: color.dim("[ Show advanced options ]") }
    ],
    required: false
  });
  handleCancel(categoryChoices);
  const choices = categoryChoices;
  if (choices.includes("advanced")) {
    const advancedTools = await multiselect({
      message: color.dim("Advanced Tool Selection (Space to select, Enter to continue)"),
      options: [
        { value: "read_file", label: color.cyan("Read") + "  - read_file" },
        { value: "glob", label: color.cyan("Read") + "  - glob" },
        { value: "grep_search", label: color.cyan("Read") + "  - grep_search" },
        { value: "list_directory", label: color.cyan("Read") + "  - list_directory" },
        { value: "write_file", label: color.yellow("Edit") + "  - write_file" },
        { value: "replace", label: color.yellow("Edit") + "  - replace" },
        { value: "run_shell_command", label: color.red("Exec") + "  - run_shell_command" },
        { value: "google_web_search", label: color.blue("Web ") + "  - google_web_search" },
        { value: "web_fetch", label: color.blue("Web ") + "  - web_fetch" },
        { value: "save_memory", label: color.magenta("Mem ") + "  - save_memory" },
        { value: "ask_user", label: color.magenta("User") + "  - ask_user" },
        { value: "codebase_investigator", label: color.green("Sys ") + "  - codebase_investigator" }
      ],
      required: false
    });
    handleCancel(advancedTools);
    finalTools = advancedTools;
  } else if (choices.includes("all")) {
    finalTools = [...TOOL_GROUPS.read, ...TOOL_GROUPS.edit, ...TOOL_GROUPS.exec, ...TOOL_GROUPS.other];
  } else {
    if (choices.includes("read")) finalTools.push(...TOOL_GROUPS.read);
    if (choices.includes("edit")) finalTools.push(...TOOL_GROUPS.edit);
    if (choices.includes("exec")) finalTools.push(...TOOL_GROUPS.exec);
    if (choices.includes("other")) finalTools.push(...TOOL_GROUPS.other);
  }
  finalTools = [...new Set(finalTools)];
  const targetModel = await select({
    message: "Create new agent\n" + color.dim("Select model"),
    options: [
      { value: "inherit", label: "1. Inherit (Use main conversation model)" },
      { value: "gemini-2.0-flash", label: "2. Gemini 2.0 Flash (Balanced)" },
      { value: "gemini-2.5-flash", label: "3. Gemini 2.5 Flash (Fast tasks)" },
      { value: "gemini-2.5-pro", label: "4. Gemini 2.5 Pro (Complex analysis)" }
    ]
  });
  handleCancel(targetModel);
  let frontmatter = `---
name: ${agentData.name}
description: ${agentData.description}
model: ${targetModel}
`;
  if (finalTools.length > 0) {
    frontmatter += `tools:
`;
    finalTools.forEach((t) => frontmatter += `  - ${t}
`);
  }
  frontmatter += `---

`;
  const fullFileContent = frontmatter + agentData.system_prompt;
  console.log("\n" + color.cyan("--- Agent Preview (.md file) ---"));
  console.log(color.dim(fullFileContent));
  console.log(color.cyan("--------------------------------\n"));
  const confirm = await select({
    message: "How would you like to proceed?",
    options: [
      { value: "save", label: color.green("\u2714 Save and create agent") },
      { value: "discard", label: color.red("\u2716 Discard and exit") }
    ]
  });
  handleCancel(confirm);
  if (confirm === "discard") {
    outro(color.yellow("Agent discarded. No files were written."));
    process.exit(0);
  }
  const agentsDir = scope === "project" ? path.join(process.cwd(), ".gemini", "agents") : path.join(os.homedir(), ".gemini", "agents");
  fs.mkdirSync(agentsDir, { recursive: true });
  const filePath = path.join(agentsDir, `${agentData.name.replace(/\s+/g, "-").toLowerCase()}.md`);
  fs.writeFileSync(filePath, fullFileContent);
  outro(color.green(`\u2714 Successfully created subagent at ${filePath}
` + color.dim("Run `/agents refresh` in the Gemini CLI to load it.")));
}
main().catch(console.error);
