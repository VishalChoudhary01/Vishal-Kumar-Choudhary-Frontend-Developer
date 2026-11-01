
"use client";

import { useCallback, useEffect, useRef } from "react";

/*
 * Shared audio state for the entire client application.
 * Every useUiSound instance uses the same AudioContext.
 */
let sharedAudioContext = null;
let unlockListenersInstalled = false;

const decodedBufferPromises = new Map();

const clampVolume = (value) =>
    Math.max(0, Math.min(1, Number(value) || 0));

const getVoiceLimit = (value) =>
    Math.max(1, Math.min(8, Math.floor(value) || 1));

function getSharedAudioContext() {
    if (typeof window === "undefined") {
        return null;
    }

    const AudioContextConstructor =
        window.AudioContext || window.webkitAudioContext;

    if (!AudioContextConstructor) {
        return null;
    }

    if (
        !sharedAudioContext ||
        sharedAudioContext.state === "closed"
    ) {
        sharedAudioContext = new AudioContextConstructor();
        decodedBufferPromises.clear();
    }

    return sharedAudioContext;
}

/*
 * Resume the shared context from the first eligible user gesture.
 * This is not tied to ThemeToggle or any particular component.
 */
function installAudioUnlockListeners() {
    if (
        typeof window === "undefined" ||
        unlockListenersInstalled
    ) {
        return;
    }

    unlockListenersInstalled = true;

    const unlock = () => {
        const context = getSharedAudioContext();

        if (!context || context.state === "running") {
            return;
        }

        try {
            context.resume().catch(() => {
                // The browser may still restrict playback.
            });
        } catch {
            // Audio must never break normal interactions.
        }
    };

    window.addEventListener("pointerdown", unlock, {
        capture: true,
        passive: true,
    });

    window.addEventListener("touchstart", unlock, {
        capture: true,
        passive: true,
    });

    window.addEventListener("keydown", unlock, true);
}

/*
 * Fetch and decode each sound only once per source.
 */
function getDecodedBuffer(src, context) {
    if (decodedBufferPromises.has(src)) {
        return decodedBufferPromises.get(src);
    }

    const promise = fetch(src)
        .then((response) => {
            if (!response.ok) {
                throw new Error(
                    `Audio request failed (${response.status}): ${src}`,
                );
            }

            return response.arrayBuffer();
        })
        .then((arrayBuffer) =>
            context.decodeAudioData(arrayBuffer),
        )
        .catch((error) => {
            decodedBufferPromises.delete(src);
            throw error;
        });

    decodedBufferPromises.set(src, promise);

    return promise;
}

function stopVoice(voice) {
    if (!voice) {
        return;
    }

    voice.source.onended = null;

    try {
        voice.source.stop();
    } catch {
        // The voice may already have ended.
    }

    try {
        voice.source.disconnect();
        voice.gain.disconnect();
    } catch {
        // Ignore cleanup errors.
    }
}

function resetAudio(audio) {
    audio.pause();

    try {
        audio.currentTime = 0;
    } catch {
        // Ignore media reset errors.
    }
}

function createFallbackPool(src, options) {
    const count = options.interrupt
        ? 1
        : getVoiceLimit(options.maxVoices);

    return Array.from({ length: count }, () => {
        const audio = new Audio(src);

        audio.preload = options.preload;
        audio.volume = clampVolume(options.volume);

        return audio;
    });
}

export default function useUiSound(
    src,
    {
        volume = 0.35,
        interrupt = true,
        preload = "auto",
        maxVoices = 4,
    } = {},
) {
    const contextRef = useRef(null);
    const bufferRef = useRef(null);
    const bufferSrcRef = useRef(null);

    const voicesRef = useRef([]);
    const fallbackPoolRef = useRef([]);
    const nextVoiceRef = useRef(0);

    const srcRef = useRef(src);

    const optionsRef = useRef({
        volume,
        interrupt,
        preload,
        maxVoices,
    });

    srcRef.current = src;

    optionsRef.current = {
        volume,
        interrupt,
        preload,
        maxVoices,
    };

    /*
     * Prepare this hook's sound independently.
     */
    useEffect(() => {
        if (!src || typeof window === "undefined") {
            return undefined;
        }

        installAudioUnlockListeners();

        const context = getSharedAudioContext();

        contextRef.current = context;
        bufferRef.current = null;
        bufferSrcRef.current = src;

        voicesRef.current.forEach(stopVoice);
        voicesRef.current = [];

        if (context) {
            let active = true;

            getDecodedBuffer(src, context)
                .then((buffer) => {
                    if (
                        active &&
                        contextRef.current === context
                    ) {
                        bufferRef.current = buffer;
                        bufferSrcRef.current = src;
                    }
                })
                .catch((error) => {
                    if (
                        active &&
                        process.env.NODE_ENV !== "production"
                    ) {
                        console.warn(
                            `[useUiSound] Could not load "${src}".`,
                            error,
                        );
                    }
                });

            return () => {
                active = false;

                voicesRef.current.forEach(stopVoice);
                voicesRef.current = [];

                if (contextRef.current === context) {
                    contextRef.current = null;
                    bufferRef.current = null;
                    bufferSrcRef.current = null;
                }
            };
        }

        // Fallback for environments without Web Audio support.
        const pool = createFallbackPool(src, {
            volume,
            interrupt,
            preload,
            maxVoices,
        });

        fallbackPoolRef.current = pool;

        return () => {
            pool.forEach((audio) => {
                resetAudio(audio);
                audio.removeAttribute("src");
                audio.load();
            });

            if (fallbackPoolRef.current === pool) {
                fallbackPoolRef.current = [];
            }
        };
    }, [src, preload, interrupt, maxVoices]);

    /*
     * Play independently from the calling component.
     * The shared context is not coupled to theme state.
     */
    const play = useCallback(() => {
        const currentSrc = srcRef.current;

        if (!currentSrc || typeof window === "undefined") {
            return;
        }

        const options = optionsRef.current;
        const context =
            contextRef.current || getSharedAudioContext();

        if (!context) {
            // Legacy fallback: use a native audio element.
            const pool = fallbackPoolRef.current;

            if (!pool.length) {
                return;
            }

            let index = 0;

            if (!options.interrupt && pool.length > 1) {
                const available = pool.findIndex(
                    (audio) => audio.paused || audio.ended,
                );

                index =
                    available >= 0
                        ? available
                        : nextVoiceRef.current % pool.length;
            }

            const audio = pool[index];

            audio.volume = clampVolume(options.volume);
            resetAudio(audio);

            nextVoiceRef.current = (index + 1) % pool.length;

            try {
                audio.play().catch(() => {
                    // Browser restrictions must not break the UI.
                });
            } catch {
                // Ignore optional audio failures.
            }

            return;
        }

        contextRef.current = context;

        const startPlayback = (buffer) => {
            /*
             * Do not schedule scroll-triggered sounds into a
             * suspended context. Wait for a genuine user gesture.
             */
            if (
                contextRef.current !== context ||
                context.state !== "running"
            ) {
                return;
            }

            const currentOptions = optionsRef.current;

            if (currentOptions.interrupt) {
                voicesRef.current.forEach(stopVoice);
                voicesRef.current = [];
            } else {
                const limit = getVoiceLimit(
                    currentOptions.maxVoices,
                );

                while (voicesRef.current.length >= limit) {
                    const oldest = voicesRef.current.shift();
                    stopVoice(oldest);
                }
            }

            try {
                const source = context.createBufferSource();
                const gain = context.createGain();

                source.buffer = buffer;
                gain.gain.value = clampVolume(
                    currentOptions.volume,
                );

                source.connect(gain);
                gain.connect(context.destination);

                const voice = { source, gain };

                voicesRef.current.push(voice);

                source.onended = () => {
                    voicesRef.current =
                        voicesRef.current.filter(
                            (activeVoice) => activeVoice !== voice,
                        );

                    try {
                        source.disconnect();
                        gain.disconnect();
                    } catch {
                        // Ignore completed voice cleanup errors.
                    }
                };

                source.start(0);
                nextVoiceRef.current += 1;
            } catch (error) {
                if (process.env.NODE_ENV !== "production") {
                    console.warn(
                        "[useUiSound] Could not start playback.",
                        error,
                    );
                }
            }
        };

        const loadAndPlay = () => {
            if (
                bufferRef.current &&
                bufferSrcRef.current === currentSrc
            ) {
                startPlayback(bufferRef.current);
                return;
            }

            getDecodedBuffer(currentSrc, context)
                .then((buffer) => {
                    if (contextRef.current !== context) {
                        return;
                    }

                    bufferRef.current = buffer;
                    bufferSrcRef.current = currentSrc;

                    startPlayback(buffer);
                })
                .catch(() => {
                    // The loading effect reports decode failures.
                });
        };

        if (context.state === "running") {
            loadAndPlay();
            return;
        }

        /*
         * If this call comes from a genuine click/key activation,
         * it can attempt to resume the context immediately.
         * An initial hover or scroll cannot override autoplay policy.
         */
        const activation =
            typeof navigator !== "undefined"
                ? navigator.userActivation
                : undefined;

        if (activation && !activation.isActive) {
            return;
        }

        try {
            context.resume()
                .then(() => {
                    if (context.state === "running") {
                        loadAndPlay();
                    }
                })
                .catch(() => {
                    // Silently respect the browser's audio policy.
                });
        } catch {
            // Sound is optional; preserve UI functionality.
        }
    }, []);

    const stop = useCallback(() => {
        voicesRef.current.forEach(stopVoice);
        voicesRef.current = [];

        fallbackPoolRef.current.forEach(resetAudio);
    }, []);

    return { play, stop };
}
