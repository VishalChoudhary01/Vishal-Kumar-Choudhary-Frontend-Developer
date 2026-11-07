# Sound Engineering — Audio Runtime, Assets and Interaction Call Sites

**Status:** Current implementation reverse-engineered from the audited branch  
**Primary shared hook:** src/app/hooks/useUiSound.js  
**Confirmed playback consumers:** src/app/components/mascot/PortfolioMascot.js and src/app/components/ui/ThemeToggle.js  
**Native voice playback:** PortfolioMascot.js (welcome recording)  
**App provider:** No sound provider is currently mounted in AppProviders.js  
**Audio engine:** Web Audio API with native HTMLAudioElement fallback  
**Audio assets:** public/audio and public/mp3  
**Scope:** Current application sounds, how they are decoded/played, browser policy, cleanup, call sites and safe extension guidance.

This is a current-state implementation guide. It does not describe a proposed sound manager, global mute setting or background-music feature. Those are not part of the implementation verified in this branch.

---

## 1. Executive summary

The application has a small shared audio utility rather than a dedicated music/audio framework.

The current system has three confirmed playback call sites across two playback paths:

1. **UI sound effects through useUiSound:** a reusable hook that shares one module-level Web Audio AudioContext across hook instances, fetches and decodes each audio source once, and creates a separate BufferSource/GainNode voice for each play.
2. **Vee welcome voice through native Audio:** the spoken introduction is created directly with new Audio(...), with a manual retry prompt for browsers that block autoplay.

Confirmed useUiSound consumers are Vee's laser scan effect and the Navbar theme toggle click effect. The mascot's spoken welcome bypasses useUiSound and uses native Audio. The SFX consumers share the module-level AudioContext/decode cache but each hook instance owns its own voice list. The native welcome voice does not share the SFX hook's playback object or voice lifecycle.

Current sound is event-driven. There is no confirmed ambient music loop, app-wide mute switch, master volume setting, persisted sound preference or global audio-control UI in the audited implementation.

## 2. Architecture and code locations

### Files

| File/path | Responsibility |
|---|---|
| src/app/hooks/useUiSound.js | Shared Web Audio hook, AudioContext singleton, decoded-buffer cache, voices, fallback pool, unlock listeners, play/stop API |
| src/app/components/mascot/PortfolioMascot.js | Vee's laser SFX hook call, separate welcome voice, audio prompt and lifecycle |\n| src/app/components/ui/ThemeToggle.js | Plays the theme toggle click/chop effect directly from the user's click before applying the theme |
| src/app/providers/AppProviders.js | Confirms current provider tree; no dedicated audio provider is mounted |
| public/audio/hey-there-im-vee-your.wav | Vee spoken welcome |
| public/mp3/laser-large-004.mp3 | Vee holographic scan / laser SFX |\n| public/mp3/chop.mp3 | ThemeToggle click/chop SFX |
| public/mp3/* | Additional MP3 files present in public; unassigned status is listed in the asset inventory below |

### Current provider composition

AppProviders currently composes:

    ActionToastProvider
      → MobileMenuProvider
        → MotionProvider
          → SmoothScroll
            → PageLoaderProvider
              → route children

There is no AudioProvider/SoundProvider in this tree. The sound system is opt-in at the component level: a component imports useUiSound and registers a source when it mounts.

The engine is nevertheless shared because useUiSound stores AudioContext and decoded-buffer cache in module-level variables. A future AudioProvider is not required just to share the current AudioContext.

### Package dependencies

- Uses browser-native AudioContext / webkitAudioContext, AudioBufferSourceNode, GainNode and HTMLAudioElement.
- The project has Three.js for the mascot 3D scene, but Three.js is not the sound engine.
- No Howler.js, Tone.js or other dedicated audio playback package is present in the current package.json dependency list.

## 3. Shared useUiSound hook

Source: src/app/hooks/useUiSound.js

The hook returns:

    const { play, stop } = useUiSound(src, options);

### Supported options and defaults

| Option | Default | Behavior |
|---|---:|---|
| volume | 0.35 | Per-voice output gain, clamped to [0,1] |
| interrupt | true | Stop active voices belonging to this hook instance before a new playback |
| preload | "auto" | Passed to native Audio fallback; decoded Web Audio path is fetched/decoded during the hook setup effect |
| maxVoices | 4 | Maximum active voices when interrupt=false; integer is clamped to 1–8 |

The volume is a scalar for this individual hook instance/playback. It is not a global master-volume control.

### 3.1 Shared AudioContext singleton

Module-level state:

- sharedAudioContext: the single shared AudioContext reference.
- unlockListenersInstalled: prevents installing the gesture listeners more than once.
- decodedBufferPromises: a Map keyed by audio source path, holding the in-flight/resolved decode Promise.

getSharedAudioContext():
1. Returns null on the server.
2. Selects window.AudioContext or window.webkitAudioContext.
3. Returns null when neither exists.
4. Creates the shared context when none exists or the existing context is closed.
5. Clears decodedBufferPromises when a closed context is replaced.

Every hook instance uses this same context. Each hook instance still owns its own source reference, decoded-buffer reference and active voice list.

### 3.2 Audio unlock and browser autoplay policy

installAudioUnlockListeners() runs when a useUiSound instance mounts in the browser.

It installs one-time global listeners on window:
- pointerdown (capture + passive);
- touchstart (capture + passive);
- keydown (capture).

On the first eligible gesture, the unlock handler obtains the shared AudioContext and calls context.resume() if it is not already running. Promise rejection and synchronous errors are intentionally swallowed so sound cannot break ordinary UI interactions.

These listeners are installed once per loaded module and are not removed by an individual hook cleanup. The AudioContext is also not closed when a component unmounts. This is a shared, application-lifetime resource pattern, not a component-owned context.

The play() function has a second safeguard:
- If the context is already running, playback may begin.
- If the context is suspended, the hook checks navigator.userActivation when available.
- When userActivation exists and is not active, play() returns without scheduling playback.
- For an eligible activation it tries context.resume(), then starts once the state is running.
- Resume errors are ignored.

This prevents a scroll/hover timer from unexpectedly starting sound in a suspended context. It also means a sound that is requested outside a genuine user activation can be deliberately skipped rather than queued until an arbitrary later click.

### 3.3 Fetch and decode cache

getDecodedBuffer(src, context):
1. Looks up src in decodedBufferPromises.
2. Returns the existing Promise when that src is already being fetched/decoded.
3. Otherwise fetches the source URL.
4. Rejects non-OK HTTP responses.
5. Reads response.arrayBuffer().
6. Calls context.decodeAudioData(arrayBuffer).
7. Stores the Promise in the Map while loading and after success.
8. Deletes the cache entry after failure so a later request may retry.

The cache is shared by all hook instances in this module. The decoded AudioBuffer is reusable; an AudioBufferSourceNode is created for each playback because source nodes are one-shot objects.

When the shared AudioContext is recreated after a closed state, the decode Promise cache is cleared because decoded buffers belong to the previous context lifecycle.

### 3.4 Voice construction and overlap

For Web Audio playback, startPlayback(buffer) creates:

    AudioBufferSourceNode
      → GainNode
        → AudioContext.destination

- source.buffer receives the decoded AudioBuffer.
- gain.gain.value receives the clamped per-play volume.
- Each source/gain pair is stored in voicesRef.
- source.start(0) begins playback immediately.
- source.onended removes the voice and disconnects source/gain nodes.

When interrupt=true, all current voices owned by that hook instance are stopped before the new one starts.

When interrupt=false, voices may overlap. Before adding a voice, the hook enforces maxVoices (clamped 1–8) by stopping/removing the oldest voice records until there is capacity.

The voices list is per hook instance, not one global list shared between different useUiSound consumers. Two independent components can therefore play their sounds independently, subject to the same shared AudioContext.

### 3.5 Native Audio fallback

When AudioContext is unavailable, useUiSound creates a pool of native Audio objects.

- interrupt=true creates a one-element pool.
- interrupt=false creates maxVoices Audio elements (clamped 1–8).
- Each element receives the src, preload option and initial volume.
- On play, volume is refreshed from the latest options.
- The audio is paused/reset to time 0 before use.
- With interrupt=false, the hook chooses an available paused/ended element, otherwise it uses a round-robin fallback index.
- audio.play() rejection and synchronous exceptions are ignored.

Important: the native Audio pool is the fallback for environments without Web Audio support. A Web Audio fetch/decode failure is logged in development but does not currently switch the same hook instance into a native Audio fallback pool.

### 3.6 stop() and cleanup

stop():
- Stops every active Web Audio source owned by the hook instance.
- Clears the instance's voices list.
- Pauses and rewinds each native fallback Audio element.

stopVoice():
- Clears source.onended.
- Calls source.stop(), safely ignoring already-ended voices.
- Disconnects source and gain.

When the hook's setup effect is cleaned up:
- marks pending decode assignment inactive;
- stops active voices for the Web Audio path;
- clears the instance's context/buffer refs when they belong to the same context;
- or, for the native fallback pool, pauses/rewinds each element, removes src, calls load(), and clears the pool reference.

The shared AudioContext and global unlock listeners intentionally remain at module scope. Do not close the context from an ordinary component cleanup; doing so would invalidate other hook instances.

## 4. Confirmed sound call sites

### 4.1 Vee laser / holographic scan effect

File: src/app/components/mascot/PortfolioMascot.js

Hook registration:

    const laserSound = useUiSound("/mp3/laser-large-004.mp3", {
      volume: 0.16,
      interrupt: true,
      preload: "auto",
    });

Playback occurs inside activateHolographicScan() after:
1. The visitor activates the ScanLine button.
2. The currently active homepage section is resolved.
3. A visible scan target is selected.
4. The right arm and head begin aiming.
5. The aim delay expires (about 340ms in normal mode; 0 in reduced-motion mode).
6. The latest projected right index-fingertip position is read.
7. The laser sound is played immediately before the screen-space beam state is rendered.

The sound does not play when:
- Vee is currently being dragged and the scan handler returns;
- no active section can be resolved;
- no eligible target can be found;
- the target is disconnected before firing;
- browser audio policy prevents playback;
- audio loading/decoding fails.

The sound is not linked to every scroll or section transition. It is a one-shot sound for an explicit scan interaction.

Because interrupt=true, repeated scan playback from this hook stops the prior laser voice rather than layering several laser sounds over each other.

### 4.2 Theme Toggle click / chop effect

File: src/app/components/ui/ThemeToggle.js  
Asset: /mp3/chop.mp3

Hook registration:

```js
const { play: playThemeToggleSound } = useUiSound(
  "/mp3/chop.mp3",
  {
    volume: 0.25,
    interrupt: true,
  },
);
```

The current ThemeToggle click handler runs in this order:

1. Call the optional supplied onClickProp(event).
2. If event.defaultPrevented is true, return without playing sound or changing theme.
3. Call playThemeToggleSound() directly inside the user's click interaction.
4. Call the useThemeToggle toggle() action.

The sound uses the shared useUiSound engine, not a native Audio element. It uses per-hook gain volume 0.25 and interrupt=true, so a repeated click on the same hook instance stops its previous sound voice before the new one starts.

The sound is optional. If the browser has not unlocked audio, the file cannot be fetched/decoded, or play() is rejected, the theme still changes. The sound must never be moved before the preventDefault check or made a condition for calling toggle().

This is a separate consumer of useUiSound from the Vee laser effect. It does not make the sound engine theme-aware and does not add a master volume or mute preference.

### 4.3 Vee spoken welcome

File: src/app/components/mascot/PortfolioMascot.js  
Asset: /audio/hey-there-im-vee-your.wav

This voice does not use useUiSound.

Sequence:
1. The Three.js scene finishes building and setWebglReady(true) is called.
2. An effect observes webglReady.
3. It waits 800ms.
4. It marks welcomeAttemptedRef so the automatic attempt is not repeated.
5. It shows the welcome prompt briefly.
6. It creates new Audio("/audio/hey-there-im-vee-your.wav").
7. It sets preload="auto" and volume=0.85.
8. It attempts audio.play().
9. On success, the interaction/retry prompt is hidden.
10. On rejection, welcomeNeedsInteraction becomes true and the visitor sees “Tap to hear Vee”.

Manual retry:
- The welcome prompt button calls playWelcomeAudio().
- It reuses welcomeAudioRef.current when available.
- It creates a native Audio object only if none exists.
- Success hides the prompt.
- Failure keeps the prompt visible so retry remains possible.

Cleanup:
- The welcome-audio effect cleanup pauses the retained Audio instance and resets currentTime to zero on mascot unmount.
- The delayed welcome attempt clears its timer when the effect is cancelled.

This native voice has its own volume and promise handling. It is not governed by the useUiSound decoded-buffer cache, voice count or stop() API.

### 4.4 Other current UI sounds

The reviewed app shell and main homepage components do not mount a dedicated global audio provider. The homepage intro loader does not contain a useUiSound/new Audio playback call in the inspected source. No application-wide click sound is implied merely by the presence of click-soft.mp3 or other sound files in public.

The currently confirmed playback call sites are the Vee laser SFX, Vee welcome voice and Navbar ThemeToggle chop effect. Additional consumers should be added only after a real call site is verified in source.

## 5. Audio asset inventory

The recursive repository tree contains nine audio assets. Three are currently confirmed as active call-site assets:

| Asset | Size | Confirmed current call site | Status |
|---|---:|---|---|
| public/audio/hey-there-im-vee-your.wav | 511,244 bytes | Vee welcome voice via native Audio | <active> |
| public/mp3/laser-large-004.mp3 | 6,103 bytes | Vee scan effect via useUiSound | <active> |
| public/mp3/book-flip-1.mp3 | 6,730 bytes | None confirmed in this review | Unassigned |
| public/mp3/chop.mp3 | 2,550 bytes | ThemeToggle click effect via useUiSound (volume 0.25, interrupt true) | Active |
| public/mp3/click-soft.mp3 | 669 bytes | None confirmed in this review | Unassigned |
| public/mp3/confirmation-002.mp3 | 4,849 bytes | None confirmed in this review | Unassigned |
| public/mp3/draw-knife-2.mp3 | 4,222 bytes | None confirmed in this review | Unassigned |
| public/mp3/drop-003.mp3 | 2,132 bytes | None confirmed in this review | Unassigned |
| public/mp3/tick-004.mp3 | 1,087 bytes | None confirmed in this review | Unassigned |

“Unassigned” means the asset exists in the public folder but no active playback call site was verified for it in this documentation pass. It does not imply the asset should be deleted. Before removing or assigning it, perform a complete repository reference search and verify its purpose with the product owner.

Public assets are served as static files. No import statement is required for these root-relative URLs. Preserve exact case and file names.

## 6. Sound lifecycle and execution flow

### useUiSound path

    Component mounts
      → useUiSound effect runs
      → install global audio-unlock listeners once
      → obtain shared AudioContext
      → fetch/decode sound buffer
      → cache Promise by source URL
      → visitor performs eligible action
      → play()
      → ensure context is running / resume if activation is valid
      → create BufferSource + GainNode
      → start sound
      → onended cleanup and disconnect

### Theme Toggle path\n\n    User click\n      → ThemeToggle onClick handler\n      → optional consumer callback\n      → return if defaultPrevented\n      → useUiSound.play() for /mp3/chop.mp3 at volume 0.25\n      → useThemeToggle.toggle()\n      → View Transition / direct theme fallback\n\nThe sound and theme update are sequential, not coupled: a sound failure is swallowed by useUiSound and does not prevent the toggle.\n\n### Vee welcome path

    Homepage heroReady
      → lazy-load PortfolioMascot
      → dynamically import Three.js
      → construct WebGL scene
      → webglReady=true
      → wait 800ms
      → native Audio.play() attempt
        ├── success → hide prompt
        └── blocked/failure → show manual play prompt
                         → visitor retries
      → mascot unmount → pause and rewind voice

These paths are intentionally separate today.

## 7. Sound behavior matrix

| Behavior | Vee laser SFX (useUiSound) | ThemeToggle SFX (useUiSound) | Vee welcome voice |
|---|---|---|
| Playback API | Web Audio BufferSource/GainNode | Web Audio BufferSource/GainNode | HTMLAudioElement via new Audio |
| Shared AudioContext | Yes | Yes | No |
| Fetch/decode Promise cache | Yes | Yes | Browser media loading |
| Volume | 0.16 | 0.25 | Explicit 0.85 |
| Interrupt/voice limit | interrupt=true | interrupt=true | No custom voice limit |
| Autoplay handling | Gesture unlock + userActivation guard | Gesture unlock + userActivation guard | play() promise + manual prompt |
| Retry UI | Not provided by hook | Not provided by hook | Yes |
| Explicit stop API | Yes | Yes | Managed by audio ref and cleanup |
| Trigger | Explicit Vee scan action after target/aim setup | User click on ThemeToggle; sound is called before theme toggle | One automatic attempt after WebGL ready; manual retry |
| Loop/background music | No | No | No |
| Global mute/master volume | No | No | No |

## 8. Browser, accessibility and failure behavior

### Autoplay restrictions

Browsers may keep a new AudioContext suspended and may reject native Audio.play() when no user gesture has occurred. Both paths handle rejection without throwing an error into the main React interaction flow:
- useUiSound silently ignores resume/play-policy rejection;
- welcome voice shows a manual play control when automatic playback fails.

Do not remove the welcome prompt fallback or assume that a delayed attempt is always permitted.

### Audio unavailable / decode failure

- If Web Audio is unsupported, useUiSound falls back to native Audio.
- If AudioContext exists but fetch/decode fails, it warns only in development and does not currently switch to native fallback.
- If a browser cannot play the WAV/MP3, welcome voice failure keeps the retry prompt.
- Laser SFX is optional; the scan beam and target visual response should still work without sound.

No sound failure should prevent a navigation, form submission, scan visual or other primary UI action.

### Reduced motion

The mascot reduces physical character motion and scan timing under prefers-reduced-motion. The sound hook itself is not disabled by reduced motion, and the welcome voice is not explicitly suppressed by the reduced-motion preference. The current implementation treats auditory output independently from the visual motion preference.

When adding any new audio behavior, consider a separate sound preference rather than assuming reduced-motion equals muted. Do not silently change the existing voice policy.

### Keyboard and touch

The hook unlocks on keydown as well as pointer/touch. The Vee scan sound is triggered by the scan button, which is a real button with an accessible label. Keep the audio tied to an explicit action when adding new effects, and preserve keyboard activation.

## 9. Current limitations and known gaps

The following are observations of the current source, not changes made by this documentation task.

1. No global master volume or mute setting exists.
2. No persistent sound preference is stored.
3. No central sound settings UI or sound preference provider is mounted.
4. There is no background music/ambient loop manager.
5. There is no crossfade, spatial panning, equalization or sound bus hierarchy.
6. The AudioContext is module-global and remains open after normal hook unmount.
7. The global unlock event listeners remain installed after first registration.
8. No document-visibility policy suspends/mutes audio in a background tab.
9. A useUiSound decode failure does not activate the native Audio fallback when Web Audio itself is available.
10. The native welcome voice is implemented independently from the reusable hook.
11. Unassigned MP3 files have no confirmed current call site in this review.
12. The repository tree did not contain filenames explicitly named for sound/audio tests; sound behavior still needs browser-level testing.

These gaps may be acceptable for the current small set of one-shot UI/mascot sounds. They should be revisited before adding many interaction sounds, user volume preferences or continuous music.

## 10. Safe extension guide for human developers and AI agents

### A. Add a one-shot UI sound

1. Put a properly licensed audio asset in a predictable public folder such as public/mp3.
2. Use a root-relative path, e.g. /mp3/new-effect.mp3.
3. In the client component that owns the interaction, call useUiSound(path, options).
4. Choose a restrained volume based on the existing reference levels; do not use the default blindly.
5. Keep interrupt=true for a sound that should replace itself (such as repeated scan SFX).
6. Use interrupt=false only when overlap is intentional; set maxVoices explicitly when needed.
7. Trigger play() from the actual user action or a short, action-owned sequence.
8. Never make a sound necessary to understand or complete the UI action.
9. Verify behavior when AudioContext is suspended and when sound loading fails.
10. Add the asset and call site to this guide's inventory.

Example:

    const clickSound = useUiSound("/mp3/click-soft.mp3", {
      volume: 0.12,
      interrupt: true,
      preload: "auto",
    });

    function handleAction() {
      clickSound.play();
      // Continue the actual action even if audio is blocked.
    }

### B. Add overlapping sound layers

- Set interrupt=false.
- Set maxVoices deliberately (valid effective range: 1–8).
- Remember the oldest active voice is stopped when the limit is reached.
- Avoid creating many hook instances for the same source unnecessarily; decoded buffers are shared, but each instance owns its own voice list.
- Do not use overlapping sounds for repeated scroll events without a clear rate/trigger policy.

### C. Add voice / narration

Do not force spoken narration through the laser SFX configuration. Decide whether it needs:
- a native Audio element with explicit play/retry state;
- a reusable voice hook with pause/resume/currentTime/error state;
- transcripts/subtitles and accessible controls;
- consent or persistent audio preference;
- interruption rules when route changes or another voice begins.

The current welcome voice is a single, one-time mascot greeting, not a general voice/narration manager.

### D. Add a global mute or volume setting (future architecture)

If multiple components need user-controlled audio preferences, design the preference and ownership before adding individual booleans to each component.

A coherent future design should define:
- one user-facing sound-enabled preference;
- a master gain node or central output controller;
- per-category buses (UI, voice, ambient) only if the product needs them;
- persistence and default behavior;
- how native Audio welcome playback respects the same master preference;
- browser autoplay/unlock state versus the user's explicit mute choice;
- keyboard-accessible settings;
- how a preference change stops currently playing voices;
- behavior across route changes and component remounts.

A master GainNode alone will not automatically mute native HTMLAudioElement playback. The welcome voice would need to be routed through the shared graph or explicitly consult the same preference.

Do not claim that such a system already exists.

### E. Cleanup rules

- Do not close the module-global AudioContext from an individual hook instance.
- Stop hook-owned voices on component cleanup.
- Clear any timers associated with delayed playback.
- Pause/rewind native Audio when its owner unmounts if playback should not continue.
- Handle play()/resume() promise rejections.
- Do not leak AudioBufferSourceNode/GainNode references after end.
- If introducing a new AudioContext or event listener, define exactly who owns and disposes it.

## 11. Manual verification checklist

### useUiSound
- Play laser sound after the shared context has been unlocked.
- First interaction unlocks audio in Chromium and Safari/WebKit.
- Suspended context with no userActivation does not unexpectedly play.
- Repeated laser scans interrupt the previous voice.
- Decode/fetch 404 does not break scan behavior.
- AudioContext unsupported uses native fallback.
- Test volume at 0, a restrained value and 1.
- Test stop() and component unmount during playback.
- Test route away/remount does not create multiple AudioContexts.

### Vee voice
- First successful WebGL scene triggers the welcome attempt after the configured delay.
- Autoplay allowed hides the prompt.
- Autoplay blocked shows “Tap to hear Vee”.
- Manual retry succeeds after the visitor interaction.
- Unmount pauses and rewinds the Audio instance.
- Voice does not replay automatically on each section change.
- Missing/corrupt WAV does not break mascot interactions.

### Accessibility and preference
- Keyboard activation of ScanLine triggers the same action.
- Audio is supplemental; visual scan effect works while muted.
- Screen reader users receive the existing action/reaction announcement.
- Reduced motion does not create unwanted visual movement; document the current voice behavior separately.
- Test background tab/foreground return.
- Test light and dark themes; audio should not depend on theme state.

## 12. Source-of-truth rules

1. useUiSound.js owns the reusable SFX engine.
2. PortfolioMascot.js owns current call-site timing and the native welcome voice.
3. public/audio and public/mp3 own static source files.
4. AppProviders.js currently does not own an audio provider.
5. Do not infer active playback from an asset existing in public.
6. Update this document whenever a sound consumer, asset, option, audio preference, provider or lifecycle changes.
7. Keep sound optional and never block core UI functionality because playback failed.
