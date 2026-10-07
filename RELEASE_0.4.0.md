# v0.4.0 — opt-in voice finalization controls

Expanded composer hosts may provide `onSendVoice` alongside `onStopVoice`.
The host must wait for complete final recognition and use its existing governed
submission path. The primitive performs no recognition, network request or action.

Expanded recording presentation: Cancel, blue indicator, elapsed timer, real
measured levels when available, Stop, optional Send. Recording status remains
screen-reader accessible without a redundant visible label/interim transcript.
`voiceStopping` disables Stop/Send and freezes the recording indicator; Cancel
remains available. Reduced motion disables blinking. Compact hosts retain their
existing controls and text; no host migration is forced.

Validation: `npm run check` passes publication/firewall guard, typecheck, build,
dist parity and 60 tests. No native speech, upload, runtime-stage or authority
contract added.
