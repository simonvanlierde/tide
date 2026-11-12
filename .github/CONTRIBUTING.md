# Contributing

Thank you for your interest in tide. Bug reports, feature requests and pull
requests are welcome. Please read the [Code of Conduct](CODE_OF_CONDUCT.md) first, and
report vulnerabilities as [SECURITY.md](SECURITY.md) describes, not in a public issue.

## Report a bug or ask for a feature

Open an [issue](https://github.com/simonvanlierde/tide/issues) with the bug or
feature form. For a bug, say what you did, what you expected and what happened, with the
version you used. A question the README and docs don't answer is a gap in the docs: open
a feature request for it.

## Scope and response

One person maintains tide, in their own time. Expect a reply to an issue or
pull request within about two weeks.

Before a large pull request, such as a new feature or a change to how something works,
open an issue and agree on the change there first. A small fix needs no issue. A pull
request outside what the project sets out to do is closed with a link to this section.

## Set up and check

[Development](../CONTRIBUTING.md#development) in the root CONTRIBUTING.md installs the tools, the dependencies
and the git hooks. `just check` runs the checks CI runs, and `just fmt` fixes and
formats. It also has the architecture and the
things that trip people up.

Each change comes with tests. Run a new regression test against the old code first and confirm that it fails for the intended reason.
Follow the existing TypeScript style; Biome checks formatting and lint rules, and TypeScript checks types.
Run `just check` and the Chromium e2e tests (`just ts-e2e --project=chromium --timeout=15000 --reporter=line`) before opening a pull request.

pnpm locks only releases at least a week old. If `just check` fails on
a security fix newer than that, add the package to `minimumReleaseAgeExclude` in `pnpm-workspace.yaml`,
and remove it a week later ([how](https://github.com/simonvanlierde/project-templates/blob/main/docs/tooling.md#dependencies)).

## Write commits and pull requests

- **Commits** follow [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/):
  `type(scope): summary`, in the imperative, lower case, with no period. Add a body only
  when the change needs one, with a bullet per logical chunk.
- **The pull request title** becomes the squash commit subject, so it follows the same rule.
- **Both are checked** against [`committed.toml`](../committed.toml): a commit-msg
  hook (installed by `prek install`) refuses a commit message that breaks the rule, and
  the `pull request title` check fails a pull request whose title does. Lower case isn't
  checked. A revert is titled `revert: <original subject>`: rename the
  `Revert "..."` title that GitHub's Revert button writes.
- **The pull request body** follows [the pull request template](pull_request_template.md).
- **The changelog** ([CHANGELOG.md](../CHANGELOG.md)) follows
  [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/). Write each entry for
  the people who use the project, not as a commit subject. Mark breaking changes
  **Breaking**, and put upgrade steps first under the version.
- **The release notes** are that version's changelog section.

## Make a release

First, set the version in `package.json` to `X.Y.Z` and commit it.
Run `just release X.Y.Z` to prepare the changelog commit. Merge both commits to `main`.
On up-to-date `main`, run `just release X.Y.Z` again to sign and push the tag.
The tag script refuses a manifest version that differs from the requested release.

[Publishing](https://github.com/simonvanlierde/project-templates/blob/main/docs/usage.md#publishing) has the steps and the one-time setup.

## Sign off your commits

Every commit in a pull request carries a `Signed-off-by:` line, which says you wrote the
change or have the right to submit it under this project's license: the
[Developer Certificate of Origin 1.1](https://developercertificate.org/). `git commit -s`
adds the line, and the commit-msg hook refuses a commit without it.

To add it to commits you already made, run `git fetch origin`, then
`git rebase --signoff origin/main`. That works in a clone of this repository, where `origin`
is the only remote. If you work from a fork, use the remote that points at this repository
(often `upstream`) in place of `origin`. If you have not pushed the branch yet, that is all.
If you pushed it already, update it with `git push --force-with-lease`, which refuses to
overwrite work you have not seen. Do not use a plain `git push --force`.

The `dco` workflow checks every pull request from a fork and fails on a commit without the line. Pull requests from a branch in this repository skip it: pushing that branch already needed write access.

## Who maintains this

Simon van Lierde maintains tide: reviews pull requests, merges them and
makes releases. The repository belongs to [simonvanlierde](https://github.com/simonvanlierde)
on GitHub. Only maintainers can merge to `main`. A new maintainer is added by an existing one, by name in this section.
If no maintainer can continue, the repository is archived with a note in the README,
and anyone may fork it under its license.
