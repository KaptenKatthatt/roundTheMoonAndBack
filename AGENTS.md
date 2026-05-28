# AGENTS.md - Project Instructions for AI Agents

## Rules for Jules and other AI agents

### PR Creation Rules
- **Max 1 PR per issue/fix.** If a previous PR addressing the same problem exists, update it instead of creating a new one. Do NOT create duplicate PRs for the same fix.
- **Always check for existing open PRs** before creating a new one. If a similar PR exists, close it and create a single consolidated PR.
- **Keep PRs focused.** One concern per PR. Do not bundle unrelated changes.

### Performance Rules
- **Pre-allocate Three.js objects** (Vector3, Euler, Quaternion) outside render loops and useFrame. Never instantiate them inside hot paths.
- **Use target parameters** in math functions (e.g., `getPositionAt(t, target)`) to avoid allocations.
- **Keep security checks in place** when optimizing. Performance must not compromise security.

### Code Quality
- **Do NOT modify .jules/ files in PRs.** Learnings should be documented separately and should not be part of code changes.
- **Include tests** when adding new functionality or fixing bugs.
- **Keep changes minimal.** Small, focused diffs are easier to review and merge.
- **Never remove error handling** to "optimize" code. Proper error handling is always worth the small performance cost.

### PR Titles and Descriptions
- Use clear, descriptive titles. Avoid emoji spam.
- Describe what the change does and WHY, not just what.

### Review Process
- All PRs will be reviewed before merging.
- If a PR has merge conflicts, resolve them before requesting review.
- If a PR is closed without merging, do NOT recreate it without addressing the feedback.