"use client";

import { useRef, useState } from "react";
import LabControlsPanel from "./LabControlsPanel";
import LabCanvasActions from "./LabCanvasActions";
import LabRuntimeBoundary from "@/app/components/labs/runtime/LabRuntimeBoundary";
import LabCanvas from "@/app/components/labs/runtime/LabCanvas";
import { hasLabRuntime } from "@/app/components/labs/runtime/registry";
import useLabDemoSettings from "@/app/hooks/labs/useLabDemoSettings";
import useLabFullscreen from "@/app/hooks/labs/useLabFullscreen";

export default function LabWorkspace({ experiment }) {
  const demo = experiment.demo || {};
  const runtimeKey = demo.runtimeKey || experiment.slug;
  const runtimeAvailable = hasLabRuntime(runtimeKey);
  const configuredControls = Array.isArray(demo.controls) ? demo.controls : [];
  const controls = runtimeAvailable ? configuredControls : [];

  const canvasRef = useRef(null);
  const [restartKey, setRestartKey] = useState(0);

  const {
    values,
    updateSetting,
    resetSettings,
    isDirty,
  } = useLabDemoSettings(controls);

  const {
    isFullscreen,
    isSupported: fullscreenSupported,
    toggleFullscreen,
  } = useLabFullscreen(canvasRef);

  const canRestart =
    runtimeAvailable && demo.capabilities?.restart === true;
  const canFullscreen =
    runtimeAvailable &&
    demo.capabilities?.fullscreen === true &&
    fullscreenSupported;

  const actions = (
    <LabCanvasActions
      canRestart={canRestart}
      onRestart={() => setRestartKey((current) => current + 1)}
      canFullscreen={canFullscreen}
      isFullscreen={isFullscreen}
      onToggleFullscreen={toggleFullscreen}
    />
  );

  return (
    <section
      aria-label="Interactive experiment workspace"
      className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-20"
    >
      <div
        className={
          controls.length
            ? "grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)] lg:items-start lg:gap-6"
            : "grid grid-cols-1"
        }
      >
        <div className="min-w-0">
          <LabCanvas
            canvasRef={canvasRef}
            aspectRatio={demo.aspectRatio}
            isFullscreen={isFullscreen}
            actions={actions}
          >
            <LabRuntimeBoundary
              runtimeKey={runtimeKey}
              settings={values}
              restartKey={restartKey}
            />
          </LabCanvas>
        </div>

        {controls.length ? (
          <LabControlsPanel
            controls={controls}
            values={values}
            onChange={updateSetting}
            onReset={resetSettings}
            isDirty={isDirty}
          />
        ) : null}
      </div>
    </section>
  );
}
