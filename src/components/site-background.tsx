import { backgroundStyle, type AppearanceSettings, type BackgroundConfig } from "@/lib/appearance";

function Layer({ mode, config }: { mode: "light" | "dark"; config: BackgroundConfig }) {
  const isDefault = config.type === "default";
  const visibilityClass = mode === "light" ? "site-background-light" : "site-background-dark";
  const defaultClass = isDefault ? (mode === "light" ? "site-background-light-default" : "site-background-dark-default") : "";
  const customTypeClass = !isDefault ? (config.type === "gradient" ? "site-custom-gradient" : config.type === "image" ? "site-custom-image" : "site-custom-solid") : "";
  const animatedClass = isDefault || config.animated ? "site-background-animated" : "";

  return (
    <div
      className={`site-background-layer ${visibilityClass} ${defaultClass} ${customTypeClass} ${animatedClass}`.trim()}
      style={!isDefault ? backgroundStyle(config) : undefined}
    >
      {isDefault ? (
        <>
          <span className={`site-blob ${mode === "light" ? "site-blob-a" : "site-blob-d"}`} />
          <span className={`site-blob ${mode === "light" ? "site-blob-b" : "site-blob-e"}`} />
          <span className={`site-blob ${mode === "light" ? "site-blob-c" : "site-blob-f"}`} />
          <span className={`site-grid ${mode === "dark" ? "site-grid-dark" : ""}`} />
        </>
      ) : null}
    </div>
  );
}

// Renders both a light-mode and dark-mode decorative background layer. Only
// one is visible at a time, controlled purely by the `.dark` class on <html>,
// so switching themes never triggers a layout shift or content re-fetch.
export function SiteBackground({ appearance }: { appearance: AppearanceSettings }) {
  return (
    <div aria-hidden="true" className="site-background">
      <Layer mode="light" config={appearance.light} />
      <Layer mode="dark" config={appearance.dark} />
    </div>
  );
}
