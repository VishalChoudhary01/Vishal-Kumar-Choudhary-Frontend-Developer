
"use client";

import { useCallback, useEffect, useRef } from "react";

const clampVolume = (value) =>
    Math.max(0, Math.min(1, Number(value) || 0));

function createAudioPool(src, options) {
    const voiceCount = options.interrupt
        ? 1
        : Math.max(
            1,
            Math.min(8, Math.floor(options.maxVoices) || 1),
        );

    return Array.from({ length: voiceCount }, () => {
        const audio = new Audio(src);

        audio.preload = options.preload;
        audio.volume = clampVolume(options.volume);

        return audio;
    });
}

function resetAudio(audio) {
    audio.pause();

    try {
        audio.currentTime = 0;
    } catch {
        // The media may not have loaded yet.
    }
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
    const audioPoolRef = useRef([]);
    const nextVoiceRef = useRef(0);

    const srcRef = useRef(src);

    const optionsRef = useRef({
        volume,
        interrupt,
        preload,
        maxVoices,
    });

    // Keep the latest source and options available to callbacks.
    srcRef.current = src;

    optionsRef.current = {
        volume,
        interrupt,
        preload,
        maxVoices,
    };

    /*
     * Prepare an independent audio pool for this hook instance.
     */
    useEffect(() => {
        if (!src || typeof window === "undefined") {
            audioPoolRef.current = [];
            return undefined;
        }

        const pool = createAudioPool(src, {
            volume,
            interrupt,
            preload,
            maxVoices,
        });

        audioPoolRef.current = pool;
        nextVoiceRef.current = 0;

        return () => {
            pool.forEach((audio) => {
                resetAudio(audio);

                audio.removeAttribute("src");
                audio.load();
            });

            if (audioPoolRef.current === pool) {
                audioPoolRef.current = [];
            }
        };
    }, [src, interrupt, preload, maxVoices]);

    /*
     * Attempt playback immediately when the component calls play().
     */
    const play = useCallback(() => {
        const currentSrc = srcRef.current;

        if (!currentSrc || typeof window === "undefined") {
            console.warn(
                "[useUiSound] Playback skipped: missing source or browser environment.",
                { src: currentSrc },
            );
            return;
        }

        const options = optionsRef.current;

        let pool = audioPoolRef.current;

        // Fallback in case playback is called before effect setup.
        if (pool.length === 0) {
            console.warn(
                "[useUiSound] Audio pool was empty. Creating it on demand.",
                { src: currentSrc },
            );

            pool = createAudioPool(currentSrc, options);
            audioPoolRef.current = pool;
        }

        let index = 0;

        if (!options.interrupt && pool.length > 1) {
            const availableIndex = pool.findIndex(
                (audio) => audio.paused || audio.ended,
            );

            index =
                availableIndex >= 0
                    ? availableIndex
                    : nextVoiceRef.current % pool.length;
        }

        const audio = pool[index];

        audio.volume = clampVolume(options.volume);

        resetAudio(audio);

        nextVoiceRef.current = (index + 1) % pool.length;

        try {
            const playback = audio.play();

            if (playback && typeof playback.catch === "function") {
                playback.catch((error) => {
                    // TEMPORARY DEBUG LOGGING.
                    // Remove or downgrade after diagnosing the issue.
                    if (process.env.NODE_ENV !== "production") {
                        console.warn(
                            `[useUiSound] Playback failed for "${currentSrc}":`,
                            error.name,
                            error.message,
                            {
                                readyState: audio.readyState,
                                networkState: audio.networkState,
                                paused: audio.paused,
                                currentTime: audio.currentTime,
                                volume: audio.volume,
                                audioUrl: audio.currentSrc || audio.src,
                            },
                        );
                    }
                });
            }
        } catch (error) {
            // TEMPORARY DEBUG LOGGING for synchronous failures.
            if (process.env.NODE_ENV !== "production") {
                console.warn(
                    `[useUiSound] Could not start "${currentSrc}":`,
                    error.name,
                    error.message,
                );
            }
        }
    }, []);

    const stop = useCallback(() => {
        audioPoolRef.current.forEach(resetAudio);
    }, []);

    return { play, stop };
}
