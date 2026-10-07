# Interaction reference foundation — 0.2.0

This minor pre-1.0 release reconciles the preserved reference-shell draft.
The package remains presentation-only: React peer, CSS variables, no transport.

## Draft review

| Draft area | Decision | Reconciliation |
| --- | --- | --- |
| Shell and responsive CSS | REFINE | Keep desktop sidebar/mobile drawers; retain layout prop; background and closed panels inert; focus containment and return |
| Orb icon size | KEEP | CSS renderer only; reduced motion and hidden-page pause retained |
| Caption expansion | KEEP | Full response retained, explicit expand control |
| Composer and voice meter | REFINE | One mic/send affordance; exact minimal placeholder; bounded finite measured levels; IME and duplicate-send guard |
| Context selector | REFINE | Native select for keyboard semantics; never chooses an inactive scope |
| Notice | KEEP | Status/alert semantics; no success inference |
| Progress | REFINE | Reject inferred preceding steps; only the current observed phase/action state |
| Exports/version | KEEP | Additive primitives and core helpers |
| Publication guard/build hook/tests | REFINE | Retain fail-closed scan; redact matched content from diagnostics |
| Existing test edits | KEEP | Reserved example URL instead of non-example destination |
| Tests for draft components | INCOMPLETE → completed | Progress truth, drawer semantics, context selection, measured levels, captions and composer regression coverage |

No animation represents internal reasoning. Idle produces no progress. No
native voice or graphics runtime has been added. Facility hosts may continue
using their existing dialog without adopting the new shell.

Validation: `npm run check` includes typecheck, source/distribution guard,
build, fresh-build parity, shared contract expectations, render/accessibility,
reduced-motion, publication, action-truth and network-firewall tests.

Shell is a controlled primitive. Hosts should open only one drawer, provide
close controls, and put history into the desktop sidebar slot as well as the
mobile history slot. Context options must come from the host's real context.
