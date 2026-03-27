# Local Testing Guide

## Quick Start

### 1. Build the extension
```bash
npm run build
```

### 2. Link to Gemini CLI

From this directory, run:

```bash
gemini extensions link .
```

This automatically registers the extension with your Gemini CLI - LOCALLY

### 3. Test the extension

Start a new Gemini CLI session:

```bash
gemini
```

Then test the command:

```
/subagent:create
```

## Development Workflow

### Watch mode (optional)

For rapid iteration, you can use `tsx` to run without building:

```bash
npm run dev
```

### After making changes

1. Rebuild: `npm run build`
2. Restart your Gemini CLI session (or reconnect the extension from the MCP Server view)
3. Test: `/subagent:create`

### Unlink extension

To remove the extension link:

```bash
gemini extensions unlink .
```

## Testing Checklist

- [ ] Extension loads without errors
- [ ] `/subagent:create` command appears in autocomplete
- [ ] Wizard launches and displays intro screen
- [ ] Settings check warns if `enableAgents` is not set
- [ ] Scope selection (project vs user) works
- [ ] Auto-generation mode calls Gemini CLI successfully
- [ ] Manual mode accepts all inputs
- [ ] Tool selection (categories and advanced) works
- [ ] Model selection works
- [ ] Preview displays correctly
- [ ] Save creates `.md` file in correct location
- [ ] Generated agent file has valid YAML frontmatter
- [ ] `/agents refresh` loads the new agent

## Common Issues

### Command not found
- Verify you ran `gemini extensions link .` from the project directory
- Check that `dist/index.js` exists after building
- Restart Gemini CLI

### Settings warning appears
- Add to `~/.gemini/settings.json`:
  ```json
  "experimental": {
    "enableAgents": true
  }
  ```

### Gemini CLI call fails
- Ensure `gemini` command is in your PATH
- Test manually: `gemini -p "test"`

## Manual Testing Scenarios

### Scenario 1: Auto-generate agent
1. Run `/subagent:create`
2. Select "Project-level"
3. Select "Generate with Gemini"
4. Enter: "Review Python code for PEP 8 compliance"
5. Select "Read-only tools"
6. Select "Gemini 2.5 Flash"
7. Verify preview looks correct
8. Save and check `.gemini/agents/` directory

### Scenario 2: Manual configuration
1. Run `/subagent:create`
2. Select "User-level"
3. Select "Manual configuration"
4. Name: "security-auditor"
5. Description: "Audit code for security vulnerabilities"
6. System Prompt: "You are a security expert..."
7. Select "Advanced" tools, pick specific ones
8. Select "Gemini 2.5 Pro"
9. Save and verify `~/.gemini/agents/security-auditor.md`

### Scenario 3: Cancel workflow
1. Run `/subagent:create`
2. Press Ctrl+C or select "Discard"
3. Verify no files were created
4. Verify clean exit message

## Debugging

Enable verbose logging by checking the Gemini CLI output for any errors during extension loading or command execution.

Check generated files:
```bash
# Project-level agents
ls -la .gemini/agents/

# User-level agents
ls -la ~/.gemini/agents/
```

Validate YAML frontmatter:
```bash
head -n 10 .gemini/agents/your-agent.md
```



gemini extensions uninstall subagent
gemini extensions link .