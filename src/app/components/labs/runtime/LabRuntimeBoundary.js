"use client";

import { Component, Suspense, useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import {
  MagneticInteractionRuntime,
  ScrollDrivenTextRevealRuntime,
  GradientBloomRuntime,
  GenerativeParticleFieldRuntime,
} from "./registry";

function RuntimeLoadingState() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-surface-2">
      <div className="flex items-center gap-3 text-xs text-text-muted" role="status" aria-live="polite">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-brand motion-reduce:animate-none" />
        Preparing experiment…
      </div>
    </div>
  );
}

function RuntimeUnavailableState() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-surface-2 px-6 text-center">
      <div className="max-w-sm">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand">
          Preview unavailable
        </p>
        <p className="mt-3 text-sm leading-6 text-text-secondary">
          This experiment preview is being prepared.
        </p>
      </div>
    </div>
  );
}

function PublishedArtifactFrame({ runtimeUrl, artifactId }) {
  const frameRef = useRef(null);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState("starting");
  const [error, setError] = useState("");

  const retry = useCallback(() => {
    setError("");
    setStatus("starting");
    setAttempt((value) => value + 1);
  }, []);

  useEffect(() => {
    if (status !== "starting" && status !== "handshaking") return undefined;

    const timeout = window.setTimeout(() => {
      setStatus("failed");
      setError("The experiment did not become ready. Check the published build and try again.");
    }, 15000);

    return () => window.clearTimeout(timeout);
  }, [attempt, status]);

  useEffect(() => {
    const handleMessage = (event) => {
      const frame = frameRef.current;
      if (!frame || event.source !== frame.contentWindow) return;
      if (!event.data || event.data.artifactId !== artifactId) return;

      if (event.data.type === "labs-artifact-ready") {
        setStatus("ready");
        setError("");
        return;
      }

      if (event.data.type === "labs-artifact-error") {
        setStatus("failed");
        setError(
          typeof event.data.message === "string"
            ? event.data.message.slice(0, 500)
            : "The experiment could not finish starting.",
        );
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [artifactId]);

  const handleFrameLoad = () => {
    setStatus((current) => current === "starting" ? "handshaking" : current);
    frameRef.current?.contentWindow?.postMessage(
      { type: "labs-runtime-parent-ready", artifactId },
      "*",
    );
  };

  return (
    <div className="absolute inset-0 bg-surface-2">
      <iframe
        key={attempt}
        ref={frameRef}
        title="Published interactive experiment"
        src={runtimeUrl}
        // Deliberately omit allow-same-origin. The same-site runtime endpoint
        // runs under an opaque sandbox origin and cannot access portfolio cookies.
        sandbox="allow-scripts"
        referrerPolicy="no-referrer"
        onLoad={handleFrameLoad}
        onError={() => {
          setStatus("failed");
          setError("The published experiment could not be loaded.");
        }}
        className="absolute inset-0 h-full w-full border-0 bg-surface-2"
      />

      {(status === "starting" || status === "handshaking") ? (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-surface-2">
          <div className="flex items-center gap-3 text-xs text-text-muted" role="status" aria-live="polite">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-brand motion-reduce:animate-none" />
            {status === "handshaking" ? "Starting experiment…" : "Loading experiment…"}
          </div>
        </div>
      ) : null}

      {status === "failed" ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-surface-2 px-6 text-center">
          <div className="max-w-md">
            <AlertTriangle size={20} className="mx-auto text-warning" aria-hidden="true" />
            <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.2em] text-warning">
              Preview unavailable
            </p>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              {error || "The published experiment could not start."}
            </p>
            <button
              type="button"
              onClick={retry}
              className="mt-4 inline-flex h-9 items-center gap-2 border border-border px-3 text-xs font-semibold text-text-primary transition-colors hover:border-brand hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand motion-reduce:transition-none"
            >
              <RefreshCw size={13} aria-hidden="true" />
              Retry preview
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

class RuntimeErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-2 px-6 text-center">
          <div className="max-w-sm">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-error">
              Preview stopped
            </p>
            <p className="mt-3 text-sm leading-6 text-text-secondary">
              Something went wrong while running this experiment. Reload the page to try again.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function LabRuntimeRenderer({
  runtimeKey,
  runtimeUrl,
  artifactId,
  settings,
  restartKey,
  isFullscreen,
}) {
  const runtimeProps = {
    settings,
    restartKey,
    isFullscreen,
  };

  if (runtimeUrl) {
    return artifactId
      ? <PublishedArtifactFrame runtimeUrl={runtimeUrl} artifactId={artifactId} />
      : <RuntimeUnavailableState />;
  }

  switch (runtimeKey) {
    case "magnetic-interaction":
      return <MagneticInteractionRuntime {...runtimeProps} />;
    case "scroll-driven-text-reveal":
      return <ScrollDrivenTextRevealRuntime {...runtimeProps} />;
    case "gradient-bloom":
      return <GradientBloomRuntime {...runtimeProps} />;
    case "generative-particle-field":
      return <GenerativeParticleFieldRuntime {...runtimeProps} />;
    default:
      return <RuntimeUnavailableState />;
  }
}

export default function LabRuntimeBoundary({
  runtimeKey,
  runtimeUrl,
  artifactId,
  settings,
  restartKey,
  isFullscreen,
}) {
  return (
    <RuntimeErrorBoundary key={`${runtimeKey}-${artifactId || "builtin"}-${restartKey}`}>
      <Suspense fallback={<RuntimeLoadingState />}>
        <LabRuntimeRenderer
          runtimeKey={runtimeKey}
          runtimeUrl={runtimeUrl}
          artifactId={artifactId}
          settings={settings}
          restartKey={restartKey}
          isFullscreen={isFullscreen}
        />
      </Suspense>
    </RuntimeErrorBoundary>
  );
}
