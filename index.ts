#!/usr/bin/env node
import { intro, outro, text, select, multiselect, spinner, isCancel, note } from '@clack/prompts';
import color from 'picocolors';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

// --- TOOL MAPPINGS ---
// We map the high-level categories to the actual Gemini CLI tools
const TOOL_GROUPS = {
    read: ['read_file', 'read_many_files', 'list_directory', 'glob', 'grep_search'],
    edit: ['write_file', 'replace'],
    exec: ['run_shell_command'],
    mcp: ['mcp_tools'],
    other: ['google_web_search', 'web_fetch', 'save_memory', 'enter_plan_mode', 'write_todos']
};

async function generateAgentContent(intent: string) {
    const s = spinner();
    s.start('Asking Gemini (via your CLI) to design your subagent');

    const prompt = `
    You are an expert prompt engineer. The user wants to create an AI subagent for a CLI tool.
    User's request: "${intent}"
    
    Respond strictly in JSON format with three keys:
    1. "name": A short, hyphenated name (e.g., "security-auditor").
    2. "description": A one-sentence description of when to trigger this subagent.
    3. "system_prompt": A detailed system prompt giving the agent its persona.
    `;

    try {
        const { stdout } = await execFileAsync('gemini', ['-p', prompt]);
        s.stop('Gemini has drafted your agent!');
        
        let rawText = stdout.trim();
        if (rawText.startsWith('```json')) {
            rawText = rawText.replace(/^```json\n?/, '').replace(/```$/, '').trim();
        } else if (rawText.startsWith('```')) {
            rawText = rawText.replace(/^```\n?/, '').replace(/```$/, '').trim();
        }
        return JSON.parse(rawText);
    } catch (error: any) {
        s.stop(color.red('Failed to communicate with the Gemini CLI.'));
        throw new Error("CLI execution failed");
    }
}

function handleCancel<T>(value: T | symbol | undefined): asserts value is T {
    if (isCancel(value) || value === undefined) {
        outro(color.yellow('Wizard cancelled. No files were created.'));
        process.exit(0);
    }
}

async function main() {
    console.clear();
    intro(`${color.bgCyan(color.black(' Gemini Subagent Wizard '))} ${color.dim('v1.4')}`);

    // STEP 1: SCOPE
    const scope = await select({
        message: 'Create new agent\n' + color.dim('Select agent scope'),
        options: [
            { value: 'project', label: '1. Project-level (.gemini/agents/)' },
            { value: 'user', label: '2. User-level (~/.gemini/agents/)' },
        ],
    });
    handleCancel(scope);

    // STEP 2: CREATION METHOD
    const method = await select({
        message: 'Create new agent\n' + color.dim('Creation method'),
        options: [
            { value: 'auto', label: '1. Generate with Gemini (recommended)' },
            { value: 'manual', label: '2. Manual configuration' },
        ],
    });
    handleCancel(method);

    let agentData = { name: '', description: '', system_prompt: '' };

    if (method === 'auto') {
        const intent = await text({
            message: 'What should this subagent do?',
            placeholder: 'e.g., Review code for security flaws',
            validate(value) {
                if (!value || value.trim().length === 0) return 'Please provide a description!';
            },
        });
        handleCancel(intent);

        try {
            agentData = await generateAgentContent(intent);
        } catch (e) {
            outro(color.red('Exiting due to AI generation error.'));
            process.exit(1);
        }
    } else {
        const manualName = await text({
            message: 'Agent Name:',
            placeholder: 'e.g., code-quality-reviewer',
            validate: (val) => !val ? 'Name is required' : undefined
        });
        handleCancel(manualName);

        const manualDesc = await text({
            message: 'Description (Trigger constraint):',
            placeholder: 'e.g., Use this agent to review python code.',
            validate: (val) => !val ? 'Description is required' : undefined
        });
        handleCancel(manualDesc);

        const manualPrompt = await text({
            message: 'System Prompt (Role and expertise):',
            placeholder: 'You are an expert...',
            validate: (val) => !val ? 'System prompt is required' : undefined
        });
        handleCancel(manualPrompt);

        agentData = {
            name: manualName,
            description: manualDesc,
            system_prompt: manualPrompt
        };
    }

    // STEP 3: TOOLS (Now matches the screenshot exactly)
    let finalTools: string[] = [];
    
    const categoryChoices = await multiselect({
        message: 'Create new agent\n' + color.dim('Select tools (Space to toggle, Enter to continue)'),
        options: [
            { value: 'all', label: 'All tools' },
            { value: 'read', label: 'Read-only tools' },
            { value: 'edit', label: 'Edit tools' },
            { value: 'exec', label: 'Execution tools' },
            { value: 'mcp', label: 'MCP tools' },
            { value: 'other', label: 'Other tools' },
            { value: 'advanced', label: color.dim('[ Show advanced options ]') }
        ],
        required: false,
    });
    handleCancel(categoryChoices);

    // Process the tool selection logic
    const choices = categoryChoices;

    if (choices.includes('advanced')) {
        // If they clicked Advanced, show the massive detailed list
        const advancedTools = await multiselect({
            message: color.dim('Advanced Tool Selection (Space to select, Enter to continue)'),
            options: [
                { value: 'read_file', label: color.cyan('Read') + '  - read_file' },
                { value: 'read_many_files', label: color.cyan('Read') + '  - read_many_files' },
                { value: 'list_directory', label: color.cyan('Read') + '  - list_directory' },
                { value: 'glob', label: color.cyan('Read') + '  - glob' },
                { value: 'grep_search', label: color.cyan('Read') + '  - grep_search' },
                { value: 'write_file', label: color.yellow('Edit') + '  - write_file' },
                { value: 'replace', label: color.yellow('Edit') + '  - replace' },
                { value: 'run_shell_command', label: color.red('Exec') + '  - run_shell_command' },
                { value: 'google_web_search', label: color.blue('Web ') + '  - google_web_search' },
                { value: 'web_fetch', label: color.blue('Web ') + '  - web_fetch' },
                { value: 'mcp_tools', label: color.green('MCP ') + '  - mcp_tools' },
                { value: 'save_memory', label: color.magenta('Mem ') + '  - save_memory' },
                { value: 'enter_plan_mode', label: color.magenta('Mem ') + '  - enter_plan_mode' },
                { value: 'write_todos', label: color.magenta('Mem ') + '  - write_todos' },
            ],
            required: false,
        });
        handleCancel(advancedTools);
        finalTools = advancedTools;
    } else if (choices.includes('all')) {
        // If they chose All Tools, grab everything from our mapping
        finalTools = [...TOOL_GROUPS.read, ...TOOL_GROUPS.edit, ...TOOL_GROUPS.exec, ...TOOL_GROUPS.mcp, ...TOOL_GROUPS.other];
    } else {
        // Map the specific categories they checked to the underlying tools
        if (choices.includes('read')) finalTools.push(...TOOL_GROUPS.read);
        if (choices.includes('edit')) finalTools.push(...TOOL_GROUPS.edit);
        if (choices.includes('exec')) finalTools.push(...TOOL_GROUPS.exec);
        if (choices.includes('mcp')) finalTools.push(...TOOL_GROUPS.mcp);
        if (choices.includes('other')) finalTools.push(...TOOL_GROUPS.other);
    }

    // Remove duplicates just in case
    finalTools = [...new Set(finalTools)];

    // STEP 4: MODEL
    const targetModel = await select({
        message: 'Create new agent\n' + color.dim('Select model'),
        options: [
            { value: 'inherit', label: '1. Inherit (Use main conversation model)' },
            { value: 'gemini-2.5-flash', label: '2. Gemini 2.5 Flash (Fast tasks)' },
            { value: 'gemini-2.5-pro', label: '3. Gemini 2.5 Pro (Complex analysis)' },
        ],
    });
    handleCancel(targetModel);

    // --- ASSEMBLE THE FILE CONTENT FOR PREVIEW ---
    let frontmatter = `---
name: ${agentData.name}
description: ${agentData.description}
model: ${targetModel}
`;

    if (finalTools.length > 0) {
        frontmatter += `tools:\n`;
        finalTools.forEach(t => frontmatter += `  - ${t}\n`);
    }
    frontmatter += `---\n\n`;
    
    const fullFileContent = frontmatter + agentData.system_prompt;

    // --- STEP 5: THE PREVIEW BOX ---
    note(color.dim(fullFileContent), 'Agent Preview (.md file)');

    // --- STEP 6: FINAL CONFIRMATION ---
    const confirm = await select({
        message: 'How would you like to proceed?',
        options: [
            { value: 'save', label: color.green('✔ Save and create agent') },
            { value: 'discard', label: color.red('✖ Discard and exit') },
        ],
    });
    handleCancel(confirm);

    if (confirm === 'discard') {
        outro(color.yellow('Agent discarded. No files were written.'));
        process.exit(0);
    }

    // --- WRITE THE FILE ---
    const agentsDir = scope === 'project' 
        ? path.join(process.cwd(), '.gemini', 'agents') 
        : path.join(os.homedir(), '.gemini', 'agents');

    fs.mkdirSync(agentsDir, { recursive: true });
    const filePath = path.join(agentsDir, `${agentData.name.replace(/\s+/g, '-').toLowerCase()}.md`);

    fs.writeFileSync(filePath, fullFileContent);

    outro(color.green(`✔ Successfully created subagent at ${filePath}\n` + color.dim('Run `/agents refresh` in the Gemini CLI to load it.')));
}

main().catch(console.error);