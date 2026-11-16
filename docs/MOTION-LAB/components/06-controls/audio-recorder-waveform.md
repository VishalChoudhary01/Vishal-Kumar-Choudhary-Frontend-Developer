# Audio Recorder Waveform

**Status:** Proposed · **Category:** Input and media controls · **Milestone:** 5 — Advanced interaction systems

## Purpose
Capture a user's microphone input and communicate recording state through a live frequency meter, elapsed duration, and local playback. This is an audio-input control, not a decorative audio visualizer, media player, or speech-to-text feature.

## Visual composition
- Use a restrained surface, semantic border and compact layout consistent with the Motion Lab design system.
- Show a concise title, clear microphone permission context, recording state, elapsed time and maximum duration.
- The waveform is the dominant visual during capture. Use a bounded bar count and a steady baseline; do not add glow, particle effects, or a large animated background.
- Recording state uses the semantic error/danger token only while actively capturing. Ready and idle states use neutral/success semantics without excessive badges.
- Keep start/stop, play/pause, seek and clear actions visible, text-labelled and reachable on mobile.

## Motion choreography
- On explicit Start activation, request microphone permission and transition through idle → requesting → recording.
- During capture, sample analyser frequency data and render the waveform directly to a canvas at a bounded cadence. Do not update React state for every analyser frame.
- Update elapsed time on a separate low-frequency cadence; stop at the configured duration cap.
- Stop transitions to a finalizing state while MediaRecorder flushes its last chunk. Then render a stable waveform and expose local playback.
- Playback progress follows the native audio element; seeking is user-driven. No autoplay, looping or automatic upload.
- Reduced motion disables the continuously animated meter while retaining a timer, a clear recording indicator and a static post-recording waveform where samples are available.

## Public API intent
`label`, `description`, `maxDuration`, `maxBytes`, `onRecordingComplete(blob, metadata)`, `onError`, `disabled`, `showPlayback`, and `className`. Metadata includes duration, MIME type and byte size. The component keeps audio local and leaves upload, retention, consent and server authorization to the application.

## Accessibility and responsive behavior
- Use explicit accessible names for every action, a polite live announcement for permission/recording/completion state and an alert for errors.
- Hide the canvas meter from assistive technology; state, duration and errors must remain available in text.
- Provide keyboard-operable Start, Stop, Play/Pause, Seek and Clear controls.
- Request permission only after user activation. Explain denied permission and missing microphone states.
- Use a secure-context check and a useful unsupported-browser fallback.
- Keep touch targets at least 44 × 44 px and preserve a usable layout at narrow mobile widths.

## Performance, privacy and implementation notes
- Use `getUserMedia`, `MediaRecorder`, `AudioContext` and `AnalyserNode` progressively; recording must still work when the optional analyser is unavailable.
- Pick a MIME type using `MediaRecorder.isTypeSupported`; do not assume one codec is universal.
- Bound recording duration, chunk bytes and waveform sample storage. Stop microphone tracks, close AudioContext, cancel animation frames and revoke object URLs on completion, clear and unmount.
- Stop active capture when the document becomes hidden. Do not connect the microphone source to the audio destination.
- Do not persist, transmit or upload audio from this component. The caller owns consent UX, upload, retention and deletion policy.
- Follow Tailwind CSS v4 utilities, semantic project tokens and Motion imports from `motion/react` only. No component-specific stylesheet.

## Acceptance criteria
- Permission, denial, missing device and unsupported API states are handled.
- Recording works when AudioContext/analyser is missing; elapsed duration and max-duration stop still function.
- Audio formats are selected through capability detection.
- Stop finalizes the final audio chunk exactly once and invokes the callback once.
- Recording duration, bytes and waveform samples remain bounded.
- Playback, seeking, clearing and re-recording work without leaking object URLs.
- Tracks and audio resources are cleaned up after stop, hidden-document transition and unmount.
- Reduced motion disables continuous waveform animation without breaking recording.
- No automatic playback or upload occurs.
