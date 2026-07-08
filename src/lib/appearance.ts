import type { CSSProperties } from "react";

export type BackgroundType = "default" | "solid" | "gradient" | "image";

export interface BackgroundConfig {
  type: BackgroundType;
  color?: string;
  gradientFrom?: string;
  gradientTo?: string;
  gradientAngle?: number;
  imageUrl?: string;
  animated?: boolean;
}

export interface AppearanceSettings {
  light: BackgroundConfig;
  dark: BackgroundConfig;
}

export const defaultBackgroundConfig: BackgroundConfig = { type: "default" };

export const defaultAppearance: AppearanceSettings = {
  light: { ...defaultBackgroundConfig },
  dark: { ...defaultBackgroundConfig },
};

export const defaultAppearanceJson = JSON.stringify(defaultAppearance);

function cloneDefault(): AppearanceSettings {
  return JSON.parse(defaultAppearanceJson) as AppearanceSettings;
}

// Safely parses the appearance JSON saved by the admin, always returning a
// complete, well-formed object even if the stored value is missing or malformed.
export function parseAppearance(raw: string | null | undefined): AppearanceSettings {
  if (!raw) {
    return cloneDefault();
  }
  try {
    const parsed = JSON.parse(raw);
    return {
      light: { ...defaultBackgroundConfig, ...(parsed?.light || {}) },
      dark: { ...defaultBackgroundConfig, ...(parsed?.dark || {}) },
    };
  } catch {
    return cloneDefault();
  }
}

// Converts a background config into inline CSS for solid/gradient/image types.
// The "default" type is handled entirely via CSS classes, so it returns nothing here.
export function backgroundStyle(config: BackgroundConfig): CSSProperties {
  if (config.type === "solid" && config.color) {
    return { backgroundColor: config.color };
  }
  if (config.type === "gradient") {
    const angle = config.gradientAngle ?? 135;
    const from = config.gradientFrom || "#2563eb";
    const to = config.gradientTo || "#7c3aed";
    return { backgroundImage: `linear-gradient(${angle}deg, ${from}, ${to})` };
  }
  if (config.type === "image" && config.imageUrl) {
    return {
      backgroundImage: `url(${config.imageUrl})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    };
  }
  return {};
}
