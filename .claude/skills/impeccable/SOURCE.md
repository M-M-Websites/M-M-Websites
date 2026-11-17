# Source

- Project: Impeccable, by Paul Bakaus (pbakaus)
- URL: https://github.com/pbakaus/impeccable
- Homepage: https://impeccable.style
- License: Apache License 2.0 (see LICENSE)
- Third-party notices: see NOTICE.md
- Vendored: the official Claude skill's `SKILL.md` and `reference/` playbooks (clean visual design, critique, polish, layout, typography, anti-slop rules).
- Skipped: `scripts/impeccable`, `scripts/impeccable.cmd`, `engine-checksums.txt`, and the rest of `scripts/`. The official launcher downloads a platform binary from https://github.com/pbakaus/impeccable/releases on first run. That remote install was not copied and was not executed. Design guidance in the markdown files works without the engine; CLI verbs (`impeccable context`, hooks, pin) will not run until the official engine is installed separately.
