---
description: Launch skill-creator skill for creating effective skills and extending Claude's capabilities
model: sonnet
allowed-tools: Skill, Write, Read, Edit, AskUserQuestion, TodoWrite, Bash, Glob, Grep
argument-hint: [skill-name] [skill-description]
---

# Skill Creator

Invoke the skill-creator skill to guide for creating effective skills. This skill should be used when users want to create a new skill (or update an existing skill) that extends Claude's capabilities with specialized knowledge, workflows, or tool integrations.

## Usage

Use this command when you need to:
- Create new custom skills for Claude Code
- Extend Claude's capabilities with specialized knowledge
- Design workflows for specific tasks or domains
- Integrate external tools and APIs into skills
- Update or improve existing skills
- Create skills for personal or project-specific use cases

## Examples

- `/slash-skill-creator` - Launch with interactive skill creation guidance
- `/slash-skill-creator "data-analyzer" "Analyze complex datasets"` - Create a data analysis skill
- `/slash-skill-creator "github-automation" "Automate GitHub workflows"` - Create GitHub automation skill
- `/slash-skill-creator "image-processor" "Process and edit images"` - Create image processing skill
- `/slash-skill-creator update "existing-skill-name"` - Update an existing skill

## Skill Creation Process

The skill-creator skill will guide you through:

### 1. **Skill Definition & Planning**
- Define skill purpose and scope
- Identify target use cases and workflows
- Plan skill architecture and structure
- Determine required tools and integrations

### 2. **Skill Structure Design**
- Create skill metadata and configuration
- Design skill documentation structure
- Plan skill directory organization
- Define skill interfaces and APIs

### 3. **Implementation Guidance**
- Provide code examples and templates
- Guide tool integration patterns
- Help with skill testing strategies
- Ensure best practices compliance

### 4. **Skill Documentation**
- Create comprehensive skill documentation
- Write usage examples and tutorials
- Document skill parameters and returns
- Provide troubleshooting guidance

### 5. **Testing & Validation**
- Guide skill testing procedures
- Help validate skill functionality
- Provide integration testing strategies
- Ensure skill reliability and performance

## Skill Types You Can Create

- **Workflow Skills**: Automate complex multi-step processes
- **Domain-Specific Skills**: Specialized knowledge for specific fields
- **Tool Integration Skills**: Connect external APIs and services
- **Data Processing Skills**: Handle specialized data formats and analysis
- **Creative Skills**: Generate content, art, or creative outputs
- **Utility Skills**: Helper functions and common tasks

## Skill Components

The skill-creator helps you create:

- **Skill Manifest**: Core metadata and configuration
- **Core Logic**: Main skill implementation
- **Tool Integrations**: External service connections
- **Documentation**: User guides and API docs
- **Tests**: Validation and testing procedures
- **Examples**: Usage demonstrations

## Best Practices for Skills

- **Clear Purpose**: Well-defined scope and use cases
- **Modular Design**: Reusable and maintainable code
- **Error Handling**: Comprehensive error management
- **Documentation**: Complete usage guides
- **Testing**: Thorough validation procedures

## Output Format

The skill-creator provides:
- Step-by-step creation guidance
- Code templates and examples
- Best practice recommendations
- Complete skill structure
- Documentation templates
- Testing strategies

Skill: skill-creator