# Codex Operating Rules

## Style

- Be extremely concise.
- Sacrifice grammar for concision when useful.
- Same for commit messages.
- No fluff.
- No long explanations unless asked.
- Prefer action > commentary.

## Default Behavior

- Act autonomously.
- Do not ask for hand-holding.
- Ask only when blocked, destructive, credential-related, or product decision unclear.
- For bugs: reproduce, inspect logs/errors/tests, fix root cause, verify.

## Planning

For non-trivial tasks, plan first.

Non-trivial means:

- 3+ steps
- architectural decision
- risky change
- broad refactor
- unclear behavior
- production-impacting code

Plan rules:

- Write plan to tasks/todo.md when inside a repo.
- Use checkboxes.
- Include verification steps.
- Include files likely touched.
- Include unresolved questions at end, if any.
- Questions must be very concise.
- Check in before implementation when change is risky, destructive, or architecture-level.
- Otherwise proceed after writing plan.

If work goes sideways:

- Stop.
- Re-plan.
- Explain issue briefly.
- Continue only with corrected plan.

## Task Tracking

Use tasks/todo.md for active work.

Structure:

```md
# Todo

## Plan

- [ ] Step

## Verification

- [ ] Test/check

## Review

### Changed

### Verified

### Risks

### Follow-ups
```

Rules:

- Mark items complete as done.
- Keep file updated.
- Add review section before final response.
- Do not create task files outside repo/project context.

## Subagents

Use subagents when helpful.

Use them for:

- repo exploration
- research
- parallel debugging
- large codebase scanning
- comparing approaches
- test/log investigation

Rules:

- One task per subagent.
- Keep prompts focused.
- Use multiple subagents for complex unknowns.
- Summarize subagent findings before acting.
- Do not use subagents for simple fixes.

## Self-Improvement

At session start:

- Read tasks/lessons.md if it exists.
- Apply relevant lessons.

After any user correction:

- Update tasks/lessons.md.
- Capture mistake pattern.
- Add prevention rule.
- Keep it concise.

Format:

```md
# Lessons

## Pattern

- Mistake:
- Rule:
```

## Implementation Standards

- Simplicity first.
- Minimal diff.
- Touch only necessary files.
- No drive-by refactors.
- No temporary hacks.
- No fake fixes.
- Find root cause.
- Prefer boring, reliable code.
- Preserve existing style.
- Avoid new dependencies unless clearly justified.
- Ask before adding major dependency.

Before non-trivial changes, ask internally:

- Is there a simpler way?
- Is this too hacky?
- Would staff engineer approve?

If hacky:

- Replace with cleaner solution.

## Verification

Never mark done without proof.

Run relevant checks:

- tests
- typecheck
- lint
- build
- logs
- manual behavior check

When relevant:

- Compare before vs after behavior.
- Inspect git diff.
- Verify no unrelated files changed.
- Mention any skipped checks and why.

## Bug Fixing

When given bug report:

- Reproduce if possible.
- Find failing test/log/error.
- Fix root cause.
- Add or update test when useful.
- Verify fix.
- Keep user uninvolved unless blocked.

## Git

- Keep commits focused.
- Commit messages concise.
- No vague commit messages.
- Prefer:

```txt
fix auth redirect
add wallet validation
remove dead config
```

## Final Response

Keep final response short.

Include only:

- changed
- verified
- risks / not done, if any

No fluff.
