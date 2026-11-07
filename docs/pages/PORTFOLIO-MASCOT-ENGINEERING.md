# Vee — 3D Portfolio Mascot, Scroll Choreography and Interaction Engineering

**Status:** Current implementation reverse-engineered from the audited branch  
**Route:** Homepage only (/), not project detail, Labs or Admin  
**Primary implementation:** src/app/components/mascot/PortfolioMascot.js  
**Mount point:** src/app/components/HomePage.js  
**3D engine:** Three.js (dynamically imported)  
**UI/overlay animation:** Motion (motion/react)  
**Input:** Native scroll, pointer movement, click, drag and explicit scan action  
**Assets:** public/audio/hey-there-im-vee-your.wav and public/mp3/laser-large-004.mp3

This document is the source of truth for understanding, editing, extending or recreating Vee. It records the current code behavior, not an imagined or proposed mascot system. It is written for both humans and coding agents.

---

## 1. Executive summary

Vee is a fixed, interactive, procedural 3D portfolio companion. It is constructed from Three.js primitive geometry inside one canvas. It follows the visitor through the seven main homepage sections, changes its pose and lighting for each section, looks toward nearby page content, reacts when sections change, and settles into a sitting pose near the footer.

Vee also has several independent interactions:

- It attempts a one-time spoken welcome when the 3D scene becomes ready.
- The visitor can click the mascot to open a section-specific guide message.
- The message action takes the visitor to the next section; the Contact action scrolls to the form and focuses a control.
- The mascot can be dragged to a custom position.
- A scan button makes the mascot aim its right hand, project a laser beam from the fingertip, and trigger a visual reaction on a nearby target in the active section.
- Pointer movement over the mascot changes its body/head orientation.
- Idle motion, blinking, expressions, antenna signal and glow keep the character alive between interactions.

The current implementation is concentrated in one large client component. The 3D model, section detection, positioning, scan target discovery, UI and dialogue are not currently separated into independent modules. Treat the responsibility boundaries in this guide as the logical architecture to preserve when editing or refactoring.

## 2. Where the mascot is mounted and when it exists

### Homepage integration

src/app/components/HomePage.js imports PortfolioMascot using React.lazy:

- It is not part of the initial static imports for the homepage.
- It mounts only after PageLoaderProvider reports heroReady.
- It is wrapped in Suspense with a null fallback.
- It is mounted inside the homepage shell after the navigation and all seven main sections.
- It is not mounted by the project detail client shell.
- It is not mounted by the Labs or Admin route shells.

The mount condition is effectively:

    heroReady
      → load PortfolioMascot chunk
      → mount PortfolioMascot
      → load Three.js dynamically
      → construct scene
      → set webglReady
      → start the welcome-audio attempt

There are therefore two separate lazy boundaries: React.lazy for the mascot component and import("three") inside the component for the 3D engine.

### Lifecycle and cleanup

The main Three.js useEffect:
- Reads hostRef and canvasRef.
- Adds pointermove, pointerleave and click listeners to the host.
- Adds passive window scroll and resize listeners.
- Builds the scene after the dynamic Three.js import resolves.
- Uses ResizeObserver to size the renderer to the canvas host.
- Runs a requestAnimationFrame render loop.
- On cleanup, sets disposed=true, cancels the last frame, removes all host/window listeners, disconnects ResizeObserver, disposes every geometry/material, and disposes the WebGL renderer.

The effect rebuilds when reduced-motion preference or the mobile/desktop media-query state changes. Keep the cleanup symmetric with every new listener, observer, timer, geometry, material, texture, audio instance or renderer resource introduced by future changes.

## 3. The seven-section companion contract

The SECTIONS array near the top of PortfolioMascot.js is the central content/navigation contract. Array order is significant: its index is used by active state, pose lookup, gesture lookup and the mobile orbit-position table.

| Index | Real page section ID | Vee label | Vee pose | Dialogue action |
|---:|---|---|---|---|
| 0 | hero | Hey, I'm Vee! | wave | Explore About |
| 1 | about | Meet Vishal | curious | Next: Education |
| 2 | education | Learning journey | inspect | Next: Skills |
| 3 | skills | Toolbox unlocked | excited | Next: Experience |
| 4 | experience | Work in action | work | Next: Projects |
| 5 | projects | Let's see what's built | point | Next: Contact |
| 6 | contact | Let's make something | welcome | Find the contact form |

The Footer is a separate special state. It is not an eighth entry in SECTIONS. When the footer threshold is reached, footerActiveRef takes precedence and the renderer uses the dedicated seated pose.

### Section DOM IDs

The section mapping currently corresponds to these homepage section elements:

- HeroSection / CinematicHero → #hero
- AboutContent → #about
- EducationSection → #education
- SkillsSection → #skills
- ExperienceSection → #experience
- ProjectsSection → #projects
- ContactSection → #contact
- Shared Footer → #footer

The mascot uses document.getElementById(section.id). A renamed section ID without a matching SECTIONS update breaks section detection, dialogue state and pose mapping.

## 4. How scroll detection actually works

Vee does not use one continuous Motion useScroll timeline for the entire page. Its section-following behavior is a discrete active-section detector driven by native window scroll and resize events.

### 4.1 Active-section reference line

On every scroll or resize:

1. Calculate total scrollable document height.
2. Calculate normalized document progress as window.scrollY / (document height - viewport height), clamped to 0–1.
3. Set a vertical reference marker at 42% of viewport height.
4. Inspect each section listed in SECTIONS.
5. Ignore a section when its bottom is above the marker or its top is below the viewport.
6. For each remaining section, calculate the distance between the marker and a point 35% into the section height, capped at 35% of viewport height.
7. The nearest eligible section becomes active.

The normalized page progress variable is currently calculated inside updateScroll, but it is not used as a continuous input to the pose or position animation. Do not mistake that variable for a scroll-progress animation curve.

### 4.2 Section-change reaction

When the selected section index changes:
- Store the new index.
- Set a short reaction window of about 900ms.
- Choose a different random facial expression.
- The render loop adds a small reaction bounce and arm movement.
- The new section's pose and hand gesture become the target values.

The active React state drives the dialogue and screen-reader text. The local activeIndex variable inside the Three.js effect drives the render loop directly.

### 4.3 Footer detection

The footer is detected separately. Vee switches to the footer state when either:
- the document is within 24px of the page bottom; or
- the footer top is above 22% of viewport height and the footer still has visible content below 80px.

This avoids switching to a sitting pose as soon as the footer barely enters the viewport.

The footer state:
- overrides a previous user-dragged position;
- parks Vee close to the bottom-right of the viewport;
- applies a compact seated pose;
- disables the usual idle face scan/wave loop;
- changes body angle and leg rotations.

## 5. How Vee moves around the page

Vee is positioned with a fixed DOM host, not by moving the Three.js camera through the page. The host moves in screen coordinates; the Three.js character animates inside that host.

### 5.1 Host sizes and visibility

- Desktop/tablet: 94px wide host; shown from the md breakpoint upward.
- Mobile: 56px wide host; shown below 768px.
- Desktop mascot height is estimated as 142px for positioning calculations.
- Mobile mascot height is estimated as 88px for positioning calculations.
- The main canvas interaction button is 132px tall on desktop and 76px tall on mobile.
- Host is fixed at z-40.
- Host wrapper is pointer-events-none by default; explicit controls and the main interaction button opt back into pointer events.

The component uses 768px as its desktop/mobile split. This is separate from the homepage's 640/768/1024 breakpoint profiles.

### 5.2 Per-section orbit positions

The default position table is indexed using the same SECTIONS array order:

| Section | X fraction | Y fraction |
|---|---:|---:|
| Hero | 0.76 | 0.16 |
| About | 0.18 | 0.34 |
| Education | 0.78 | 0.54 |
| Skills | 0.16 | 0.22 |
| Experience | 0.74 | 0.42 |
| Projects | 0.20 | 0.58 |
| Contact | 0.72 | 0.30 |

These are fallback/orbit positions in viewport coordinates, not percentages inside the section.

### 5.3 Desktop content-follow positioning

On non-mobile screens, Vee tries to position itself beside a target in the active section. The current target query prefers the first matching:

- [data-mascot-target]
- form
- h1
- h2
- h3
- button
- a[href^="#"]

Even section indices prefer the target's right side; odd section indices prefer the left. If the preferred side would exceed the viewport edge, the opposite side is used. Positions are clamped inside an 8px viewport edge margin. The Y position begins near the top of the chosen target, offset by at most 22px.

For a stable target on a redesigned section, add a meaningful data-mascot-target anchor to the correct visual element instead of relying on whichever heading/button happens to occur first in DOM order.

### 5.4 Mobile positioning

Mobile currently uses the seven orbit coordinates instead of the desktop target-side positioning. It still calculates the target's center to orient Vee's head toward the content.

This is intentional: a small mobile mascot should not try to sit beside every heading or form control, where it could cover the content.

### 5.5 Position transitions

The outer host transitions left/top over 650ms with cubic-bezier(.2,.75,.25,1). This movement is disabled when reduced motion is active or while the visitor is dragging.

The position clamp keeps ordinary page positions between 72px from the top and 42px from the bottom. Footer parking uses its own bottom-edge clamp.

### 5.6 Manual drag precedence

The main mascot button uses pointer capture:
- Pointer down records the pointer-to-host offset and sets isDragging.
- Pointer movement beyond 5px marks the gesture as a drag rather than a click.
- The host is moved immediately and manualPosition is updated.
- Position is clamped to viewport bounds.
- Pointer up releases capture and clears drag state.
- A click following a drag is suppressed so the dialogue does not open accidentally.

manualPosition is in React state only. It is not persisted in localStorage or the database. It takes precedence over computed section positions on subsequent scroll/resize events, except footer parking, which overrides manual position. A full component/page remount resets the manual position.

## 6. Procedural Three.js character — how the 3D model is built

### 6.1 No external model asset

The current robot is constructed in JavaScript from Three.js geometries and materials. It does not load a GLTF/GLB model, texture atlas, skeletal animation file or remote 3D asset.

The local construction helpers are:
- makeMesh(geometry, material, parent, position, scale)
- sphere(material, parent, position, scale, segments)
- capsule(material, parent, position, scale)

The helpers create Mesh objects, set their local transform, and add them to the selected parent group.

### 6.2 Scene and camera

- Scene: THREE.Scene
- Camera: PerspectiveCamera, field of view 32 degrees, near .1, far 100
- Initial camera position: (0, 0.2, 8.5)
- Renderer: WebGLRenderer on the component canvas
- alpha: true
- antialias: true
- powerPreference: low-power
- stencil: false
- depth: true
- device pixel ratio capped at 1.5
- outputColorSpace: SRGBColorSpace
- toneMapping: ACESFilmicToneMapping
- toneMappingExposure: 1.15

ResizeObserver reads the canvas parent's dimensions, updates renderer.setSize, camera.aspect and projection matrix.

### 6.3 Lighting

The current scene has five lighting responsibilities:

| Light | Current configuration | Role |
|---|---|---|
| HemisphereLight | warm ivory upper light / deep green lower light, intensity 2.2 | General fill and material readability |
| Directional key | warm ivory, intensity 3.2, position (3,5,6) | Main form/shadow direction |
| Teal PointLight | intensity 18, distance 12, position (-3,1,-2) | Cool rim separation |
| Orange PointLight | intensity 8, distance 8, position (2,-2,4) | Warm secondary edge light |
| Antenna PointLight | red/orange animated, initially .5, distance 3.2 | Local signal glow at antenna tip |

The antenna light's color/intensity changes with section and signal pulse. Rim and accent intensities also respond to the current section.

### 6.4 Materials and character palette

Current materials:
- Shell: ivory #f4f0e6, roughness .31, metalness .22.
- Shell shade: muted grey-green #cacfc5, roughness .38, metalness .28.
- Dark visor/boots: #101b18, roughness .22, metalness .32.
- Teal glow: #5fe0d5, emissive #168f83, emissiveIntensity 2.3.
- Orange detail: #f3a45f, emissive #7a3511.
- Antenna tip: red #ff3b30, emissive #ff1b12, emissiveIntensity 1.8.

When changing materials, preserve theme contrast and do not assume Three.js materials automatically inherit the CSS light/dark theme. The character currently retains its own fixed material palette in both themes; DOM glow/dialogue layers respond to CSS theme.

### 6.5 Character hierarchy

The root hierarchy is built from THREE.Group objects. Current body parts include:

- Root group.
- Left and right leg groups with shell-shade capsules and dark magnetic boot soles.
- Torso group with shell capsule, lower shell detail and luminous teal chest core.
- Left and right articulated arm chains: shoulder anchor, upper arm, elbow group, forearm, wrist group and glove/hand group.
- Hand geometry includes palm, fingers and thumb details.
- Head/helmet group with large ivory shell, dark visor, two teal eyes, expressive orange brow plates, curved smile tube, cheek accents and side/ear modules.
- Antenna group above the helmet with orange stem and glowing color-cycling tip.

The right hand has a longer index-finger detail. Its fingertip is also the screen-space origin of the scan beam. Do not change the fingertip geometry/local coordinate without updating laserHandLocalPosition and verifying the scan beam still originates at the visible fingertip.

### 6.6 Joint hierarchy and transforms

The render loop does not rely on a skeletal animation clip. It adjusts local group rotations:
- root.rotation controls body yaw/roll/tilt;
- torso.rotation applies scan-directed lean/bow;
- head.rotation controls gaze and expression tilt;
- leftArm/rightArm.rotation.z control arm raises/points;
- elbow rotations refine upper/lower arm shape;
- wrist and hand rotations refine palm direction;
- leg rotations support pose and seated-footer state;
- antenna.rotation.z supplies a gentle signal motion.

Because the model is constructed using parent groups, a parent rotation affects all child geometry. When adjusting a joint, change the intended group rather than moving each mesh independently.

## 7. Pose and hand-gesture system

Two maps define each section's body language:

1. poses: overall left/right arm angles, body lean, head angle and leg angle.
2. handGestures: elbow, wrist and palm rotations for each side.

Both maps must contain every pose name referenced by SECTIONS.

| Pose | Section | Intent |
|---|---|---|
| wave | Hero | Raised greeting / arrival |
| curious | About | Interested, conversational posture |
| inspect | Education | Examining/looking closely |
| excited | Skills | Energetic toolbox moment |
| work | Experience | Focused working posture |
| point | Projects | Directing attention toward project work |
| welcome | Contact | Open, inviting posture |

The exact numeric joint rotations live in the poses and handGestures constants in PortfolioMascot.js. Treat those values as local joint radians, not CSS degrees. Test changes visually because arm rotations, parent transforms and the 3D camera all contribute to the final screen direction.

The renderer selects the active pose using SECTIONS[activeIndex].pose. During footer state it substitutes a separate compact sitting pose and different leg rotations.

## 8. Continuous character animation

The Three.js render function schedules itself through requestAnimationFrame. It uses a local smooth(current,target,amount) interpolation helper to ease transforms.

### 8.1 Pointer gaze and body facing

Pointer movement over the host is normalized relative to the host rectangle and clamped:
- X target is in [-0.6, 0.6].
- Y target is in [-0.4, 0.4].

On pointer leave both targets return to zero. The render loop smooths the current pointer values toward targets. Root yaw and head yaw/pitch use these values together with the active content target vector.

The mascot is therefore not simply rotating toward the global mouse pointer; its head also considers the active page target.

### 8.2 Gaze at the current section

The position system calculates the center of the active heading/target. It converts the direction from Vee's screen-space center to normalized targetFacingX/targetFacingY. The Three.js render loop uses those values to aim head yaw/pitch toward the section content.

If no target rectangle exists, the facing targets reset to zero.

### 8.3 Arrival greeting

When the renderer begins, a short welcome wave runs for approximately 2.8 seconds. The arms receive an additional sine-wave offset on top of the selected section pose. This is separate from the welcome audio attempt.

### 8.4 Idle motion

When all of the following are true:
- reduced motion is not requested;
- footer is not active;
- no recent scroll occurred for more than 1600ms;
- no active reaction is running;

Vee enters its idle-play behavior:
- slow horizontal face scan using a sine wave;
- small head pitch movement;
- alternating arm wave;
- subtle floating body motion.

Idle behavior is intentionally suppressed while the footer is active or during reduced-motion mode.

### 8.5 Section-change reaction

When active section changes:
- reactionUntil is extended to about 900ms;
- a different expression is chosen;
- root gets a brief bounce;
- arm movement increases;
- expression overrides the default face temporarily.

### 8.6 Expressions and facial animation

The expression choices are:
- happy
- surprised
- curious
- sleepy
- cheeky
- excited
- wink

chooseExpression avoids selecting the same expression twice in a row and holds the expression for about 1550ms.

The render loop maps these states to:
- left/right eye vertical scale;
- eye spacing for curious;
- left/right brow angles and Y position;
- smile X/Y scale and Z rotation;
- head Z tilt.

Blinking is also driven by a sine threshold and is disabled under reduced motion. Expressions are procedural shape changes, not texture swaps.

### 8.7 Antenna and environmental response

The antenna stem has a small periodic rotation. The tip cycles hue from red through orange to golden yellow; emissive intensity pulses with the same signal.

Section accent mapping:
- Skills and Projects → teal accent.
- Contact → orange accent.
- Experience → pale mint accent.
- Hero/About/Education → warm orange accent.

The antenna point light intensity is higher on Hero and Contact. Rim light intensity changes for Skills/Projects. Accent light intensity changes for Contact and Experience.

## 9. Welcome audio

Audio file: public/audio/hey-there-im-vee-your.wav.

When webglReady becomes true:
1. Wait 800ms.
2. Mark the welcome attempt as started.
3. Show a short prompt.
4. Create an Audio object, preload it, and set volume to .85.
5. Attempt playback once.
6. If allowed, hide the prompt.
7. If browser autoplay policy rejects playback, show “Tap to hear Vee”.

The visitor can manually retry via the welcome prompt. Audio is paused and reset during component unmount. The welcomeAttemptedRef prevents the automatic attempt from repeating on the same mount.

Do not assume autoplay succeeds in every browser. Keep the prompt/retry path and avoid starting audio repeatedly on every section transition.

## 10. Mascot click and dialogue interaction

The main interaction button is the large button layered over the canvas.

A click:
- opens or closes the current section message;
- triggers the host click listener, which chooses an expression and starts a short physical reaction;
- updates aria-expanded and its accessible label.

The dialogue is portaled to document.body and is positioned next to Vee:
- desktop width about 220px;
- mobile width up to 260px and constrained by viewport/safe area;
- height is bounded and content can scroll;
- theme uses light/dark CSS classes;
- role="dialog" and an accessible label are supplied.

Each section's dialogue contains:
- VEE label;
- section-specific note;
- action button;
- close button.

The section record also contains a detail field. The current UI's hasSectionMessage gate requires label, note, detail and action, but the visible dialogue renders the note rather than the detail text. Keep that distinction in mind when editing content.

### Action behavior

For Hero through Projects:
- close the dialogue;
- choose the next section ID in SECTIONS;
- scroll the target section into view.

For Contact:
- target the Contact section's form or a data-contact-form element, submit button, input or textarea;
- scroll the target to the center;
- then focus the first matching input/textarea/button after the scroll settles.

When adding/removing a section, update action labels and next-section logic together. The final section should have a meaningful terminal action rather than indexing past the array.

## 11. Drag interaction

The main button doubles as a drag handle:
- Left-button/pointer down captures the pointer.
- Starting pointer position and host offset are stored.
- Pointer movement updates position in viewport coordinates.
- A movement greater than 5px suppresses the subsequent click action.
- Pointer up releases capture.
- Pointer cancel clears drag state.

The draggable button uses touch-action none to prevent a touch drag from becoming a browser scroll gesture. The scan button and welcome prompt stop pointer-down propagation so they do not initiate a drag.

If changing host dimensions, update the drag clamp dimensions and the position calculations; otherwise Vee can become partly unreachable at the right/bottom viewport edges.

## 12. Holographic scan — interaction with actual page content

The scan is an explicit user action through the ScanLine button. It is not an automatic proximity trigger. It uses the currently active section and finds a nearby visible target in that section.

### 12.1 Section-aware target selectors

The scan target selectors are defined by section in selectorsBySection:

| Section | Preferred target types |
|---|---|
| Hero | img, picture, CSS background image, h1 |
| About | h2, image, picture, paragraph |
| Education | image, picture, h3, h2, paragraph |
| Skills | skill-card image/icon/SVG, skill icon, image/SVG and skill headings |
| Experience | image, picture, h3, h2, paragraph |
| Projects | project-card/article images and background images, then project headings |
| Contact | input, textarea, select, submit button, label, h2 |

The scan excludes:
- the mascot host itself;
- descendants of aria-hidden or inert;
- disabled inputs/buttons;
- zero-size, offscreen, hidden, display:none or fully transparent targets.

Candidates are ranked using a distance score, tag priority and a visual-element boost. Skill scans prioritize skill visuals; project scans prioritize project preview visuals; Hero scans prefer portrait/visual targets before heading text. Repeated scans cycle through eligible candidates so the same element is not selected every time.

If preferred selectors find no candidate, the scan falls back to visible image, SVG, canvas, headings, text, anchors and background-image elements.

### 12.2 Laser aiming

The scan system tracks two projected points from the 3D character:
- the actual right index-fingertip world position, used as the beam origin;
- the right shoulder pivot, used to calculate arm rotation.

The target is a screen-space point at the center of the chosen DOM element.

The right arm aims from the shoulder using the target direction. The angle is clamped to [-2.35, 2.35] radians. The head/torso also turn toward the same target. The beam is delayed until the arm has time to settle:
- normal mode aim delay: about 340ms;
- reduced-motion mode aim delay: 0ms.

### 12.3 Beam and impact

After aiming:
- refresh the latest projected fingertip position;
- calculate beam length and angle to the target;
- play public/mp3/laser-large-004.mp3 through useUiSound at volume .16;
- show a fixed-position beam portal with a warm red/orange/yellow gradient;
- animate a small beam highlight along the length;
- show a short impact sparkle when the beam reaches the target.

The beam is decorative and pointer-events-none. It does not alter document layout or target click behavior.

### 12.4 Target visual response

After impact:
- If target is the footer building word, dispatch vee-footer-scan-hit. FooterOutlinedWord owns its teal-fill animation and hover coordination.
- If target is outlined display text, dispatch vee-scan-start and animate its text fill/filter through the Web Animations API.
- For other targets, animate the actual visual target with a short brightness/saturation/glow/scale response.
- Hero portrait targets receive brightness/saturation only, deliberately avoiding a large scale/jump.
- Skills can receive a second restrained visual flash on the skill icon/container.
- Form controls temporarily receive an orange caret color, then restore their original caret color.
- Project previews keep their existing beam/scan behavior; do not add broad card outlines or proximity shadows.

The footer listener contract is verified in src/app/components/layout/footer_comp/FooterOutlinedWord.js. Its word has data-mascot-scan-target="footer-building"; the component listens for vee-footer-scan-hit and owns the teal fill/reset state.

### 12.5 Timing and cancellation

The scan uses scanTimerRef to keep its timers and cancel previous queued scan work when a new scan starts. The component cleanup clears outstanding scan timers. It also clears the active arm aim and reaction state after the scan sequence.

Any newly introduced delayed effect must be registered in scanTimerRef or cleaned up through an equivalent lifecycle path.

## 13. Visual DOM layers and stacking

The outer host is fixed z-40. Its child layers include:
- shadow ellipse below the mascot;
- Three.js canvas;
- ambient glow behind the character;
- welcome-audio prompt;
- scan button;
- draggable/clickable mascot hit target;
- dialogue portal.

Scan beam and impact are separately portaled to document.body at very high z-index values, above the mascot host. The dialogue portal has the highest of these local layers so it remains readable and interactive.

The default host is pointer-events-none. Only intentional controls opt into pointer events. Keep decorative shadow, glow, canvas, beam and impact aria-hidden or non-interactive.

## 14. Reduced motion, responsiveness and fallback behavior

### Reduced motion

The component uses Motion's useReducedMotion hook. Reduced-motion mode:
- removes or minimizes idle floating and idle waving;
- suppresses the initial animated greeting movement;
- reduces scan aim/impact timings;
- makes host position transitions immediate;
- removes Motion dialogue/overlay transition durations;
- reduces some 3D animation interpolation and antenna pulse frequency.

Important: the current reduced-motion path still constructs and renders the Three.js scene and keeps its requestAnimationFrame loop alive. It reduces character movement; it does not replace the 3D companion with a static alternative or stop all WebGL work. Preserve this distinction when describing behavior or evaluating performance.

### Responsive behavior

- Below 768px, Vee is a compact 56px host with mobile-specific orbit positions.
- At 768px and above, it uses a 94px host and desktop target-side placement.
- Pointer-facing and section-aware gaze remain enabled on both.
- Dialogue placement and size are separately calculated for mobile and desktop.
- Footer parking is adjusted for mobile height.
- The Three.js renderer caps pixel ratio at 1.5.

### WebGL failure path

Three.js import/scene construction errors are caught and logged with a WebGL-unavailable warning. The current catch branch does not set webglReady. The rendered host/controls still exist, but no explicit replacement 2D character is provided in the inspected markup. Treat a true WebGL failure fallback as a verification/design gap, not as an already implemented 2D fallback.

## 15. Current state ownership map

| State/ref | Responsibility |
|---|---|
| active | React-visible active section; dialogue and glow labels |
| activeSectionRef | Current section ID read by the render/scan code without waiting for React |
| isDesktop / isMobile | Media-query responsive mode |
| reducedMotion | Reduced-motion preference |
| webglReady | Three.js scene built successfully; triggers welcome audio |
| mascotPosition | Current fixed host position |
| manualPosition | User-chosen drag position; in-memory only |
| isDragging | Active pointer drag |
| messageOpen | Section dialogue visibility |
| welcomeNeedsInteraction / welcomePromptVisible | Audio autoplay/retry UI |
| welcomeAudioRef / welcomeAttemptedRef | Audio lifecycle and one-time attempt |
| reacting | Accessible reaction announcement and UI feedback |
| scanBeam / scanImpact | Portaled laser visual states |
| scanTimerRef | Scan timer cleanup/cancellation |
| laserOriginRef | Projected right index-fingertip screen coordinate |
| laserShoulderRef | Projected right shoulder screen coordinate |
| laserAimRef | Temporary right-arm aiming angle |
| laserLookRef | Temporary screen-space gaze target and expiry |
| scanCycleRef | Per-section scan candidate cycling |
| footerActiveRef | Footer parking/seated-pose state |

The Three.js effect also owns local non-React values such as pointer current/target, local active index, previous section index, reaction and expression expiry, frame ID, camera/scene/renderer and body-part references. Keep frame-rate values in refs or effect-local variables rather than putting every animation frame into React state.

## 16. Safe editing guide for humans and AI agents

### A. Add a new homepage section

All the following must be reviewed together:

1. Ensure the section has a stable DOM ID.
2. Add a matching record to SECTIONS in the correct page order.
3. Add a pose name to the poses map.
4. Add the same pose name to handGestures.
5. Add its mobile orbit coordinate at the same array index.
6. Add preferred scan selectors to selectorsBySection.
7. Add tag ranking to the sectionRanks object.
8. Add any visual-target priority rule if the section has important images/icons/canvas.
9. Add the dialogue note, detail and action.
10. Confirm the preceding section's action points to the new section.
11. Confirm the new section's action points to the next valid section.
12. Add scan-specific event behavior only where the target component explicitly supports it.
13. Test desktop target-side placement and mobile orbit placement.
14. Test footer transition and reduced-motion behavior after adding the section.

Do not only add a new SECTIONS entry. The index-based pose/gesture/orbit arrays and scan selector map must remain aligned.

### B. Change Vee's pose for an existing section

1. Keep the section ID stable.
2. Adjust the section's pose key in SECTIONS.
3. Change overall body angles only in poses.
4. Change elbow/wrist/palm angles only in handGestures.
5. Confirm the pointing pose still places the right fingertip outside the helmet and does not intersect the face.
6. If the scan button must still work, verify fingertip-to-beam alignment.
7. Recheck footer pose; do not accidentally use the seated values as a normal section pose.

### C. Add a facial expression

1. Add the expression key to the expressions array.
2. Add its boolean/derived condition in the face-expression block.
3. Define eye openness and eye spacing.
4. Define brow rotation and height.
5. Define smile scale and rotation.
6. Define expression head tilt if needed.
7. Verify random expression selection does not repeat the current expression.
8. Verify reduced-motion behavior and no expression is held after expressionUntil expires.

### D. Add a page scan target

1. Decide whether it is a positioning anchor, a scan target, or both.
2. Add data-mascot-target to a stable element if Vee should position beside it.
3. Add the target selector to the correct selectorsBySection entry.
4. Ensure the element is visible and has non-zero bounds when scanned.
5. If it needs a special reaction, use a specific data attribute and implement an event listener in the target component, following FooterOutlinedWord.
6. Do not add a generic broad card outline or proximity effect.
7. Verify the scan still excludes hidden/inert/disabled content.
8. Verify keyboard and reduced-motion behavior.

### E. Edit the 3D model

1. Preserve the root/torso/head/limb group hierarchy.
2. Use the local sphere/capsule/mesh helpers where practical.
3. Keep the right index finger geometry and laserHandLocalPosition synchronized.
4. Re-check camera framing at mobile and desktop canvas sizes.
5. Re-check lights, material roughness/metalness and emissive values in both application themes.
6. Dispose every new geometry/material/texture during effect cleanup.
7. Do not start a second RAF loop.
8. Test resize observer cleanup and effect rebuild on breakpoint/reduced-motion changes.

### F. Refactor the monolith safely

The current component can be split into modules, but preserve clear responsibility boundaries:
- mascotSections: section/dialogue/pose key data;
- mascotScene: Three.js scene, camera, lights and procedural model;
- mascotPoseController: section poses, gestures, expression and gaze;
- mascotScrollController: section selection, footer state and positioning;
- mascotScanController: target discovery, arm aiming, beam, impact and target callbacks;
- mascotAudio: welcome and scan sound lifecycle;
- MascotDialogue / MascotControls: accessible DOM controls and portal.

A refactor must not create duplicated scroll listeners, a second render loop, stale refs between the scene and scan controller, or unowned timers. Keep the existing public component export stable unless all mounting code is changed deliberately.

## 17. Current implementation risks and QA items

These are observations to verify or consider; this documentation task did not modify the code.

1. The requestAnimationFrame loop continues for the full mounted page lifetime. There is no explicit document-visibility or offscreen pause in the inspected component.
2. updateScroll runs on every scroll and resize event and sets React state for active index and host position. Consider gating updates when active section/coordinates change or using a single scheduled frame if scroll performance becomes a problem.
3. The normalized global progress local is computed but not used as a motion graph. Section transitions are discrete.
4. The reduced-motion mode still builds/renders WebGL and keeps the RAF loop alive, even though movement is reduced.
5. The WebGL catch logs an error but there is no clearly rendered 2D replacement character in the current markup.
6. The mobile/desktop split is 768px and does not mirror the homepage hero's breakpoint set exactly.
7. The SECTIONS order is coupled to pose maps, handGestures and mobile orbit positions through array indexes. A partial edit can misalign Vee's behavior.
8. Desktop position depends on the first DOM match from the generic target query. A layout refactor can change the anchor unintentionally; use data-mascot-target where necessary.
9. Manual drag position persists only for the current component mount and remains the placement override until footer parking.
10. The dialogue record's detail field is required by hasSectionMessage but is not currently displayed in the dialogue.
11. The scan path relies on live DOM dimensions and current viewport visibility. Test at multiple scroll positions and after dynamic content/resize changes.
12. Verify that scan-specific target reactions always clean up timers and temporary inline styles if a target unmounts mid-scan.

## 18. Manual verification checklist

### Lifecycle
- First visit: intro completes, then Vee loads.
- Returning visit: page loader skips correctly and Vee loads after heroReady.
- Navigate to a project detail page: Vee is not mounted there.
- Navigate back to homepage: one Vee instance and one render loop exist.

### Section choreography
- Scroll slowly through Hero, About, Education, Skills, Experience, Projects and Contact.
- Check the active label/message, pose, hand gesture, facial expression and target-facing direction for every section.
- Scroll up and down to verify section transitions reverse correctly.
- Reach the footer and verify Vee settles at bottom-right in the seated pose.
- Resize through 767/768px and verify mobile/desktop placement changes.

### Interaction
- Click Vee to open the current section guide.
- Close dialogue and navigate using its action.
- Verify Contact action reaches the form and focus is set.
- Drag Vee and verify the click dialogue does not open after a drag.
- Verify the footer overrides a manual drag position.
- Trigger the scan in every section; verify beam starts at the right fingertip and target response is intentional.
- Verify footer word scan is teal and does not use generic orange text flash.
- Test welcome audio autoplay blocked and manual retry.
- Test scan sound blocked/muted gracefully.

### Accessibility and performance
- Keyboard focus and activation for main mascot button, message action, close, audio retry and scan button.
- Screen reader active section announcement.
- Reduced-motion mode.
- No horizontal/vertical scroll hijacking from mascot interactions.
- No stuck pointer capture.
- No console errors or GPU resource leaks after page navigation/unmount.
- Test a browser/device with WebGL disabled.
- Test a background tab returning to foreground.
- Test light/dark theme and 200% zoom.

## 19. Recreation rule

To recreate Vee faithfully, reproduce the complete system—not just a floating robot image:

1. The procedural Three.js model and its articulated hierarchy.
2. Section index detection using the 42%-viewport active marker.
3. Per-section pose and hand gesture mapping.
4. Desktop target-side and mobile orbit positioning.
5. Head gaze toward page content.
6. Idle, arrival, section-change and facial-expression behavior.
7. Dialogue and next-section navigation.
8. Drag and footer parking precedence.
9. Explicit laser scan with target selection and target-specific reaction.
10. Welcome/audio feedback, reduced motion, cleanup and error handling.

Changing only the character appearance while omitting the section model, movement and interactions does not recreate the existing mascot behavior.
