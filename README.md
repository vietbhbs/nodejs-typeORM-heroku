# Awesome Project Build with TypeORM

Steps to run this project:

1. Run `yarn` command
2. Setup database settings inside `data-source.ts` file
3. Run dev `yarn dev` command
4. Run production `yarn prod` command

### 2. Rule commit

## Rule Commit Message

Based on the Angular convention:

```
type(scope?): subject
```

- build: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
- ci: Changes to our CI configuration files and scripts (example scopes: Gitlab CI, Circle, BrowserStack, SauceLabs)
- chore: add something without touching production code (Eg: update npm dependencies)
- docs: Documentation only changes
- feat: A new feature
- fix: A bug fix
- perf: A code change that improves performance
- refactor: A code change that neither fixes a bug nor adds a feature
- revert: Reverts a previous commit
- style: Changes that do not affect the meaning of the code (Eg: adding white-space, formatting, missing semi-colons,
  etc)
- test: Adding missing tests or correcting existing tests
