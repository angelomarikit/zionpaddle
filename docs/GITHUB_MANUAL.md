# Git & GitHub manual — ZION Pickleball Store

Quick reference for daily Git work and GitHub (pull requests, `gh` CLI). Run commands from the project root:

```bash
cd "D:\pickle ball paddle"
```

---

## Setup & status

| Command | What it does |
|--------|----------------|
| `git status` | Changed / staged / untracked files |
| `git log --oneline -10` | Last 10 commits (short) |
| `git log -5 --oneline --graph` | Recent history with branch graph |
| `git diff` | Unstaged changes |
| `git diff --staged` | Staged changes |
| `git branch` | Local branches (`*` = current) |
| `git branch -a` | Local + remote branches |

---

## Daily workflow

```bash
git status
git diff

git add path/to/file
git add .                    # all changes — use carefully

git commit -m "Short message describing why"

git push -u origin HEAD      # first push on a new branch
git push                     # branch already tracks remote
```

**Commit messages:** one line, focus on *why* (e.g. `Fix order badge when unfulfilling`, `Apply platinum-gold admin theme`).

---

## Branches

```bash
git switch main
git pull origin main

git switch -c feature/your-branch-name
git switch feature/your-branch-name

git branch -d feature/your-branch-name   # delete merged local branch
```

---

## Undo / fix (prefer safe options)

| Situation | Command |
|-----------|---------|
| Unstage file (keep edits) | `git restore --staged <file>` |
| Discard edits in one file | `git restore <file>` |
| Amend last commit message (not pushed) | `git commit --amend -m "New message"` |
| Inspect a commit | `git show <commit-hash>` |

Avoid `git reset --hard` and `git push --force` unless you intend to rewrite or destroy history.

---

## Remote & GitHub

```bash
git remote -v                # usually origin → GitHub
git fetch origin             # download updates, no merge
git pull origin main         # fetch + merge into current branch
```

### First-time: clone or connect

```bash
git clone https://github.com/<owner>/<repo>.git
cd <repo>
```

If the folder already exists locally and you only need to add GitHub:

```bash
git remote add origin https://github.com/<owner>/<repo>.git
git push -u origin main
```

---

## Stash (save work in progress)

```bash
git stash push -m "wip description"
git stash list
git stash pop
```

---

## Tags & inspect

```bash
git tag
git blame path/to/file
```

---

## Pull requests (GitHub CLI)

Install [GitHub CLI](https://cli.github.com/) and sign in: `gh auth login`.

```bash
git status
git diff
git log main..HEAD --oneline

git push -u origin HEAD

gh pr create --title "Title" --body "$(cat <<'EOF'
## Summary
- ...

## Test plan
- [ ] ...

EOF
)"
```

Other useful `gh` commands:

```bash
gh pr list
gh pr view <number> --web
gh pr checks
gh issue list
```

---

## Project docs (related)

- Supabase / hosting setup: [`docs/PHASE5_SUPABASE.md`](PHASE5_SUPABASE.md)
- Orders behavior: [`docs/PHASE6_ORDERS.md`](PHASE6_ORDERS.md)
- Admin CMS: [`docs/PHASE7_CMS.md`](PHASE7_CMS.md)

---

## Troubleshooting: `failed to push some refs`

### 1. No upstream branch (first push)

```text
fatal: The current branch master has no upstream branch.
```

Fix:

```bash
git push -u origin master
```

(Use `main` instead of `master` if that is your default branch.)

### 2. Remote has commits you do not have (rejected / non-fast-forward)

```text
error: failed to push some refs to 'https://github.com/...'
hint: Updates were rejected because the remote contains work that you do not have locally.
```

GitHub often creates an initial README or license. Pull first, then push:

```bash
git pull origin master --rebase
# resolve conflicts if any, then:
git push origin master
```

If histories are unrelated (empty local vs README-only remote):

```bash
git pull origin master --allow-unrelated-histories
# fix conflicts, commit if needed
git push -u origin master
```

### 3. Auth / permission

Sign in again:

```bash
gh auth login
```

Or use a [Personal Access Token](https://github.com/settings/tokens) as the password when Git prompts you.

---

## Safety reminders (this repo)

- Do not commit `.env` or secrets — use `.env.example` as the template.
- Prefer small, focused commits.
- Do not force-push to `main` / `master` without explicit need.