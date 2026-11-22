/* global window */
import { useEffect, useState } from "react";
import { defaults } from "../model/defaults";
import type { Config } from "../model/types";
import { readConfig, MAX_QUERY_LENGTH } from "../config/url";
import { presets } from "../config/presets";
import { useExperiment } from "./useExperiment";

export function usePlayground() {
  const experiment = useExperiment(defaults);
  const { update: restore, setRunning } = experiment;
  const [reduced, setReduced] = useState(false);
  const [chosenPreset, setChosenPreset] = useState("tuned");
  const [loadedPreset, setLoadedPreset] = useState("");
  const update = (next: Config) => {
    setLoadedPreset("");
    restore(next);
  };
  useEffect(() => {
    restore(readConfig(window.location.search));
    const preset =
      window.location.search.length <= MAX_QUERY_LENGTH
        ? new window.URLSearchParams(window.location.search).get("preset")
        : null;
    if (preset && Object.hasOwn(presets, preset)) {
      setChosenPreset(preset);
      setLoadedPreset(preset);
    }
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => {
      setReduced(media.matches);
      if (media.matches) setRunning(false);
    };
    const pop = () => {
      restore(readConfig(window.location.search));
      setLoadedPreset("");
    };
    change();
    media.addEventListener("change", change);
    window.addEventListener("popstate", pop);
    return () => {
      media.removeEventListener("change", change);
      window.removeEventListener("popstate", pop);
    };
  }, [restore, setRunning]);

  return {
    ...experiment,
    update,
    reduced,
    chosenPreset,
    setChosenPreset,
    loadedPreset,
    loadPreset: (key: string) => {
      if (!Object.hasOwn(presets, key)) return;
      restore({ ...defaults, ...presets[key].config });
      setLoadedPreset(key);
    },
  };
}
