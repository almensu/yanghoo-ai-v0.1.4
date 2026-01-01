---
description: Launch task_skill skill for executing spec-driven tasks with strict context control
model: sonnet
allowed-tools: Skill, Read, TodoWrite, AskUserQuestion
argument-hint: [task-description]
---

# Task Skill Executor

Invoke the task_skill skill to execute exactly one unchecked task from specs/<current>/tasks.md with strict context control, no anticipation, and mandatory verification evidence. Enforces Spec version alignment with specs/index.md.

## Usage

Use this command when you need to:
- Execute a specific task from a project specification
- Implement tasks with strict version control and verification
- Execute spec-driven development tasks
- Run individual tasks with mandatory evidence verification
- Ensure alignment between tasks and current specs

## Examples

- `/slash-taskskill` - Launch with interactive task selection
- `/slash-taskskill implement user authentication` - Execute specific task
- `/slash-taskskill setup database schema` - Run database-related task
- `/slash-taskskill create API endpoints` - Implement API task

## Process Flow

The task_skill skill will:
1. **Load Current Spec**: Read specs/index.md for current version
2. **Select Task**: Execute exactly one task from specs/<current>/tasks.md
3. **Strict Control**: No anticipation, precise context management
4. **Mandatory Verification**: Require evidence for task completion
5. **Version Alignment**: Ensure compatibility with current spec version

## Task Execution Requirements

- Execute only ONE unchecked task per session
- Provide mandatory verification evidence
- Maintain strict context control
- No speculation or anticipation
- Ensure Spec version alignment
- Follow exact task specifications

## Output Format

The skill provides structured output including:
- Task identification and context
- Step-by-step execution process
- Verification evidence and results
- Spec version compliance confirmation
- Task completion status

Skill: task_skill