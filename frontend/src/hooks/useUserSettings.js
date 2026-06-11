import { useCallback, useEffect, useState } from "react";
import { getUserSettings } from "../api/userSettingsApi";
import { applyLanguage, getInitialLanguage } from "../i18n/language";
import { applyFontSize, getStoredFontSize } from "../utils/fontSize";

const DEFAULT_SETTINGS = {
  baseCurrency: "PLN",
  language: getInitialLanguage(),
  fontSize: "normal",
};

function withResolvedFontSize(settings) {
  return {
    ...settings,
    fontSize: getStoredFontSize() || settings?.fontSize || "normal",
  };
}

export function useUserSettings() {
  const [settings, setSettings] = useState(() => withResolvedFontSize(DEFAULT_SETTINGS));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = withResolvedFontSize(await getUserSettings());
      applyFontSize(data.fontSize);
      applyLanguage(data.language);
      setSettings((current) => ({ ...current, ...data }));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    const onUpdated = (event) => {
      if (!event.detail) return;
      const data = withResolvedFontSize(event.detail);
      applyFontSize(data.fontSize);
      applyLanguage(data.language);
      setSettings((current) => ({ ...current, ...data }));
    };
    window.addEventListener("user-settings-updated", onUpdated);
    return () => window.removeEventListener("user-settings-updated", onUpdated);
  }, []);

  return { settings, loading, error, reload };
}
