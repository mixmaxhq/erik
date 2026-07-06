# erik — repo card

> A map, not a manual. Keep it ~1 screen; point to detail, don't inline it.

## What it is
A Node.js library that wraps Karma + Headless Chrome to run client-side Jasmine test suites via gulp, without requiring consumers to configure Karma directly. Published to npm as `erik`.

## serves
role: Headless Jasmine test runner (gulp plugin) for Mixmax frontend repos with client-side spec suites
referenced-by: [any Mixmax service that has a gulpfile-based Jasmine test setup — install `erik` as a dev dependency]

## Code map
- Main export (Erik class) -> `index.js`
- Package metadata / dependencies -> `package.json`

## Conventions
- CommonJS (`require`/`module.exports`) — no transpilation
- `new Erik({gulp, localDependencies, ...})` registers `erik`, `erik-fetch-remote-deps`, and `erik-run-spec` gulp tasks; consumers run `gulp erik [--watch]`
- Remote dependencies (CDN `<script>` tags from `SpecRunner.html`) go in `remoteDependencies`; local bundled files go in `localDependencies` (glob order matters)
- Karma config is intentionally thin — no preprocessing; consumers handle bundling before calling Erik

## Gotchas
- `localDependencies` must be non-empty or the constructor throws
- `options.bundledSpecPath` is deprecated — fold it into `localDependencies`
- `singleRun` is `true` unless `watch: true`; CI must not pass `--watch`
- Karma exit code drives the process exit code — CI integration works automatically

## Run / test
```bash
npm install -D erik          # install in consuming repo
gulp erik                    # run specs once
gulp erik --watch            # watch mode
```
No tests in this repo itself (`npm test` exits 1).

## Load the matching domain card
This repo is cross-cutting tooling — it owns no product domain, so there is no domain card to load. When working here, load the card of the consuming service/domain if the change is driven by its needs.
