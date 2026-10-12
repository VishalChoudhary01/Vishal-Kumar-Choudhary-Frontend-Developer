"use client";

import { useCallback, useRef, useState } from "react";

export function useDownload() {
    const [progress, setProgress] = useState(0);
    const [downloading, setDownloading] =
        useState(false);
    const [completed, setCompleted] =
        useState(false);
    const [error, setError] = useState(null);

    const abortRef = useRef(null);

    const download = useCallback(
        async (url, filename = "download") => {
            if (!url || downloading) return;

            setDownloading(true);
            setCompleted(false);
            setError(null);
            setProgress(0);

            const controller =
                new AbortController();

            abortRef.current = controller;

            try {
                const response = await fetch(url, {
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error(
                        `Download failed: ${response.status}`
                    );
                }

                if (!response.body) {
                    throw new Error(
                        "Download stream is not available."
                    );
                }

                const contentLength =
                    response.headers.get(
                        "content-length"
                    );

                const total = contentLength
                    ? Number(contentLength)
                    : 0;

                const reader =
                    response.body.getReader();

                const chunks = [];
                let received = 0;

                while (true) {
                    const { done, value } =
                        await reader.read();

                    if (done) break;

                    if (value) {
                        chunks.push(value);
                        received += value.length;
                    }

                    if (total > 0) {
                        const percentage =
                            Math.round(
                                (received / total) * 100
                            );

                        setProgress(
                            Math.min(100, percentage)
                        );
                    }
                }

                const blob = new Blob(chunks);

                const blobUrl =
                    window.URL.createObjectURL(blob);

                const anchor =
                    document.createElement("a");

                anchor.href = blobUrl;
                anchor.download = filename;

                document.body.appendChild(anchor);
                anchor.click();
                anchor.remove();

                window.URL.revokeObjectURL(
                    blobUrl
                );

                setProgress(100);
                setCompleted(true);
            } catch (err) {
                if (
                    err?.name === "AbortError"
                ) {
                    return;
                }

                console.error(
                    "Download error:",
                    err
                );

                setError(err);

                setProgress(0);
            } finally {
                setDownloading(false);
                abortRef.current = null;
            }
        },
        [downloading]
    );

    const cancel = useCallback(() => {
        abortRef.current?.abort();
    }, []);

    const reset = useCallback(() => {
        setProgress(0);
        setDownloading(false);
        setCompleted(false);
        setError(null);
    }, []);

    return {
        download,
        cancel,
        reset,
        progress,
        downloading,
        completed,
        error,
    };
}