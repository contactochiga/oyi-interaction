# oyi-interaction

The shared Oyi **human-interaction foundation**. Oyi Consumer and Oyi Facility consume it through thin
surface adapters: one interaction grammar, with surface-specific context, navigation and authority.

This package is **not** another intelligence runtime, orchestrator, memory, authority layer, action state machine or conversation store. Its state is a projection of canonical Oyi Core truth plus genuine local interaction state, nothing else.

## Distribution and versioning
Neither app runs in a monorepo, and Consumer (Next 15.1 / React 19.1 / Tailwind 4) and Facility (Next 15.5 / React 19.2 / Tailwind 3) differ. The package therefore follows the pattern Facility already uses for `oyi-twin-engine`: a dedicated repository installed as a **git dependency pinned to a commit SHA**.

```json
"oyi-interaction": "git+https://github.com/contactochiga/oyi-interaction.git#<commit-sha>"
```

- **Releases.** `package.json` `version` is semver. Every release commit is tagged `vX.Y.Z`, and apps pin the tag's commit SHA, which is immutable.
- **Compiled `dist/` is committed.** It holds ESM, `.d.ts` and the stylesheet, so apps need no `transpilePackages`, prepare step or registry. `npm run verify:dist` fails if `dist/` differs from a fresh build of `src/`.
- **One peer dependency.** `react >= 19`. There are no runtime dependencies: no Tailwind, icon library, state library or network client.
- **Upgrading.** Release here (bump the version, build, tag, push). Then bump the SHA in both apps in the same change, so Consumer and Facility always run the same interaction grammar.

## Entry points
| Import | Contents |
| --- | --- |
| `oyi-interaction/core` | Framework-free contracts: action truth, canonical response projection, interaction reducer + precedence, orb contract, composer state machine, caption model, suggestion / history normalization, surface adapter contract, voice adapter interface |
| `oyi-interaction` | `core` plus React primitives and hooks: `OyiOrb` (CSS fallback renderer), `OyiCaption`, `OyiComposer`, `OyiSuggestions`, `OyiConfirmation`, `OyiActionResult`, `OyiHistory`, `OyiShell`, `useOyiInteraction`, `useOyiConnectivity`, `useOyiFocusTrap`, `useOyiReducedMotion`, `useOyiPageVisible`, `useOyiLayout` |
| `oyi-interaction/styles.css` | `--oyi-*` design tokens and primitive styles (plain CSS) |
| `oyi-interaction/fixtures/*` | The Backend-generated action-truth contract fixture, the expected interaction outcomes, and the pure expectation function used by both apps' cross-surface smokes |

## Truth rules
- **Approval is not verification.** USER APPROVED ≠ COMMAND SENT ≠ PROVIDER ACCEPTED ≠ PHYSICAL EFFECT VERIFIED.
- **Only canonical `confirmed` is verified.** `verifying` and `confirmed` are read from canonical evidence only (`action.updated` with the same action id) and never synthesized.
- **In flight means WORKING.** A request in flight shows as WORKING. Backend streams no semantic stages today, so `OYI_CANONICAL_STREAM_STAGES` is empty and every `turn.stage` event is ignored.
- **State precedence:** listening/transcribing > offline > working > responding > canonical truth of the current turn > degraded > idle.
  - `persistence_saved: false` adds a degraded flag without erasing the answer.
  - A result from an earlier turn never drives a new turn.

## Facility realtime firewall
The package contains no reference to Facility realtime or to any socket or network transport. `npm run guard` checks this statically over `src/` and `dist/`. `test/firewall.test.mjs` proves it at runtime: it loads and exercises the whole package with every network constructor trapped. Mounting or unmounting Oyi never owns socket lifecycle.

## Voice
`OyiVoiceAdapter` is an interface only. Browser Web Speech is **not** a reliable installed-app solution: it is missing or restricted in iOS/Android WebViews. A native (Capacitor) implementation will land later behind the same interface.

## Commands
`npm run check` runs typecheck, guard, build, verify:dist, expectations and tests.

When the Backend contract fixture changes:
1. Copy `Ochiga-backend/docs/contracts/oyi-action-truth.fixture.json` to `fixtures/`.
2. Run `node scripts/expectations.mjs --write`.
3. Review the diff, then release.
