"use client";

import { Component, Suspense } from "react";
import {
  MagneticInteractionRuntime,
  ScrollDrivenTextRevealRuntime,
  GradientBloomRuntime,
  GenerativeParticleFieldRuntime,
} from "./registry";

function RuntimeLoadingState() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-surface-2">
      <div className="flex items-center gap-3 text-xs text-text-muted" role="status">
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
    return (
      <iframe
        title="Published interactive experiment"
        src={runtimeUrl}
        sandbox="allow-scripts allow-same-origin"
        referrerPolicy="no-referrer"
        className="absolute inset-0 h-full w-full border-0 bg-white"
      />
    );
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
  settings,
  restartKey,
  isFullscreen,
}) {
  return (
    <RuntimeErrorBoundary key={`${runtimeKey}-${restartKey}`}>
      <Suspense fallback={<RuntimeLoadingState />}>
        <LabRuntimeRenderer
          runtimeKey={runtimeKey}
          runtimeUrl={runtimeUrl}
          settings={settings}
          restartKey={restartKey}
          isFullscreen={isFullscreen}
        />
      </Suspense>
    </RuntimeErrorBoundary>
  );
}
