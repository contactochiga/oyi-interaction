# Composer control refinement — 0.3.0

Additive opt-in `controlsLayout="expanded"`: persistent microphone/send controls
and leading Cancel during recording. Existing compact host layout is unchanged.
`voiceElapsedSeconds` displays host-observed duration; `voiceStopping` disables
repeated Stop while the host finalizes transcription. Voice remains callback-only;
no provider, upload, native plugin, realtime, or permission authority is added.

Attachments remain host-owned via the existing slot. A slot is not proof of
Backend attachment support. Hosts must expose only their accepted upload contract.

Validation: `npm run check`, 59 tests, guards/build/typecheck/dist parity. Expanded
mode tests cover empty disabled Send, typing Mic+Send, leading Cancel, timer and
finalization. Existing compact behavior and network firewall tests stay intact.
