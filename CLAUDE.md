# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Hugo static site served by nginx, built and packaged entirely with Nix. There is no Dockerfile and no `docker` in the build path. Two independent deploy targets share the same Nix-built bytes:

- **k3s (local cluster)** — `just build && just push && just deploy`. The image is pushed over HTTP to a local registry at `localhost:5000`.
- **Cloudflare Pages (public URL)** — `just cf` uploads `packages.site` (the built static files) directly via wrangler.

## Common commands

All run from the devShell (enter with `nix develop`, or `direnv allow` in a shell with direnv).

| Command | What it does |
|---|---|
| `just serve` | Live-reload dev server → http://localhost:1313 (runs `hugo server -D`) |
| `just check` | Validate the site builds cleanly (catches broken layouts/frontmatter) |
| `just build` | Build the nginx OCI image via Nix → `./result` |
| `just test` | Load the image into docker, run it, curl `/`, expect HTTP 200 |
| `just push` | `just build` then `skopeo copy` to `localhost:5000/hugo-site:latest` |
| `just deploy` | `just push` then `kubectl apply -f manifests/` + rollout restart |
| `just cf` | Deploy built site to Cloudflare Pages production |
| `just forward` | Port-forward the cluster Service `:80` → local `:8080` |
| `just logs` | Tail the deployment's logs |
| `just doctor` | Pre-flight: k3s up, registry reachable, git index clean |

`just deploy` chains build → push → apply → rollout; there is no separate "run a single test" concept — `just test` is the one smoke test.

### Prerequisites for k3s deploy

k3s is on-demand. Start it before the first deploy: `sudo systemctl start k3s`. Run `just doctor` to confirm the cluster + local registry are reachable.

## Architecture: the Nix → image → k3s pipeline

`flake.nix` is the heart of the repo. Three derivations, read together:

1. **`staticAssets`** — `hugo -s build --minify` runs inside `runCommand` against the store path of `./site`. The store path is read-only, so the site is copied to a writable `build/` dir first. This build is **fully offline and reproducible** — no network, no lock/hash step (contrast with the npm-based React template, which needs `npmDepsHash`).
2. **`nginxConf`** — a from-scratch `buildImage` has no writable `/tmp`, no `/etc/passwd`, and nginx's defaults point pid/logs/temp at read-only store paths. The config overrides **all** of these: `daemon off`, `pid /tmp/nginx.pid`, every `*_temp_path` → `/tmp`, `error_log /dev/stderr`, and `listen 8080` (non-root can't bind <1024). The docroot is the `staticAssets` store path.
3. **`packages.image`** — `dockerTools.buildImage` with `copyToRoot` = [nginx, staticAssets, runtimeDirs, nonRootUser]. `config.User = "1000:1000"` and `Cmd` runs nginx with `-e /dev/stderr` so the pre-config error log never touches `/var/log/nginx`.

The image is intentionally **read-only-friendly**: nginx's writable dirs (`/tmp`, `/var/cache/nginx`, `/var/log/nginx`) are provided as runtime mounts — `emptyDir` + `fsGroup` in the k3s manifest, `--tmpfs /tmp` in `just test`. The manifests reinforce safe-by-default: non-root UID 1000, `readOnlyRootFilesystem`, dropped caps, no privilege escalation, seccomp=RuntimeDefault.

## Things that bite

- **Nix evaluates the git *index*, not the worktree.** Unstaged edits to `flake.nix` or `./site/` are invisible to `nix build`. Stage them (`git add`) or `just doctor` (which warns) will tell you. This is the #1 cause of "I changed it but nothing happened."
- **The image name must stay in lockstep** across `flake.nix` (`imageName`), `justfile` (`image`), and `manifests/deployment.yaml` (`image:`). Rename it in all three.
- **UID 1000 is baked in three places**: `flake.nix` (`config.User`, `nonRootUser` passwd entry) and `manifests/deployment.yaml` (`runAsUser`/`fsGroup`). The nginx config deliberately has **no `user` directive** because nginx can't switch users when non-root.

## Site structure

The site itself is minimal: one layout (`site/layouts/index.html`), one content file (`site/content/_index.md`), and `hugo.toml`. `site/package.json` declares Tailwind v4 + PostCSS, but no asset pipeline is wired into the layout yet — the devShell ships `nodejs_22` for when one is added.
