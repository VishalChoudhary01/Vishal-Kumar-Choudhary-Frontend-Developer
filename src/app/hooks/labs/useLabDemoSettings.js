"use client";

import { useCallback, useMemo, useState } from "react";

function createDefaults(controls) {
  return Object.fromEntries(
    controls
      .filter((control) => control?.id)
      .map((control) => [control.id, control.defaultValue])
  );
}

export default function useLabDemoSettings(controls = []) {
  const defaults = useMemo(() => createDefaults(controls), [controls]);
  const [values, setValues] = useState(defaults);

  const updateSetting = useCallback((id, value) => {
    setValues((current) => ({
      ...current,
      [id]: value,
    }));
  }, []);

  const resetSettings = useCallback(() => {
    setValues(defaults);
  }, [defaults]);

  const isDirty = useMemo(
    () => Object.keys(defaults).some(
      (key) => !Object.is(values[key], defaults[key])
    ),
    [defaults, values]
  );

  return {
    values,
    updateSetting,
    resetSettings,
    isDirty,
  };
}
