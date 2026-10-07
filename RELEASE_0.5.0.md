# v0.5.0 — compact shared identity

Use `<OyiOrb size="identity" state="idle" />` for a 44px identity Orb.
It reuses the existing body, halo, core gradient and internal wordmark. Only this
size has a compact 12px glow and optically sized 13px lettering. Its passive
accessible name is `Oyi`; state remains available as the accessible description.
Existing interactive semantics, sizes, runtime states and motion rules are intact.

Existing icon/small/medium/large consumers need no migration. Composer, voice,
networking and action authority are unchanged. No separate logo renderer added.

`npm run check`: 61 tests PASS, typecheck/build, dist parity, publication and
realtime firewall guards. 92 server-render comparisons against v0.4.0 prove
unchanged old Orb variants and compact composer markup. Actual application
migration remains the responsibility of each host.
