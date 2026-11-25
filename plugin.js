/**
 * Cider 2 / 2.5+ Self-Contained Plugin Bundle (plugin.js & index.js)
 * Compatible with:
 *  1. Cider 2.5+ (@ciderapp/pluginkit ES Module loader: `setup()` lifecycle hook)
 *  2. Cider 2.0-2.4 Legacy Plugin Loader (`onReady()` / auto-init)
 *  3. Direct DevTools Console / Custom Script Injection inside Cider (`Ctrl+Shift+I`)
 */

const INJECTED_CSS = `:root {
  --bg-core: #06030a;
  --tok-keyword: #ff9922;
  --tok-method: #ff4fa8;
  --tok-property: #ff55b2;
  --tok-variable: #ffe8d6;
  --tok-arg: #d6c9ef;
  --tok-bracket: #9683ec;
  --tok-operator: #a695f5;
  --tok-dot: #72e5ff;
  --tok-comment: #7c699e;
  --cursor-top: #ffaa22;
  --cursor-mid: #ff6a00;
  --cursor-bot: #ff3d00;
  --cursor-glow: #ff6600;
  --ide-font-stack: "SF Mono", "JetBrains Mono", "Fira Code", Menlo, Monaco, "Cascadia Code", Consolas, "Ubuntu Mono", "DejaVu Sans Mono", "Vazirmatn", "Segoe UI", "Noto Sans Arabic", "PingFang SC", "Microsoft YaHei", "Meiryo", ui-monospace, monospace;
}

#cider-ide-visualizer-root {
  position: absolute;
  inset: 0;
  z-index: 50;
  background-color: var(--bg-core);
  perspective: 950px;
  overflow: hidden;
  font-family: var(--ide-font-stack);
  font-feature-settings: "liga" 1, "calt" 1;
  transition: background-color 0.6s ease, opacity 0.35s ease;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  user-select: none;
}

#cider-ide-visualizer-root.is-fullscreen {
  position: fixed;
  z-index: 9990;
}

body.cider-ide-lyrics-active .lyric-line,
body.cider-ide-lyrics-active .clp-line,
body.cider-ide-lyrics-active .clp-word,
body.cider-ide-lyrics-active .clp-ts,
body.cider-ide-lyrics-active .clp-trans,
body.cider-ide-lyrics-active .clp-roman,
body.cider-ide-lyrics-active .am-lyrics .lyric {
  opacity: 0 !important;
  pointer-events: none !important;
}

#cider-ide-wave-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

#cider-ide-vignette {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
  background: radial-gradient(
    circle at 38% 50%,
    rgba(0, 0, 0, 0) 42%,
    rgba(4, 2, 9, 0.62) 86%,
    rgba(2, 1, 5, 0.90) 100%
  );
}

.cider-ide-stage {
  position: absolute;
  inset: 0;
  z-index: 2;
  perspective: 950px;
  overflow: hidden;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-bottom: 90px;
}

.cider-ide-plane {
  position: relative;
  width: 96%;
  max-width: 1320px;
  padding-left: var(--ide-plane-padding-left, 4%);
  padding-right: 3%;
  padding-bottom: 110px;
  font-size: 36px;
  transform-style: preserve-3d;
  transform-origin: center center;
  will-change: transform;
  font-family: var(--ide-font-stack);
}

.cider-ide-line {
  position: relative;
  display: flex;
  align-items: baseline;
  width: fit-content;
  max-width: 100%;
  white-space: normal;
  line-height: var(--ide-line-height, 1.48);
  margin-bottom: var(--ide-line-margin, 0.2em);
  padding: 0.08em 0.65em 0.08em 0.5em;
  border-radius: 6px;
  background: rgba(7, 4, 16, 0.56);
  border-left: 3px solid transparent;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
  transform-style: preserve-3d;
  transition: filter 0.25s ease, opacity 0.25s ease, background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  pointer-events: auto;
  cursor: pointer;
}

.cider-line-tokens {
  position: relative;
  display: inline-flex;
  flex-wrap: wrap;
  align-items: baseline;
  row-gap: 0.12em;
  column-gap: 0.02em;
  flex: 0 1 auto;
  min-width: 0;
}

.cider-word-cluster {
  display: inline-flex;
  align-items: baseline;
  white-space: nowrap;
  unicode-bidi: isolate;
}

.cider-word-cluster.is-untyped-cluster {
  visibility: hidden;
  pointer-events: none;
}

.cider-ide-line.is-future-line .cider-word-cluster.is-untyped-cluster {
  display: none !important;
}

.cider-ide-line:hover {
  background: rgba(18, 12, 34, 0.82);
  border-left-color: var(--tok-keyword);
  filter: none !important;
}

.cider-ide-line:hover .cider-code-token {
  opacity: 1 !important;
}

.cider-ide-line:hover .cider-tok-untyped {
  opacity: 0.68 !important;
  color: inherit !important;
}

.cider-line-time-badge {
  display: inline-flex;
  align-items: center;
  margin-left: 0.55em;
  padding: 0.06em 0.45em;
  border-radius: 999px;
  font-size: 0.36em;
  font-weight: 700;
  color: #ffffff;
  background: rgba(16, 8, 28, 0.92);
  border: 1px solid var(--tok-keyword);
  opacity: 0;
  transform: translateX(-4px);
  transition: opacity 0.18s ease, transform 0.18s ease;
  pointer-events: none;
  z-index: 12;
  align-self: center;
}

.cider-ide-line:hover .cider-line-time-badge {
  opacity: 1;
  transform: translateX(0);
}

.cider-ide-line.is-active-line {
  opacity: 1 !important;
  background: linear-gradient(90deg, rgba(16, 9, 32, 0.95) 0%, rgba(255, 79, 168, 0.26) 45%, rgba(255, 153, 34, 0.16) 85%, rgba(10, 5, 22, 0.72) 100%);
  border-left: 4px solid var(--tok-keyword);
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.65), 0 0 24px rgba(255, 153, 34, 0.16);
}

.cider-ide-line.spacer-line {
  height: 0.55em;
  background: transparent;
  border: none;
  box-shadow: none;
  pointer-events: none;
}

.cider-line-gutter {
  display: inline-block;
  flex-shrink: 0;
  width: 2.0em;
  margin-right: 0.6em;
  font-size: 0.52em;
  color: rgba(255, 255, 255, 0.38);
  text-align: right;
  font-weight: 600;
}

.cider-ide-line.is-active-line .cider-line-gutter {
  color: var(--tok-keyword);
  font-weight: 800;
  text-shadow: 0 0 12px var(--tok-keyword);
}

.cider-code-token {
  display: inline-block;
  position: relative;
  white-space: pre;
  unicode-bidi: isolate;
  transition: color 0.22s ease, opacity 0.2s ease, transform 0.18s cubic-bezier(0.2, 0.9, 0.3, 1), text-shadow 0.2s ease;
}

.cider-tok-typed {
  display: inline-block;
  position: relative;
  transition: color 0.16s ease, background 0.16s ease, box-shadow 0.16s ease, text-shadow 0.16s ease;
}

.cider-code-token.is-lyric-word .cider-tok-typed {
  padding: var(--ide-token-padding, 0.02em 0.15em);
  margin: 0 0.025em;
  border-radius: 0.22em;
  background: rgba(255, 255, 255, 0.075);
  border: 1px solid rgba(255, 255, 255, 0.11);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.9);
}

.cider-tok-untyped {
  display: inline-block;
  visibility: hidden;
  pointer-events: none;
}

.cider-code-token.is-untyped-token {
  visibility: hidden;
}

.cider-ide-line.is-future-line {
  opacity: 0 !important;
  visibility: hidden !important;
  pointer-events: none !important;
}

.cider-ide-line.is-future-line .cider-line-gutter {
  opacity: 0 !important;
  visibility: hidden !important;
}

.cider-code-token.spoken-word .cider-tok-typed {
  background: rgba(255, 255, 255, 0.11);
  border-color: rgba(255, 255, 255, 0.22);
  border-bottom: 2px solid rgba(255, 255, 255, 0.38);
}

.cider-code-token.active-word {
  transform: translateZ(12px) scale(1.05);
  z-index: 8;
  display: inline-block !important;
}

@keyframes ciderWordBeatBounce {
  0% {
    transform: translateZ(32px) scale(1.24);
    filter: brightness(1.4);
  }
  30% {
    transform: translateZ(20px) scale(1.14);
    filter: brightness(1.2);
  }
  65% {
    transform: translateZ(10px) scale(1.02);
  }
  100% {
    transform: translateZ(14px) scale(1.06);
    filter: brightness(1.0);
  }
}

.cider-code-token.active-word.is-word-bounce {
  animation: ciderWordBeatBounce 0.36s cubic-bezier(0.18, 0.89, 0.32, 1.28) both;
}

#cider-ide-visualizer-root.is-vocal-zoomed .cider-ide-line.is-past-line {
  opacity: 0.52;
  filter: blur(calc(var(--ide-dof-mult, 1) * 2px));
  transition: opacity 0.35s ease, filter 0.35s ease;
}

.cider-code-token.active-word .cider-tok-typed {
  color: #ffffff !important;
  background: linear-gradient(135deg, rgba(255, 153, 34, 0.46) 0%, rgba(255, 79, 168, 0.40) 100%) !important;
  border: 1px solid rgba(255, 235, 195, 0.82) !important;
  border-bottom: 3px solid var(--tok-keyword) !important;
  border-radius: 6px;
  padding: 0.02em 0.2em;
  margin: 0 0.04em;
  box-shadow: 0 0 calc(20px * var(--ide-glow-mult, 1)) rgba(255, 153, 34, 0.48), 0 4px 12px rgba(0, 0, 0, 0.7);
  text-shadow:
    0 0 calc(10px * var(--ide-glow-mult, 1)) #ffffff,
    0 0 calc(20px * var(--ide-glow-mult, 1)) var(--tok-keyword);
}

.cider-tok-keyword  { color: var(--tok-keyword); font-weight: 700; }
.cider-tok-method   { color: var(--tok-method); font-weight: 700; }
.cider-tok-property { color: var(--tok-property); font-weight: 600; }
.cider-tok-variable { color: var(--tok-variable); font-weight: 700; }
.cider-tok-arg      { color: var(--tok-arg); font-weight: 600; }
.cider-tok-bracket  { color: var(--tok-bracket); font-weight: 800; padding: 0 0.03em; text-shadow: 0 2px 8px rgba(0, 0, 0, 0.92); }
.cider-tok-operator { color: var(--tok-operator); font-weight: 800; padding: 0 0.08em; text-shadow: 0 2px 8px rgba(0, 0, 0, 0.92); }
.cider-tok-dot      { color: var(--tok-dot); font-weight: 900; padding: 0 0.015em; text-shadow: 0 2px 8px rgba(0, 0, 0, 0.95); }

.cider-ide-cursor {
  display: inline-block;
  position: relative;
  width: 0.24em;
  height: 1.05em;
  margin-left: 0.07em;
  margin-right: 0.03em;
  vertical-align: -0.15em;
  pointer-events: none;
  z-index: 10;
}

.cider-ide-cursor::after {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  width: 0.22em;
  height: 1.05em;
  background: linear-gradient(180deg, #ffffff 0%, var(--cursor-top) 45%, var(--cursor-mid) 100%);
  border-radius: 2px;
  box-shadow: 0 0 10px #ffffff, 0 0 calc(18px * var(--ide-glow-mult, 1)) var(--cursor-top), 0 0 calc(32px * var(--ide-glow-mult, 1)) var(--cursor-glow);
  animation: ciderIdeCursorPulse 0.5s ease-in-out infinite alternate;
}

@keyframes ciderIdeCursorPulse {
  0%   { opacity: 1; transform: scaleY(1); }
  100% { opacity: 0.72; transform: scaleY(0.95); }
}

#cider-ide-floating-pill {
  position: absolute;
  top: 18px;
  right: 22px;
  bottom: auto;
  z-index: 9995;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 12px;
  border-radius: 999px;
  background: rgba(12, 6, 22, 0.88);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: #fff;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 11px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.65);
  box-sizing: border-box;
  max-width: calc(100% - 24px);
  overflow-x: auto;
  scrollbar-width: none;
  opacity: 0;
  transition: opacity 0.22s ease;
}

#cider-ide-floating-pill:hover,
#cider-ide-floating-pill:focus-within,
#cider-ide-floating-pill.is-disabled {
  opacity: 1;
}

#cider-ide-floating-pill.is-fullscreen {
  position: fixed;
  z-index: 9995;
}

#cider-ide-floating-pill.is-disabled {
  background: rgba(12, 6, 22, 0.92);
  border-color: rgba(255, 79, 168, 0.35);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);
}

#cider-ide-floating-pill .cider-pill-title,
#cider-ide-floating-pill.is-disabled .cider-pill-title,
#cider-ide-floating-pill.is-disabled button:not([data-act="toggle-enable"]) {
  display: none !important;
}

#cider-ide-floating-pill.is-disabled button[data-act="toggle-enable"] {
  background: rgba(255, 79, 168, 0.16);
  border-color: rgba(255, 79, 168, 0.4);
  color: #ff99cc;
  font-weight: 600;
  cursor: pointer;
}

#cider-ide-floating-pill.is-disabled button[data-act="toggle-enable"]:hover {
  background: rgba(255, 79, 168, 0.38);
  border-color: rgba(255, 120, 190, 0.7);
  color: #ffffff;
}

#cider-ide-floating-pill::-webkit-scrollbar {
  display: none;
}

.pill-short-label {
  display: none;
}

.pill-long-label {
  display: inline;
}

#cider-ide-floating-pill button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: rgba(255, 255, 255, 0.92);
  padding: 3px 9px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 11px;
  font-family: var(--ide-font-stack);
  transition: background 0.2s, border-color 0.2s, color 0.2s;
}

#cider-ide-floating-pill button:hover {
  background: rgba(255, 79, 168, 0.35);
  color: #ffffff;
}

#cider-ide-floating-pill button.is-on {
  background: linear-gradient(135deg, rgba(255, 79, 168, 0.52) 0%, rgba(255, 153, 34, 0.42) 100%);
  border-color: rgba(255, 232, 214, 0.78);
  color: #ffffff !important;
  font-weight: 700;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.7);
}

#cider-ide-player-dock {
  position: absolute;
  bottom: 18px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 25;
  width: min(96%, 1120px);
  box-sizing: border-box;
  margin: 0;
  background: rgba(11, 6, 20, 0.88);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 16px;
  padding: 10px 16px;
  box-shadow: 0 14px 38px rgba(0, 0, 0, 0.78), 0 0 24px rgba(255, 79, 168, 0.12);
  color: #f8f4ff;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: opacity 0.25s ease, transform 0.25s ease, padding 0.2s ease;
}

#cider-ide-visualizer-root.is-fullscreen #cider-ide-player-dock {
  bottom: 24px;
}

#cider-ide-player-dock.is-minimized {
  width: min(96%, 1020px);
  padding: 6px 14px;
  border-radius: 999px;
}

#cider-ide-player-dock.is-minimized .cider-dock-scrubber-row,
#cider-ide-player-dock.is-minimized .cider-dock-vol-slider,
#cider-ide-player-dock.is-minimized .cider-dock-btn[data-act="mute"] {
  display: none !important;
}

.cider-dock-scrubber-row {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
}

.cider-dock-time {
  font-family: var(--ide-font-stack);
  font-size: 11px;
  color: rgba(255, 232, 214, 0.85);
  min-width: 36px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.cider-dock-time.is-current {
  color: var(--tok-keyword);
  font-weight: 700;
}

.cider-dock-slider {
  -webkit-appearance: none;
  appearance: none;
  flex: 1;
  height: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  outline: none;
  cursor: pointer;
  transition: height 0.15s ease;
}

.cider-dock-slider:hover {
  height: 8px;
}

.cider-dock-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid var(--tok-method);
  box-shadow: 0 0 10px var(--tok-method), 0 0 4px var(--tok-keyword);
  cursor: pointer;
}

.cider-dock-main-row {
  display: grid;
  grid-template-columns: minmax(120px, 1fr) auto minmax(120px, 1fr);
  align-items: center;
  gap: 12px;
  width: 100%;
}

.cider-dock-track {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  justify-self: start;
  padding-right: 6px;
}

.cider-dock-art {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.cider-dock-meta {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.cider-dock-title {
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.cider-dock-artist {
  font-size: 10.5px;
  color: rgba(255, 255, 255, 0.68);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.cider-dock-transport {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  justify-self: center;
  flex-shrink: 0;
}

.cider-dock-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: rgba(255, 255, 255, 0.94);
  height: 30px;
  min-width: auto;
  padding: 0 8px;
  border-radius: 9px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 11px;
  font-family: var(--ide-font-stack);
  cursor: pointer;
  white-space: nowrap !important;
  flex-shrink: 0 !important;
  transition: background 0.18s ease, transform 0.12s ease, border-color 0.18s ease, color 0.18s ease;
}

.cider-dock-btn:hover {
  background: rgba(255, 79, 168, 0.32);
  border-color: rgba(255, 153, 34, 0.65);
  color: #fff;
  transform: translateY(-1px);
}

.cider-dock-btn:active {
  transform: translateY(0) scale(0.96);
}

.cider-dock-btn.is-active {
  background: linear-gradient(135deg, rgba(255, 79, 168, 0.5) 0%, rgba(255, 153, 34, 0.4) 100%);
  border-color: rgba(255, 232, 214, 0.78);
  color: #ffffff !important;
  font-weight: 700;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.75);
}

.cider-dock-btn.is-play {
  height: 34px;
  min-width: 64px;
  padding: 0 12px;
  border-radius: 11px;
  font-weight: 700;
  color: #fff !important;
  background: linear-gradient(135deg, var(--tok-keyword) 0%, var(--tok-method) 100%);
  border: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 4px 16px rgba(255, 79, 168, 0.4);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.65);
}

.cider-dock-btn.is-play:hover {
  filter: brightness(1.1);
}

.cider-dock-extra-controls {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  justify-self: end;
  min-width: 0;
  max-width: 100%;
  white-space: nowrap;
  flex-shrink: 0;
}

.cider-dock-extra-controls .cider-dock-btn {
  height: 28px;
  padding: 0 6px;
  font-size: 11px;
  white-space: nowrap !important;
  flex-shrink: 0 !important;
  min-width: auto !important;
}

.cider-dock-vol-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 48px;
  height: 5px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  outline: none;
  cursor: pointer;
  flex-shrink: 1;
  min-width: 32px;
}

.cider-dock-vol-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: var(--tok-keyword);
  cursor: pointer;
}

#cider-ide-visualizer-root.is-medium-dock .cider-dock-extra-controls .cider-dock-btn[data-act="cycle-style"],
#cider-ide-visualizer-root.is-medium-dock .cider-dock-extra-controls .cider-dock-btn[data-act="toggle-theme"] {
  display: none !important;
}

#cider-ide-visualizer-root.is-fullscreen .cider-dock-extra-controls .cider-dock-btn[data-act="fullscreen"],
#cider-ide-visualizer-root.is-fullscreen .cider-dock-extra-controls .cider-dock-btn[data-act="toggle-cover"],
#cider-ide-visualizer-root.has-cover-showcase .cider-dock-scrubber-row,
#cider-ide-visualizer-root.has-cover-showcase .cider-dock-track,
#cider-ide-visualizer-root.has-cover-showcase .cider-dock-transport button[data-act="shuffle"],
#cider-ide-visualizer-root.has-cover-showcase .cider-dock-transport button[data-act="prev-track"],
#cider-ide-visualizer-root.has-cover-showcase .cider-dock-transport button[data-act="play-pause"],
#cider-ide-visualizer-root.has-cover-showcase .cider-dock-transport button[data-act="next-track"],
#cider-ide-visualizer-root.has-cover-showcase .cider-dock-transport button[data-act="repeat"],
#cider-ide-visualizer-root.has-cover-showcase .cider-dock-extra-controls .cider-dock-btn[data-act="fullscreen"],
#cider-ide-visualizer-root.has-cover-showcase .cider-dock-extra-controls .cider-dock-btn[data-act="toggle-cover"],
#cider-ide-visualizer-root.has-cover-showcase .cider-dock-extra-controls .cider-dock-btn[data-act="cycle-style"],
#cider-ide-visualizer-root.has-cover-showcase .cider-dock-extra-controls .cider-dock-btn[data-act="toggle-theme"] {
  display: none !important;
}

#cider-ide-visualizer-root.has-cover-showcase #cider-ide-player-dock {
  display: none !important;
}

#cider-ide-visualizer-root:not(.is-fullscreen):not(.force-dock) #cider-ide-player-dock {
  display: none !important;
}

#cider-ide-visualizer-root:not(.is-fullscreen) .cider-ide-stage {
  padding-bottom: 20px;
}

#cider-ide-visualizer-root:not(.is-fullscreen) .cider-ide-plane {
  padding-bottom: 24px;
}

#cider-ide-visualizer-root.is-compact .pill-short-label,
#cider-ide-floating-pill.is-compact .pill-short-label {
  display: inline !important;
}

#cider-ide-visualizer-root.is-compact .pill-long-label,
#cider-ide-floating-pill.is-compact .pill-long-label {
  display: none !important;
}

#cider-ide-visualizer-root.is-compact #cider-ide-floating-pill,
#cider-ide-floating-pill.is-compact {
  top: 8px;
  right: 8px;
  gap: 3px;
  padding: 2px 5px;
  max-width: calc(100% - 16px);
}

#cider-ide-visualizer-root.is-compact #cider-ide-floating-pill .cider-pill-title,
#cider-ide-floating-pill.is-compact .cider-pill-title {
  display: none !important;
}

#cider-ide-visualizer-root.is-compact #cider-ide-floating-pill button,
#cider-ide-floating-pill.is-compact button {
  padding: 2px 4px;
  font-size: 9px;
  white-space: nowrap;
}

#cider-ide-visualizer-root.is-compact #cider-ide-floating-pill button[data-act="toggle-settings"] .pill-long-label,
#cider-ide-floating-pill.is-compact button[data-act="toggle-settings"] .pill-long-label {
  display: none !important;
}

#cider-ide-visualizer-root.is-compact #cider-ide-floating-pill button[data-act="toggle-settings"] .pill-short-label,
#cider-ide-floating-pill.is-compact button[data-act="toggle-settings"] .pill-short-label {
  display: inline !important;
}

#cider-ide-visualizer-root.is-compact #cider-ide-floating-pill button[data-act="toggle-focus"],
#cider-ide-floating-pill.is-compact button[data-act="toggle-focus"],
#cider-ide-visualizer-root.is-compact #cider-ide-floating-pill button[data-act="toggle-lock"],
#cider-ide-floating-pill.is-compact button[data-act="toggle-lock"],
#cider-ide-visualizer-root.is-compact #cider-ide-floating-pill button[data-act="toggle-cover"],
#cider-ide-floating-pill.is-compact button[data-act="toggle-cover"] {
  display: none !important;
}

#cider-ide-visualizer-root.is-compact .cider-ide-stage {
  padding-bottom: 20px;
  perspective: none !important;
  transform: none !important;
}

#cider-ide-visualizer-root.is-compact #cider-ide-wave-canvas {
  display: none !important;
}

#cider-ide-visualizer-root.is-compact .cider-ide-plane {
  width: 100% !important;
  max-width: 100% !important;
  padding-left: 10px !important;
  padding-right: 10px !important;
  padding-bottom: 24px;
  transform-style: flat !important;
}

#cider-ide-visualizer-root.is-compact .cider-ide-line {
  display: flex !important;
  align-items: baseline !important;
  width: 100% !important;
  max-width: 100% !important;
  white-space: normal !important;
  padding: 4px 8px !important;
  margin-bottom: 4px !important;
  line-height: 1.42 !important;
  border-radius: 4px !important;
  border-left: 3px solid transparent !important;
  background: transparent !important;
  box-shadow: none !important;
  transform: none !important;
  filter: none !important;
}

#cider-ide-visualizer-root.is-compact .cider-ide-line.is-active-line {
  opacity: 1 !important;
  background: rgba(255, 255, 255, 0.08) !important;
  border-left: 3px solid var(--tok-keyword) !important;
  box-shadow: none !important;
  transform: none !important;
  filter: none !important;
}

#cider-ide-visualizer-root.is-compact .cider-ide-line.is-past-line {
  opacity: 0.42 !important;
  filter: none !important;
  background: transparent !important;
}

#cider-ide-visualizer-root.is-compact:not(.is-active-line-only) .cider-ide-line.is-past-line.is-near-1 {
  opacity: 0.56 !important;
}

#cider-ide-visualizer-root.is-compact:not(.is-active-line-only) .cider-ide-line.is-past-line.is-near-2 {
  opacity: 0.38 !important;
}

#cider-ide-visualizer-root.is-compact:not(.is-active-line-only) .cider-ide-line.is-past-line.is-far-line {
  opacity: 0.24 !important;
}

#cider-ide-visualizer-root.is-compact .cider-line-gutter {
  width: 1.4em !important;
  margin-right: 0.35em !important;
  font-size: 0.6em !important;
  color: rgba(255, 255, 255, 0.35) !important;
  text-shadow: none !important;
}

#cider-ide-visualizer-root.is-compact .cider-ide-line.is-active-line .cider-line-gutter {
  color: var(--tok-keyword) !important;
  font-weight: 700 !important;
  text-shadow: none !important;
}

#cider-ide-visualizer-root.is-compact .cider-line-tokens {
  display: inline-flex !important;
  flex-wrap: wrap !important;
  row-gap: 2px !important;
  column-gap: 1px !important;
  width: 100% !important;
}

#cider-ide-visualizer-root.is-compact .cider-word-cluster {
  display: inline-flex !important;
  flex-wrap: wrap !important;
  white-space: normal !important;
}

#cider-ide-visualizer-root.is-compact .cider-code-token {
  display: inline-block !important;
  transform: none !important;
  animation: none !important;
  box-shadow: none !important;
}

#cider-ide-visualizer-root.is-compact .cider-code-token.is-lyric-word .cider-tok-typed {
  padding: 0 1px !important;
  margin: 0 !important;
  border-radius: 2px !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  text-shadow: none !important;
}

#cider-ide-visualizer-root.is-compact .cider-code-token.spoken-word .cider-tok-typed {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

#cider-ide-visualizer-root.is-compact .cider-code-token.active-word {
  transform: none !important;
  animation: none !important;
}

#cider-ide-visualizer-root.is-compact .cider-code-token.active-word.is-word-bounce {
  animation: none !important;
}

#cider-ide-visualizer-root.is-compact .cider-code-token.active-word .cider-tok-typed {
  color: #ffffff !important;
  background: transparent !important;
  border: none !important;
  border-bottom: 2px solid var(--tok-keyword) !important;
  box-shadow: none !important;
  text-shadow: none !important;
  font-weight: 700 !important;
  padding: 0 1px !important;
}

#cider-ide-visualizer-root.is-compact .cider-tok-operator {
  padding: 0 0.02em !important;
  text-shadow: none !important;
}

#cider-ide-visualizer-root.is-compact .cider-tok-bracket {
  padding: 0 0.01em !important;
  text-shadow: none !important;
}

#cider-ide-visualizer-root.is-compact .cider-tok-dot {
  padding: 0 0.01em !important;
  text-shadow: none !important;
}

#cider-ide-visualizer-root.is-compact .cider-line-time-badge {
  font-size: 0.32em;
  padding: 0.04em 0.3em;
  margin-left: 0.35em;
}

#cider-ide-visualizer-root.is-compact #cider-ide-cover-showcase {
  display: none !important;
}

#cider-ide-visualizer-root.is-compact.force-dock #cider-ide-player-dock {
  display: flex !important;
  bottom: 56px;
  width: calc(100% - 16px);
  padding: 5px 8px;
  gap: 4px;
  box-sizing: border-box;
}

#cider-ide-visualizer-root.is-compact.force-dock .cider-dock-main-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 5px;
  width: 100%;
}

#cider-ide-visualizer-root.is-compact.force-dock .cider-dock-art,
#cider-ide-visualizer-root.is-compact.force-dock .cider-dock-vol-slider,
#cider-ide-visualizer-root.is-compact.force-dock .cider-dock-btn[data-act="mute"] {
  display: none !important;
}

#cider-ide-cover-showcase {
  position: absolute;
  left: clamp(28px, 4.8vw, 76px);
  top: 50%;
  transform: translateY(-50%);
  z-index: 18;
  width: clamp(240px, 24vw, 360px);
  max-height: 94vh;
  box-sizing: border-box;
  display: none;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
  pointer-events: auto;
  animation: ciderCoverFadeIn 0.35s cubic-bezier(0.2, 0.9, 0.3, 1);
  overflow-y: auto;
  scrollbar-width: none;
}

#cider-ide-cover-showcase::-webkit-scrollbar {
  display: none;
}

@keyframes ciderCoverFadeIn {
  from { opacity: 0; transform: translateY(-46%) scale(0.94); }
  to   { opacity: 1; transform: translateY(-50%) scale(1); }
}

#cider-ide-visualizer-root.has-cover-showcase #cider-ide-cover-showcase {
  display: flex;
}

#cider-ide-visualizer-root.has-cover-showcase .cider-ide-stage {
  padding-left: clamp(280px, 28vw, 420px);
}

#cider-ide-visualizer-root.has-cover-showcase .cider-ide-plane {
  width: 98%;
  max-width: 1360px;
  padding-left: 2%;
  padding-right: 3%;
}

.cider-cover-art-frame {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 22px;
  overflow: hidden;
  border: 1.5px solid rgba(255, 255, 255, 0.22);
  background: rgba(15, 8, 28, 0.75);
  box-shadow:
    0 26px 65px rgba(0, 0, 0, 0.85),
    0 0 42px rgba(255, 79, 168, 0.25),
    0 0 18px rgba(255, 153, 34, 0.2);
  cursor: pointer;
  transition: transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease;
}

.cider-cover-art-frame:hover {
  transform: translateY(-4px) scale(1.02);
  border-color: var(--tok-keyword);
  box-shadow:
    0 30px 75px rgba(0, 0, 0, 0.9),
    0 0 55px var(--tok-method),
    0 0 24px var(--tok-keyword);
}

.cider-cover-art-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.cider-cover-art-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0.15) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  font-family: var(--ide-font-stack);
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.05em;
}

.cider-cover-art-frame:hover .cider-cover-art-overlay {
  opacity: 1;
}

.cider-cover-showcase-meta {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 0 4px;
}

.cider-cover-meta-left {
  flex: 1;
  min-width: 0;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cider-cover-meta-right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.cider-cover-btn-icon {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cider-cover-btn-icon:hover {
  background: rgba(255, 79, 168, 0.35);
  border-color: var(--tok-keyword);
  transform: scale(1.08);
}

.cider-cover-btn-icon.is-active {
  background: var(--tok-keyword);
  color: #111;
}

.cider-cover-showcase-title {
  font-size: clamp(15px, 1.3vw, 20px);
  font-weight: 800;
  color: #ffffff;
  line-height: 1.25;
  text-shadow: 0 2px 14px rgba(0, 0, 0, 0.8);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.cider-cover-showcase-artist {
  font-size: clamp(12px, 1.05vw, 15px);
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.9);
}

.cider-cover-showcase-album {
  font-family: var(--ide-font-stack);
  font-size: 11px;
  color: rgba(255, 255, 255, 0.65);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.85);
}

.cider-cover-controls {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cider-cover-scrubber-wrap {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.cider-cover-scrubber {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 5px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
  outline: none;
  cursor: pointer;
  transition: height 0.15s ease;
}

.cider-cover-scrubber:hover {
  height: 7px;
}

.cider-cover-scrubber::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
  cursor: pointer;
}

.cider-cover-times {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.65);
  font-family: var(--ide-font-stack);
  font-variant-numeric: tabular-nums;
}

.cider-cover-main-transport {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 28px;
  width: 100%;
  padding: 2px 0;
}

.cider-cover-trans-btn {
  background: transparent;
  border: none;
  color: #fff;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border-radius: 50%;
  transition: transform 0.15s ease, opacity 0.15s ease, color 0.15s ease;
  opacity: 0.9;
}

.cider-cover-trans-btn:hover {
  opacity: 1;
  color: var(--tok-keyword);
  transform: scale(1.12);
}

.cider-cover-trans-btn:active {
  transform: scale(0.95);
}

.cider-cover-trans-btn.is-play-main {
  width: 52px;
  height: 52px;
  background: rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(8px);
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.5);
}

.cider-cover-trans-btn.is-play-main:hover {
  background: rgba(255, 255, 255, 0.28);
  border-color: var(--tok-keyword);
  transform: scale(1.08);
}

.cider-cover-sub-transport {
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 100%;
  padding-top: 6px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.cider-cover-sub-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: rgba(255, 255, 255, 0.85);
  border-radius: 10px;
  padding: 6px 12px;
  font-size: 11px;
  font-family: var(--ide-font-stack);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.18s ease;
}

.cider-cover-sub-btn:hover {
  background: rgba(255, 79, 168, 0.28);
  border-color: var(--tok-keyword);
  color: #fff;
}

.cider-cover-sub-btn.is-active {
  background: linear-gradient(135deg, rgba(255, 79, 168, 0.5) 0%, rgba(255, 153, 34, 0.4) 100%);
  border-color: rgba(255, 232, 214, 0.78);
  color: #fff;
  font-weight: 700;
}

.cider-rep-badge {
  font-size: 9px;
  font-weight: 800;
  background: var(--tok-keyword);
  color: #111;
  padding: 0 4px;
  border-radius: 4px;
  margin-left: 2px;
}

/* ==============================================================================
   VISUAL CUSTOMIZATION PANEL & SLIDERS
   ============================================================================== */
#cider-ide-settings-backdrop {
  position: absolute;
  inset: 0;
  z-index: 9998;
  background: rgba(4, 2, 8, 0.65);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  pointer-events: auto;
  transition: opacity 0.25s ease;
}

#cider-ide-settings-panel {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;
  width: min(92%, 460px);
  max-height: min(88vh, 620px);
  box-sizing: border-box;
  background: rgba(14, 8, 24, 0.96);
  backdrop-filter: blur(32px);
  -webkit-backdrop-filter: blur(32px);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 18px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.85), 0 0 32px rgba(255, 79, 168, 0.25);
  color: #fff;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  pointer-events: auto;
  user-select: none;
}

.cider-settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px 12px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.03);
}

.cider-settings-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cider-settings-icon {
  font-size: 16px;
}

.cider-settings-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.3px;
  color: #f8f4ff;
}

.cider-settings-close-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: rgba(255, 255, 255, 0.8);
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.15s ease, color 0.15s ease;
}

.cider-settings-close-btn:hover {
  background: rgba(255, 79, 168, 0.35);
  color: #fff;
}

.cider-settings-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.25) transparent;
}

.cider-settings-body::-webkit-scrollbar {
  width: 6px;
}

.cider-settings-body::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.25);
  border-radius: 999px;
}

.cider-settings-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cider-settings-section-title {
  font-size: 11.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--tok-keyword);
  display: flex;
  align-items: center;
  gap: 6px;
}

.cider-settings-row {
  display: flex;
  flex-direction: column;
  gap: 5px;
  background: rgba(255, 255, 255, 0.04);
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: background 0.15s ease, border-color 0.15s ease;
}

.cider-settings-row:hover {
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(255, 255, 255, 0.12);
}

.cider-settings-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cider-settings-label-row label {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.cider-settings-badge {
  font-family: var(--ide-font-stack);
  font-size: 11px;
  font-weight: 700;
  color: var(--tok-method);
  background: rgba(255, 79, 168, 0.12);
  border: 1px solid rgba(255, 79, 168, 0.25);
  padding: 1px 7px;
  border-radius: 6px;
  min-width: 42px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.cider-settings-toggle-btn {
  font-family: var(--ide-font-stack);
  font-size: 11px;
  font-weight: 700;
  padding: 3px 12px;
  border-radius: 999px;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.75);
  transition: all 0.16s ease;
}

.cider-settings-toggle-btn.is-on {
  background: linear-gradient(135deg, rgba(255, 153, 34, 0.5) 0%, rgba(255, 79, 168, 0.5) 100%);
  border-color: rgba(255, 235, 195, 0.85);
  color: #ffffff;
  box-shadow: 0 0 10px rgba(255, 153, 34, 0.4);
}

.cider-settings-toggle-btn:hover {
  filter: brightness(1.15);
}

.cider-settings-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 5px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  outline: none;
  cursor: pointer;
  transition: height 0.15s ease;
}

.cider-settings-slider:hover {
  height: 7px;
}

.cider-settings-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: #ffffff;
  border: 2px solid var(--tok-keyword);
  box-shadow: 0 0 10px var(--tok-keyword), 0 0 4px var(--tok-method);
  cursor: pointer;
  transition: transform 0.12s ease;
}

.cider-settings-slider::-webkit-slider-thumb:hover {
  transform: scale(1.18);
}

.cider-settings-slider::-moz-range-thumb {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: #ffffff;
  border: 2px solid var(--tok-keyword);
  box-shadow: 0 0 10px var(--tok-keyword);
  cursor: pointer;
}

.cider-settings-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 18px 14px 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.03);
  gap: 10px;
  flex-wrap: wrap;
}

.cider-settings-btn {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 11.5px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.18s ease;
}

.cider-settings-reset-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: rgba(255, 255, 255, 0.85);
}

.cider-settings-reset-btn:hover {
  background: rgba(255, 79, 168, 0.25);
  border-color: rgba(255, 79, 168, 0.5);
  color: #fff;
}

.cider-settings-done-btn {
  background: linear-gradient(135deg, var(--tok-keyword) 0%, var(--tok-method) 100%);
  border: 1px solid rgba(255, 255, 255, 0.35);
  color: #fff;
  font-weight: 700;
  box-shadow: 0 4px 14px rgba(255, 79, 168, 0.35);
}

.cider-settings-done-btn:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

/* Customizable Keybinds Styles */
.cider-keybinds-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-top: 4px;
}

.cider-keybind-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  font-size: 11.5px;
}

.cider-keybind-action {
  color: rgba(255, 255, 255, 0.88);
  font-weight: 500;
}

.cider-keybind-badge {
  background: rgba(255, 255, 255, 0.09);
  border: 1px solid rgba(255, 255, 255, 0.22);
  color: var(--tok-method);
  font-family: var(--ide-font-stack);
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  min-width: 68px;
  text-align: center;
  transition: all 0.2s ease;
}

.cider-keybind-badge:hover {
  background: rgba(255, 79, 168, 0.28);
  border-color: var(--tok-keyword);
  color: #fff;
  transform: translateY(-1px);
}

.cider-keybind-badge.is-recording {
  background: var(--tok-keyword) !important;
  color: #0b0813 !important;
  border-color: #ffffff !important;
  animation: keybindPulse 0.8s infinite alternate;
  font-weight: 800;
}

@keyframes keybindPulse {
  0% { box-shadow: 0 0 4px var(--tok-keyword); }
  100% { box-shadow: 0 0 16px var(--tok-keyword), 0 0 24px rgba(255, 79, 168, 0.6); }
}

#cider-ide-visualizer-root.is-compact #cider-ide-settings-panel {
  width: 95%;
  max-height: 92vh;
  border-radius: 14px;
}
#cider-ide-visualizer-root.is-compact #cider-ide-settings-panel .cider-settings-header {
  padding: 10px 12px 8px 12px;
}
#cider-ide-visualizer-root.is-compact #cider-ide-settings-panel .cider-settings-title {
  font-size: 12.5px;
}
#cider-ide-visualizer-root.is-compact #cider-ide-settings-panel .cider-settings-body {
  padding: 8px 10px;
  gap: 10px;
}
#cider-ide-visualizer-root.is-compact #cider-ide-settings-panel .cider-settings-row {
  padding: 6px 8px;
  gap: 4px;
}
#cider-ide-visualizer-root.is-compact #cider-ide-settings-panel .cider-settings-label-row label {
  font-size: 11px;
}
#cider-ide-visualizer-root.is-compact #cider-ide-settings-panel .cider-settings-badge {
  font-size: 10px;
  padding: 1px 4px;
  min-width: 36px;
}
#cider-ide-visualizer-root.is-compact #cider-ide-settings-panel .cider-settings-footer {
  padding: 8px 10px 10px 10px;
  gap: 8px;
}
#cider-ide-visualizer-root.is-compact #cider-ide-settings-panel .cider-settings-btn {
  font-size: 10.5px;
  padding: 5px 10px;
}

@media (max-width: 480px) {
  #cider-ide-settings-panel {
    width: 95%;
    max-height: 92vh;
    border-radius: 14px;
  }
  #cider-ide-settings-panel .cider-settings-header {
    padding: 10px 12px 8px 12px;
  }
  #cider-ide-settings-panel .cider-settings-title {
    font-size: 12.5px;
  }
  #cider-ide-settings-panel .cider-settings-body {
    padding: 8px 10px;
    gap: 10px;
  }
  #cider-ide-settings-panel .cider-settings-row {
    padding: 6px 8px;
    gap: 4px;
  }
  #cider-ide-settings-panel .cider-settings-label-row label {
    font-size: 11px;
  }
  #cider-ide-settings-panel .cider-settings-badge {
    font-size: 10px;
    padding: 1px 4px;
    min-width: 36px;
  }
  #cider-ide-settings-panel .cider-settings-footer {
    padding: 8px 10px 10px 10px;
    gap: 8px;
  }
  #cider-ide-settings-panel .cider-settings-btn {
    font-size: 10.5px;
    padding: 5px 10px;
  }
}

/* ---------------------------------------------------------
   Screensaver & Ambient Lock Screen Controls & Overlay
   --------------------------------------------------------- */
.cider-settings-btn-group {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(0, 0, 0, 0.4);
  padding: 3px 4px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  flex-wrap: wrap;
}

.cider-group-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.65);
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.18s ease;
  outline: none;
}

.cider-group-btn:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.12);
}

.cider-group-btn.is-active {
  background: linear-gradient(135deg, var(--tok-keyword) 0%, var(--tok-method) 100%);
  color: #ffffff !important;
  font-weight: 700;
  box-shadow: 0 2px 10px rgba(255, 79, 168, 0.4);
}

/* Ambient Lock Screen Overlay */
#cider-ide-lock-overlay {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: clamp(24px, 5vh, 60px) 24px;
  box-sizing: border-box;
  background: radial-gradient(circle at 50% 30%, rgba(15, 10, 25, 0.58) 0%, rgba(5, 5, 10, 0.85) 100%);
  backdrop-filter: blur(28px) saturate(180%);
  -webkit-backdrop-filter: blur(28px) saturate(180%);
  color: #ffffff;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  user-select: none;
  cursor: pointer;
  animation: ciderLockFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes ciderLockFadeIn {
  from {
    opacity: 0;
    transform: scale(1.02);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.cider-lock-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 720px;
  height: 100%;
  text-align: center;
  pointer-events: none;
}

.cider-lock-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: clamp(10px, 3vh, 30px);
}

.cider-lock-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 14px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.85);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.cider-lock-clock {
  font-size: clamp(3.8rem, 9vw, 6.8rem);
  font-weight: 200;
  line-height: 1.05;
  letter-spacing: -2px;
  color: #ffffff;
  text-shadow: 0 4px 28px rgba(0, 0, 0, 0.6);
  font-variant-numeric: tabular-nums;
  margin-top: 6px;
}

.cider-lock-date {
  font-size: clamp(1.1rem, 2.2vw, 1.45rem);
  font-weight: 400;
  color: rgba(255, 255, 255, 0.78);
  letter-spacing: -0.3px;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
}

.cider-lock-track-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 20px;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  max-width: 460px;
  width: 90%;
  margin: auto 0;
  transition: transform 0.2s ease;
}

.cider-lock-art {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
  flex-shrink: 0;
}

.cider-lock-track-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  overflow: hidden;
  min-width: 0;
  flex: 1;
}

.cider-lock-track-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--tok-keyword, #ff4fa8);
  margin-bottom: 2px;
}

.cider-lock-pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--tok-keyword, #ff4fa8);
  box-shadow: 0 0 8px var(--tok-keyword, #ff4fa8);
  animation: ciderPulseDot 1.4s ease-in-out infinite alternate;
}

.cider-lock-pulse-dot.is-paused {
  animation: none !important;
  opacity: 0.35 !important;
}

@keyframes ciderPulseDot {
  0% { transform: scale(0.85); opacity: 0.6; }
  100% { transform: scale(1.3); opacity: 1; }
}

.cider-lock-track-title {
  font-size: clamp(14px, 1.4vw, 17px);
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.cider-lock-track-artist {
  font-size: clamp(11.5px, 1.1vw, 13.5px);
  color: rgba(255, 255, 255, 0.7);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  margin-top: 2px;
}

.cider-lock-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
  letter-spacing: 0.2px;
  margin-bottom: clamp(10px, 2vh, 20px);
}

@keyframes ciderLockBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

/* Clean Screensaver Mode & Minimal Screensaver Clock */
#cider-ide-screensaver-clock {
  position: fixed;
  bottom: 24px;
  left: 28px;
  z-index: 9999;
  font-family: var(--ide-font-stack, monospace);
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.45);
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 6px 14px;
  border-radius: 999px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  letter-spacing: 0.5px;
  pointer-events: none;
  animation: ciderLockFadeIn 0.4s ease forwards;
}

body.cider-ide-screensaver-active #cider-ide-floating-pill,
body.cider-ide-screensaver-active #cider-ide-player-dock,
body.cider-ide-screensaver-active #cider-ide-cover-showcase,
body.cider-ide-screensaver-active #cider-ide-settings-panel,
body.cider-ide-screensaver-active #cider-ide-settings-backdrop,
#cider-ide-visualizer-root.is-screensaver-active #cider-ide-floating-pill,
#cider-ide-visualizer-root.is-screensaver-active #cider-ide-player-dock,
#cider-ide-visualizer-root.is-screensaver-active #cider-ide-cover-showcase,
#cider-ide-visualizer-root.is-screensaver-active #cider-ide-settings-panel,
#cider-ide-visualizer-root.is-screensaver-active #cider-ide-settings-backdrop {
  display: none !important;
  opacity: 0 !important;
  pointer-events: none !important;
}

/* =====================================================================
   RTL (Right-to-Left) Script Support: Persian, Arabic, Hebrew, Urdu
   ===================================================================== */
.cider-ide-plane.is-rtl,
.cider-ide-line.is-rtl {
  direction: rtl;
  text-align: right;
}

.cider-ide-line.is-rtl {
  flex-direction: row;
  justify-content: flex-start;
}

.cider-ide-line.is-rtl .cider-line-gutter {
  margin-left: 0.65em;
  margin-right: 0;
  text-align: left;
  border-right: none;
  border-left: 2px solid rgba(255, 255, 255, 0.12);
  padding-right: 0;
  padding-left: 0.35em;
}

.cider-ide-line.is-rtl .cider-line-tokens {
  direction: rtl;
  text-align: right;
}

.cider-ide-line.is-rtl .cider-word-cluster {
  direction: rtl;
  text-align: right;
}

.cider-ide-line.is-rtl.is-active-line {
  border-left: none;
  border-right: 4px solid var(--tok-keyword);
}

.cider-ide-line.is-rtl .cider-ide-cursor {
  margin-left: 0.12em;
  margin-right: 0.04em;
}

/* L1: Multi-Language Inline Code Comments */
.cider-ide-line-comment,
.code-comment {
  flex: 1 0 100%;
  width: 100%;
  font-size: 0.62em;
  line-height: 1.35;
  color: var(--tok-comment, #7c699e);
  font-style: italic;
  opacity: 0.78;
  margin-top: 0.14em;
  white-space: normal;
  word-break: break-word;
  pointer-events: none;
  user-select: none;
}

.cider-ide-line.is-active-line .cider-ide-line-comment,
.cider-ide-line.is-active-line .code-comment {
  opacity: 0.92;
}

.cider-ide-line.is-rtl .cider-ide-line-comment,
.cider-ide-line.is-rtl .code-comment {
  direction: rtl;
  text-align: right;
}

/* Adlib Separation (Separate / Hide / Inline) */
.cider-ide-line-adlib {
  flex: 1 0 100%;
  width: 100%;
  font-size: 0.58em;
  line-height: 1.3;
  color: var(--tok-comment, #8c7db0);
  font-style: italic;
  opacity: 0.68;
  margin-top: 0.14em;
  padding-left: 0.85em;
  letter-spacing: 0.02em;
  white-space: normal;
  word-break: break-word;
  pointer-events: none;
  user-select: none;
}

.cider-ide-line.is-active-line .cider-ide-line-adlib {
  opacity: 0.86;
  color: color-mix(in srgb, var(--tok-keyword, #7dcfff) 55%, var(--tok-comment, #8c7db0));
}

.cider-ide-line.is-rtl .cider-ide-line-adlib {
  direction: rtl;
  text-align: right;
  padding-left: 0;
  padding-right: 0.85em;
}

.cider-ide-line.is-adlib-only-line .cider-line-tokens {
  font-size: 0.78em;
  font-style: italic;
  opacity: 0.78;
  color: var(--tok-comment, #8c7db0);
}

.cider-ide-line.is-adlib-only-line .cider-line-tokens::before {
  content: "// ";
  color: var(--tok-comment, #8c7db0);
  margin-right: 0.2em;
}

.cider-ide-line.is-adlib-hidden {
  opacity: 0 !important;
  visibility: hidden !important;
  pointer-events: none !important;
}

/* L2: Smart Instrumental Interlude Countdown */
.cider-ide-interlude {
  position: absolute;
  left: 50%;
  bottom: 112px;
  transform: translateX(-50%) translateY(8px);
  z-index: 6;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(9, 6, 20, 0.78);
  border: 1px solid rgba(125, 207, 255, 0.25);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(8px);
  opacity: 0;
  transition: opacity 0.28s ease, transform 0.28s ease;
}

.cider-ide-interlude.is-visible {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.cider-ide-interlude-label {
  display: none;
}

.cider-ide-interlude-track {
  width: min(460px, 68vw);
  height: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  overflow: hidden;
}

.cider-ide-interlude-fill {
  width: 0%;
  height: 100%;
  border-radius: 999px;
  background: var(--tok-keyword, #7dcfff);
  transition: width 0.08s linear;
}

/* Active Line Only mode */
#cider-ide-visualizer-root.is-active-line-only .cider-ide-line:not(.is-active-line),
#cider-ide-visualizer-root.is-active-line-only .cider-ide-line:not(.is-active-line):hover,
#cider-ide-visualizer-root.is-compact.is-active-line-only .cider-ide-line:not(.is-active-line),
#cider-ide-visualizer-root.is-compact.is-active-line-only .cider-ide-line:not(.is-active-line):hover {
  opacity: 0 !important;
  visibility: hidden !important;
  pointer-events: none !important;
  transition: none !important;
}

/* Fullscreen Idle Cursor & Pill Auto-Hide */
#cider-ide-visualizer-root.is-fullscreen.is-cursor-idle,
#cider-ide-visualizer-root.is-fullscreen.is-cursor-idle * {
  cursor: none !important;
}

#cider-ide-floating-pill.is-fullscreen {
  transition: opacity 0.25s ease;
}

#cider-ide-floating-pill.is-fullscreen.is-cursor-idle {
  opacity: 0 !important;
  pointer-events: none !important;
}

/* Quick Sync Nudge HUD Pill */
.cider-ide-sync-hud {
  position: absolute;
  top: 22px;
  left: 50%;
  transform: translateX(-50%) translateY(-6px);
  z-index: 9996;
  pointer-events: none;
  padding: 5px 12px;
  border-radius: 999px;
  background: rgba(12, 8, 24, 0.85);
  border: 1px solid rgba(125, 207, 255, 0.35);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(8px);
  font-family: var(--ide-font-stack, monospace);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.03em;
  color: var(--tok-keyword, #7dcfff);
  opacity: 0;
  transition: opacity 0.2s ease, transform 0.2s ease;
  white-space: nowrap;
}

.cider-ide-sync-hud.is-visible {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

/* Minimal Stage Progress Hairline */
.cider-ide-progress-hairline {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 2px;
  width: 0%;
  z-index: 8;
  pointer-events: none;
  background: linear-gradient(90deg, var(--tok-keyword, #ff4fa8), var(--tok-method, #ff9933));
  opacity: 0.65;
  transition: width 0.12s linear;
}
/* === Edit Studio & Immersion === */

/* Hide Clean Feed pill button in narrow compact mode so 220px/251px pills stay 0px overflow */
#cider-ide-visualizer-root.is-compact #cider-ide-floating-pill button[data-act="toggle-clean-feed"],
#cider-ide-floating-pill.is-compact button[data-act="toggle-clean-feed"] {
  display: none !important;
}

/* Clean Feed / Edit Recording Mode */
#cider-ide-floating-pill.is-clean-feed {
  display: none !important;
}

#cider-ide-visualizer-root.is-clean-feed #cider-ide-player-dock,
#cider-ide-visualizer-root.is-clean-feed #cider-ide-cover-showcase,
#cider-ide-visualizer-root.is-clean-feed .cider-ide-progress-hairline,
#cider-ide-visualizer-root.is-clean-feed .cider-ide-interlude,
#cider-ide-visualizer-root.is-clean-feed .cider-ide-sync-hud,
#cider-ide-visualizer-root.is-clean-feed .cider-line-time-badge,
#cider-ide-visualizer-root.is-clean-feed #cider-ide-frame-guide {
  display: none !important;
}

#cider-ide-visualizer-root.is-clean-feed .cider-ide-stage {
  padding-left: 0 !important;
  padding-bottom: 0 !important;
  justify-content: center;
}

#cider-ide-visualizer-root.is-clean-feed .cider-ide-plane {
  padding-bottom: 0 !important;
}

#cider-ide-visualizer-root.is-clean-feed,
#cider-ide-visualizer-root.is-clean-feed * {
  cursor: none !important;
}

#cider-ide-visualizer-root.is-clean-feed #cider-ide-settings-panel,
#cider-ide-visualizer-root.is-clean-feed #cider-ide-settings-panel *,
#cider-ide-visualizer-root.is-clean-feed #cider-ide-settings-backdrop {
  cursor: auto !important;
}

#cider-ide-visualizer-root.is-clean-feed #cider-ide-settings-panel button,
#cider-ide-visualizer-root.is-clean-feed #cider-ide-settings-panel input[type="range"] {
  cursor: pointer !important;
}

#cider-ide-visualizer-root.is-clean-feed .cider-ide-line {
  pointer-events: none !important;
}

/* Backdrop & Chroma Key Presets */
.cider-ide-custom-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  display: none;
  background: #06030a;
}

#cider-ide-visualizer-root[data-backdrop="custom"].has-custom-bg .cider-ide-custom-bg {
  display: block;
}

.cider-ide-custom-bg-img,
.cider-ide-custom-bg-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: none;
  will-change: transform, filter, opacity;
}

#cider-ide-visualizer-root[data-backdrop="simple"] {
  background: radial-gradient(circle at 50% 42%, rgba(28, 22, 46, 0.96) 0%, #090612 68%, #040208 100%) !important;
}

#cider-ide-visualizer-root[data-backdrop="simple"] #cider-ide-wave-canvas,
#cider-ide-visualizer-root[data-backdrop="custom"] #cider-ide-wave-canvas {
  display: none !important;
}

#cider-ide-visualizer-root[data-backdrop="custom"] {
  background: #06030a !important;
}

.cider-custom-bg-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 6px;
}

.cider-custom-bg-url-row {
  display: flex;
  gap: 6px;
  align-items: center;
}

.cider-custom-bg-url-input {
  flex: 1;
  min-width: 0;
  background: rgba(0, 0, 0, 0.38);
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: #ffffff;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 11px;
  font-family: var(--ide-font-stack, monospace);
  outline: none;
}

.cider-custom-bg-url-input:focus {
  border-color: var(--tok-keyword, #7dcfff);
}

.cider-custom-bg-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.cider-custom-bg-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: #ffffff;
  font-size: 11px;
  padding: 5px 10px;
  border-radius: 8px;
  cursor: pointer;
}

.cider-custom-bg-btn:hover {
  background: rgba(255, 79, 168, 0.35);
  border-color: rgba(255, 120, 190, 0.6);
}

#cider-ide-visualizer-root.is-solid-backdrop {
  transition: none !important;
}

#cider-ide-visualizer-root[data-backdrop="black"] {
  background: #000000 !important;
  background-color: #000000 !important;
}

#cider-ide-visualizer-root[data-backdrop="green"] {
  background: #00ff00 !important;
  background-color: #00ff00 !important;
}

#cider-ide-visualizer-root[data-backdrop="blue"] {
  background: #0000ff !important;
  background-color: #0000ff !important;
}

#cider-ide-visualizer-root.is-solid-backdrop #cider-ide-wave-canvas,
#cider-ide-visualizer-root.is-solid-backdrop #cider-ide-vignette {
  display: none !important;
}

#cider-ide-visualizer-root[data-backdrop="black"] .cider-ide-line,
#cider-ide-visualizer-root[data-backdrop="black"] .cider-ide-line.is-active-line {
  background: transparent !important;
  box-shadow: none !important;
}

#cider-ide-visualizer-root[data-backdrop="green"] .cider-ide-line,
#cider-ide-visualizer-root[data-backdrop="green"] .cider-ide-line.is-active-line,
#cider-ide-visualizer-root[data-backdrop="blue"] .cider-ide-line,
#cider-ide-visualizer-root[data-backdrop="blue"] .cider-ide-line.is-active-line {
  background: transparent !important;
  box-shadow: none !important;
  filter: none !important;
  transition: none !important;
}

#cider-ide-visualizer-root[data-backdrop="green"] .cider-code-token,
#cider-ide-visualizer-root[data-backdrop="blue"] .cider-code-token,
#cider-ide-visualizer-root[data-backdrop="green"] .cider-code-token.active-word .cider-tok-typed,
#cider-ide-visualizer-root[data-backdrop="blue"] .cider-code-token.active-word .cider-tok-typed {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.85) !important;
  box-shadow: none !important;
  filter: none !important;
}

#cider-ide-visualizer-root[data-backdrop="green"] .cider-code-token.active-word .cider-tok-typed,
#cider-ide-visualizer-root[data-backdrop="blue"] .cider-code-token.active-word .cider-tok-typed {
  background: rgba(12, 12, 18, 0.86) !important;
}

#cider-ide-visualizer-root[data-backdrop="vignette"] #cider-ide-wave-canvas {
  opacity: 0.72;
}

#cider-ide-visualizer-root[data-backdrop="vignette"] #cider-ide-vignette {
  background: radial-gradient(
    ellipse at center,
    rgba(0, 0, 0, 0) 24%,
    rgba(2, 1, 6, 0.74) 76%,
    rgba(0, 0, 0, 0.96) 100%
  );
}

/* Edit Framing Guide & Responsive Line Clamping */
#cider-ide-frame-guide {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: var(--edit-frame-w);
  height: var(--edit-frame-h);
  border: 1px dashed rgba(255, 255, 255, 0.28);
  border-radius: 6px;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.32);
  pointer-events: none;
  z-index: 4;
  display: none;
  box-sizing: border-box;
}

#cider-ide-visualizer-root.has-frame-ratio.show-frame-guide:not(.is-clean-feed):not(.is-compact) #cider-ide-frame-guide {
  display: block;
}

#cider-ide-visualizer-root.is-solid-backdrop #cider-ide-frame-guide {
  box-shadow: none !important;
  border-color: rgba(255, 255, 255, 0.65);
}

.cider-frame-guide-label {
  position: absolute;
  top: 8px;
  right: 10px;
  font-family: var(--ide-font-stack);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.72);
  background: rgba(0, 0, 0, 0.5);
  padding: 2px 7px;
  border-radius: 4px;
  white-space: nowrap;
}

#cider-ide-visualizer-root.has-frame-ratio:not(.is-compact) .cider-ide-stage {
  padding-left: 0 !important;
  justify-content: center !important;
}

#cider-ide-visualizer-root.has-frame-ratio:not(.is-compact) .cider-ide-plane {
  width: min(94%, var(--edit-plane-max-w, 1320px)) !important;
  max-width: var(--edit-plane-max-w, 1320px) !important;
  padding-left: 16px !important;
  padding-right: 16px !important;
  box-sizing: border-box;
  margin: 0 auto;
}

/* Immersive Cinematic Polish (Auto-disabled in .is-compact & .is-solid-backdrop) */
#cider-ide-visualizer-root.is-cinematic-fx #cider-ide-vignette {
  transition: opacity 0.14s ease-out;
}

#cider-ide-visualizer-root.is-cinematic-fx .cider-ide-line.is-active-line {
  box-shadow:
    0 10px 32px rgba(0, 0, 0, 0.62),
    0 0 calc((24px + 18px * var(--cinematic-bass, 0)) * var(--ide-glow-mult, 1)) rgba(255, 79, 168, 0.22),
    inset 0 0 18px rgba(255, 255, 255, 0.05);
}

#cider-ide-visualizer-root.is-cinematic-fx .cider-code-token.active-word {
  transform: translate3d(0, calc(-1.5px - 1px * var(--cinematic-bass, 0)), 14px) scale(1.06);
}

#cider-ide-visualizer-root.is-cinematic-fx .cider-code-token.active-word .cider-tok-typed {
  box-shadow:
    0 0 calc((22px + 14px * var(--cinematic-bass, 0)) * var(--ide-glow-mult, 1)) var(--tok-keyword),
    0 0 calc((34px + 16px * var(--cinematic-bass, 0)) * var(--ide-glow-mult, 1)) var(--tok-method),
    0 4px 14px rgba(0, 0, 0, 0.68);
  text-shadow:
    0 0 calc((10px + 6px * var(--cinematic-bass, 0)) * var(--ide-glow-mult, 1)) #ffffff,
    0 0 calc((22px + 12px * var(--cinematic-bass, 0)) * var(--ide-glow-mult, 1)) var(--tok-keyword),
    0 0 calc((36px + 14px * var(--cinematic-bass, 0)) * var(--ide-glow-mult, 1)) var(--tok-method);
}

/* =====================================================================
   Depth-of-Field Lyric Cascade & Highlight Word Contrast
   ===================================================================== */
#cider-ide-visualizer-root:not(.is-active-line-only):not(.is-compact) .cider-ide-line.is-past-line.is-near-1 {
  opacity: 0.62 !important;
}

#cider-ide-visualizer-root:not(.is-active-line-only):not(.is-compact) .cider-ide-line.is-past-line.is-near-2 {
  opacity: 0.38 !important;
}

#cider-ide-visualizer-root:not(.is-active-line-only):not(.is-compact) .cider-ide-line.is-past-line.is-far-line {
  opacity: 0.22 !important;
}

#cider-ide-visualizer-root[data-backdrop="green"]:not(.is-active-line-only) .cider-ide-line.is-past-line.is-near-1,
#cider-ide-visualizer-root[data-backdrop="blue"]:not(.is-active-line-only) .cider-ide-line.is-past-line.is-near-1 {
  opacity: 0.74 !important;
  filter: none !important;
}

#cider-ide-visualizer-root[data-backdrop="green"]:not(.is-active-line-only) .cider-ide-line.is-past-line.is-near-2,
#cider-ide-visualizer-root[data-backdrop="blue"]:not(.is-active-line-only) .cider-ide-line.is-past-line.is-near-2 {
  opacity: 0.52 !important;
  filter: none !important;
}

#cider-ide-visualizer-root[data-backdrop="green"]:not(.is-active-line-only) .cider-ide-line.is-past-line.is-far-line,
#cider-ide-visualizer-root[data-backdrop="blue"]:not(.is-active-line-only) .cider-ide-line.is-past-line.is-far-line {
  opacity: 0.34 !important;
  filter: none !important;
}

#cider-ide-visualizer-root:not(.is-active-line-only) .cider-ide-line.is-past-line:hover {
  opacity: 1 !important;
  filter: none !important;
}

.cider-ide-plane:not(.is-typewriter) .cider-ide-line.is-active-line .cider-code-token.is-sung {
  opacity: 0.92 !important;
}

.cider-ide-plane:not(.is-typewriter) .cider-ide-line.is-active-line .cider-code-token.is-sung .cider-tok-typed {
  filter: brightness(0.95);
}

.cider-ide-plane:not(.is-typewriter) .cider-ide-line.is-active-line .cider-code-token.is-upcoming {
  opacity: 0.56 !important;
}

.cider-ide-plane:not(.is-typewriter) .cider-ide-line.is-active-line .cider-code-token.active-word {
  opacity: 1 !important;
}

/* =====================================================================
   Live Typewriter Mode (GPU clip-path Reveal + Smooth-Gliding IDE Caret)
   ===================================================================== */
.cider-ide-plane.is-typewriter .cider-ide-cursor {
  display: none !important;
}

.cider-ide-plane.is-typewriter .cider-ide-line.is-future-line {
  opacity: 0 !important;
  visibility: hidden !important;
  pointer-events: none !important;
}

.cider-ide-plane.is-typewriter .cider-code-token.is-untyped {
  opacity: 0 !important;
  visibility: hidden !important;
}

.cider-ide-plane.is-typewriter .cider-code-token.is-typing {
  clip-path: inset(0 calc(100% - var(--type-pct, 100%)) 0 0);
  will-change: clip-path;
  transform: none !important;
}

.cider-ide-plane.is-typewriter .cider-ide-line.is-rtl .cider-code-token.is-typing {
  clip-path: inset(0 0 0 calc(100% - var(--type-pct, 100%)));
}

.cider-ide-plane.is-typewriter .cider-code-token.is-typing .cider-tok-typed {
  color: #ffffff !important;
  background: transparent !important;
  border-color: transparent !important;
  border-bottom: 2px solid var(--tok-keyword) !important;
  box-shadow: none !important;
  text-shadow:
    0 0 calc(10px * var(--ide-glow-mult, 1)) #ffffff,
    0 0 calc(20px * var(--ide-glow-mult, 1)) var(--tok-keyword);
}

#cider-ide-visualizer-root[data-backdrop="green"] .cider-ide-plane.is-typewriter .cider-code-token.is-typing .cider-tok-typed,
#cider-ide-visualizer-root[data-backdrop="blue"] .cider-ide-plane.is-typewriter .cider-code-token.is-typing .cider-tok-typed {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.85) !important;
}

.cider-tw-caret {
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 1.12em;
  border-radius: 2px;
  background: linear-gradient(180deg, #ffffff 0%, var(--cursor-top, #ffaa22) 45%, var(--cursor-mid, #ff6a00) 100%);
  box-shadow:
    0 0 8px #ffffff,
    0 0 calc(14px * var(--ide-glow-mult, 1)) var(--cursor-top, #ffaa22),
    0 0 calc(24px * var(--ide-glow-mult, 1)) var(--cursor-glow, #ff6600);
  pointer-events: none;
  z-index: 11;
  display: none;
  will-change: transform, opacity;
  transition: transform 55ms linear;
  animation: ciderTwCaretBlink 0.85s steps(2, start) infinite;
}

.cider-tw-caret.is-typing-solid {
  animation: none !important;
  opacity: 1 !important;
}

.cider-ide-plane.is-typewriter .cider-ide-line.is-active-line .cider-tw-caret.is-visible {
  display: block;
}

#cider-ide-visualizer-root[data-backdrop="green"] .cider-tw-caret,
#cider-ide-visualizer-root[data-backdrop="blue"] .cider-tw-caret,
#cider-ide-visualizer-root.is-compact .cider-tw-caret {
  box-shadow: none !important;
}

@keyframes ciderTwCaretBlink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0.22; }
}

/* =====================================================================
   Settings Preset Export / Import & Toast Feedback
   ===================================================================== */
.cider-settings-footer-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.cider-settings-preset-btn {
  background: rgba(114, 229, 255, 0.1);
  border: 1px solid rgba(114, 229, 255, 0.28);
  color: rgba(235, 248, 255, 0.92);
  padding: 5px 11px;
  font-size: 11px;
}

.cider-settings-preset-btn:hover {
  background: rgba(114, 229, 255, 0.24);
  border-color: var(--tok-keyword);
  color: #ffffff;
}

.cider-preset-import-box {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 10px 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(8, 4, 16, 0.92);
}

.cider-preset-textarea {
  width: 100%;
  box-sizing: border-box;
  min-height: 68px;
  max-height: 140px;
  resize: vertical;
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 8px;
  padding: 7px 10px;
  color: #f4eeff;
  font-family: var(--ide-font-stack, monospace);
  font-size: 11px;
  line-height: 1.4;
  outline: none;
  user-select: text;
  -webkit-user-select: text;
}

.cider-preset-textarea:focus {
  border-color: var(--tok-keyword);
}

.cider-preset-import-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  flex-wrap: wrap;
}

.cider-settings-toast {
  position: absolute;
  left: 50%;
  bottom: 62px;
  transform: translateX(-50%) translateY(8px);
  z-index: 20;
  max-width: calc(100% - 32px);
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(16, 10, 30, 0.96);
  border: 1px solid rgba(114, 229, 255, 0.45);
  color: #ffffff;
  font-size: 11.5px;
  font-weight: 600;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.65);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease, transform 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cider-settings-toast.is-visible {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.cider-settings-toast.is-error {
  border-color: rgba(255, 92, 128, 0.72);
  color: #ffd5df;
}

.cider-settings-toast.is-success {
  border-color: rgba(142, 240, 184, 0.65);
  color: #dcffec;
}

#cider-ide-visualizer-root.is-clean-feed #cider-ide-settings-panel textarea {
  cursor: text !important;
}

#cider-ide-visualizer-root.is-compact #cider-ide-settings-panel .cider-preset-import-box {
  padding: 8px 10px;
}

#cider-ide-visualizer-root.is-compact #cider-ide-settings-panel .cider-settings-preset-btn {
  font-size: 10px;
  padding: 4px 8px;
}
`;

const DEFAULT_PALETTE = {
  bgCore: "#06030a",
  keyword: "#ffb444",
  method: "#ff6bb5",
  property: "#8ef0b8",
  variable: "#fff8f2",
  arg: "#d8cfff",
  bracket: "#ffd166",
  operator: "#72e5ff",
  dot: "#72e5ff",
  cursorTop: "#ffbe44",
  cursorMid: "#ff6a00",
  cursorBot: "#ff3d00",
  cursorGlow: "#ff7700",
  waves: [
    "rgba(255, 136, 34, 0.25)",
    "rgba(180, 38, 145, 0.28)",
    "rgba(28, 175, 200, 0.22)",
    "rgba(110, 32, 140, 0.24)",
    "rgba(235, 65, 130, 0.26)"
  ]
};

const VALID_BACKDROP_MODES = ["ambient", "simple", "custom", "vignette", "black", "green", "blue"];
const VALID_FRAME_RATIOS = ["off", "9:16", "16:9", "1:1"];
const EDIT_FRAME_RATIO_MAP = { "9:16": 9 / 16, "16:9": 16 / 9, "1:1": 1.0 };

function normalizeBackdropMode(mode) {
  return VALID_BACKDROP_MODES.includes(mode) ? mode : "ambient";
}

function normalizeFrameRatio(ratio) {
  return VALID_FRAME_RATIOS.includes(ratio) ? ratio : "off";
}

function normalizeRevealMode(mode) {
  return mode === "typewriter" ? "typewriter" : "highlight";
}

function isSolidBackdrop(mode) {
  return mode === "black" || mode === "green" || mode === "blue";
}

function isChromaBackdrop(mode) {
  return mode === "green" || mode === "blue";
}

const DEFAULT_VISUAL_SETTINGS = {
  rotX: 14,
  rotY: -12,
  rotZ: -4,
  fontSize: 40,
  lineSpacing: 1.0,
  tokenPadding: 4,
  lineGutter: 4,
  waveAmplitude: 1.15,
  dofStrength: 0.55,
  glowIntensity: 1.0,
  dynamicWordZoom: true,
  wordZoomScale: 1.25,
  wordTracking: true,
  wordTrackingMode: "stable",
  beatBounce: true,
  bounceIntensity: 1.2,
  idleMode: "lock",
  idleTimeout: 60,
  textDirection: "auto",
  annotationMode: "both",
  showBackgroundVocals: true,
  adlibMode: "separate",
  activeLineOnly: false,
  lyricRevealMode: "highlight",
  syncOffsetMs: 0,
  cleanFeed: false,
  backdropMode: "ambient",
  customBgUrl: "",
  customBgType: "image",
  customBgOpacity: 0.6,
  customBgBlur: 0,
  frameRatio: "off",
  showFrameGuide: true,
  cinematicFx: true
};

const DEFAULT_KEYBINDS = {
  toggleVisualizer: { name: "Toggle Lyrics Visualizer", label: "Ctrl + Alt + L", key: "l", code: "KeyL", ctrl: true, alt: true, shift: false, meta: false },
  toggleFullscreen: { name: "Toggle Fullscreen Mode", label: "Ctrl + Shift + L", key: "l", code: "KeyL", ctrl: true, alt: false, shift: true, meta: false },
  screensaverLock:  { name: "Lock Screen / Screensaver", label: "Ctrl + Alt + S", key: "s", code: "KeyS", ctrl: true, alt: true, shift: false, meta: false },
  toggleSettings:   { name: "Open / Close Settings", label: "S", key: "s", code: "KeyS", ctrl: false, alt: false, shift: false, meta: false },
  toggleCleanFeed:  { name: "Toggle Clean Feed (Edit Mode)", label: "E", key: "e", code: "KeyE", ctrl: false, alt: false, shift: false, meta: false },
  playPause:        { name: "Play / Pause", label: "Space", key: " ", code: "Space", ctrl: false, alt: false, shift: false, meta: false },
  nextTrack:        { name: "Next Track", label: "Shift + →", key: "arrowright", code: "ArrowRight", ctrl: false, alt: false, shift: true, meta: false },
  prevTrack:        { name: "Previous Track", label: "Shift + ←", key: "arrowleft", code: "ArrowLeft", ctrl: false, alt: false, shift: true, meta: false }
};

export class CiderIDELyricsEngine {
  constructor() {
    this.version = "2.3.0";
    let storedEnabled = true;
    try {
      const saved = localStorage.getItem("cider_ide_lyrics_enabled");
      if (saved !== null) {
        storedEnabled = saved === "true";
      }
    } catch (e) {}
    this.enabled = storedEnabled;
    this.isFullscreen = false;

    let storedVisuals = {};
    try {
      const savedVisuals = localStorage.getItem("cider_ide_lyrics_visual_settings");
      if (savedVisuals) {
        storedVisuals = JSON.parse(savedVisuals);
      }
    } catch (e) {}

    let storedRevealMode = null;
    try {
      const savedReveal = localStorage.getItem("cider_ide_reveal_mode");
      if (savedReveal === "typewriter" || savedReveal === "highlight") {
        storedRevealMode = savedReveal;
      }
    } catch (e) {}

    this.defaultVisualSettings = { ...DEFAULT_VISUAL_SETTINGS };
    this.settings = {
      matchSongTheme: true,
      audioMoodShift: true,
      syntaxStyle: "mixed",
      ...DEFAULT_VISUAL_SETTINGS,
      ...storedVisuals,
      chromaStrength: 0.75,
      grainAmount: 16,
      linuxLowSpecMode: false
    };
    this.settings.cleanFeed = false;
    this.settings.lyricRevealMode = normalizeRevealMode(storedRevealMode ?? this.settings.lyricRevealMode);
    this.settings.backdropMode = normalizeBackdropMode(this.settings.backdropMode);
    this.settings.frameRatio = normalizeFrameRatio(this.settings.frameRatio);
    this.settings.showFrameGuide = this.settings.showFrameGuide !== false;
    this.settings.cinematicFx = this.settings.cinematicFx !== false;
    this._ambientMotes = null;
    this._lastCinematicBassStr = "";
    this._lastVignetteOpacityStr = "";
        this.settingsPanelOpen = false;

    let storedKeybinds = {};
    try {
      const savedKb = localStorage.getItem("cider_ide_lyrics_keybinds");
      if (savedKb) storedKeybinds = JSON.parse(savedKb);
    } catch (e) {}
    this.keybinds = Object.assign({}, DEFAULT_KEYBINDS, storedKeybinds);
    this.recordingKeybindAction = null;

    this.isLockActive = false;
    this.currentLockMode = "lock";
    this._lockActivatedAt = 0;
    this._lockInitialMouse = null;
    this._preLockFullscreen = false;
    this._lastActivityTime = Date.now();
    this._lockClockTimer = null;
    this._screensaverClockTimer = null;
    this._idleCheckTimer = null;
    this._idleWatcherInitialized = false;

    this.palette = { ...DEFAULT_PALETTE };
    this.audioState = { bassPulse: 0 };
    this.currentCameraZoom = 1.0;
    this.currentPanX = 0;
    this.targetPanX = 0;
    this.isRtlSong = false;
    this.isCurrentlySpeaking = false;
    this._lastActiveWordToken = null;
    this._lastBeatFired = 0;
    this.compiledLines = [];
    this.cachedLineNodes = [];
    this.activeLineIndex = -1;
    this.activeTokenIndex = -1;
    this.currentScrollRem = 0;
    this.targetScrollRem = 0;
    this.currentTime = 0;
    this.duration = 0;
    this.isPlaying = false;
    this.isScrubbing = false;
    this.dockMinimized = false;
    this.showCoverShowcase = true;
    this.lastMutedVolume = 0.8;
    this.lastScrapedSignature = "";
    this.lastArtworkTrackUrl = "";
    this.currentTrackId = null;
    this.staleDomLyricsSig = "";
    this.staleLyricsTextSig = "";
    this.staleLyricsExpireAt = 0;
    this.lastConfirmedLyricsTextSig = "";
    this.confirmedLyricsByTrack = new Map();
    this.domSyncedTime = null;
    this._cachedW = 0;
    this._cachedH = 0;
    this._cachedBgGlow = null;
    this._destroyed = false;
    this._renderCallback = null;
  }

  onReady() {
    if (window.__CIDER_IDE_LYRICS_ACTIVE__) return;
    window.__CIDER_IDE_LYRICS_ACTIVE__ = this;

    this.injectStylesheet();
    this.initGrainPattern();
    this.mountStage();
    this.mountFloatingControlPill();
    this.mountSettingsPanel();
    this.applyPaletteToCSS(this.palette);
    this.applyVisualSettings();
    this.bindCiderAndMusicKitHooks();
    this.bindKeyboardShortcuts();
    this.initIdleWatcher();
    this.observeCiderLyricDOM();
    this.startRenderLoop();
    console.log(`[Cider 3D IDE Lyrics v${this.version}] Loaded inside Cider!`);
  }

  getPiniaStoreMap() {
    const amDirect = window.__PLUGINSYS__?.Stores?.appleMusicStore;
    if (amDirect?._p?._s) return amDirect._p._s;
    const appEl = document.querySelector("#app") || document.body?.firstElementChild;
    const vueApp =
      window.CiderApp?.app ||
      appEl?.__vue_app__ ||
      window.__VUE_APP__;
    const directPinia =
      vueApp?.config?.globalProperties?.$pinia ||
      vueApp?._context?.provides?.pinia;
    if (directPinia?._s) return directPinia._s;

    const provides = vueApp?._context?.provides;
    if (provides) {
      const syms = Object.getOwnPropertySymbols(provides);
      for (const s of syms) {
        if (provides[s]?._s instanceof Map) {
          return provides[s]._s;
        }
      }
      for (const k of Object.keys(provides)) {
        if (provides[k]?._s instanceof Map) {
          return provides[k]._s;
        }
      }
    }
    return null;
  }

  getAppleMusicStore() {
    if (window.__PLUGINSYS__?.Stores?.appleMusicStore) {
      return window.__PLUGINSYS__.Stores.appleMusicStore;
    }
    const storeMap = this.getPiniaStoreMap();
    if (storeMap) {
      return (
        storeMap.get("apple-music-store") ||
        storeMap.get("apple-music") ||
        storeMap.get("appleMusicStore") ||
        storeMap.get("playback-facade") ||
        storeMap.get("player") ||
        null
      );
    }
    return null;
  }

  getPlaybackFacadeStore() {
    const storeMap = this.getPiniaStoreMap();
    return storeMap?.get?.("playback-facade") || null;
  }

  getLyricStore() {
    const storeMap = this.getPiniaStoreMap();
    if (storeMap) {
      return storeMap.get("lyric-store") || storeMap.get("lyrics") || null;
    }
    return window.__PLUGINSYS__?.Stores?.lyricStore || null;
  }

  getNowPlayingTrack() {
    const am = this.getAppleMusicStore();
    const pf = this.getPlaybackFacadeStore();
    const mk = window.MusicKit?.getInstance?.();
    const liveItem =
      am?.nowPlayingItem ||
      pf?.nowPlayingItem ||
      mk?.nowPlayingItem ||
      am?.settledNowPlaying ||
      null;
    const extItem = am?.nowPlayingExtended || null;
    if (!liveItem) return extItem;
    if (!extItem) return liveItem;

    const liveName = String(
      liveItem?.attributes?.name || liveItem?.name || liveItem?.title || ""
    ).trim();
    const extName = String(
      extItem?.attributes?.name || extItem?.name || extItem?.title || ""
    ).trim();
    if (liveName && extName && liveName.toLowerCase() !== extName.toLowerCase()) {
      return liveItem;
    }
    return liveItem;
  }

  getTrackUniqueKey(trackOverride = null) {
    const am = this.getAppleMusicStore();
    const pf = this.getPlaybackFacadeStore();
    const mk = window.MusicKit?.getInstance?.();
    const liveItem =
      trackOverride ||
      am?.nowPlayingItem ||
      pf?.nowPlayingItem ||
      mk?.nowPlayingItem ||
      am?.nowPlayingExtended ||
      null;
    if (liveItem) {
      const name = String(
        liveItem?.attributes?.name || liveItem?.name || liveItem?.title || ""
      )
        .trim()
        .toLowerCase();
      const artist = String(
        liveItem?.attributes?.artistName || liveItem?.artistName || ""
      )
        .trim()
        .toLowerCase();
      const album = String(
        liveItem?.attributes?.albumName || liveItem?.albumName || ""
      )
        .trim()
        .toLowerCase();

      // Use stable metadata identity when title is known so Cider's async resolveTrackIdentity()
      // mutating track.id from library ID ("i.xxx") to catalog ID ("1626...") does not trigger
      // a false second track-change mid-song and self-poison the current song's lyrics.
      if (name) {
        return `track::${name}::${artist}::${album}`;
      }

      const id =
        liveItem?.id ||
        liveItem?.songId ||
        liveItem?.attributes?.playParams?.catalogId ||
        liveItem?.attributes?.playParams?.id ||
        pf?.nowPlayingId ||
        "";
      if (id) {
        return `id::${id}`;
      }
    }
    return null;
  }

  formatTime(sec) {
    if (!Number.isFinite(sec) || sec < 0) return "00:00";
    const total = Math.floor(sec);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  togglePlayPause() {
    const am = this.getAppleMusicStore();
    if (am) {
      if (typeof am.playpause === "function") {
        am.playpause();
      } else if (am.isPlaying && typeof am.pause === "function") {
        am.pause();
      } else if (typeof am.play === "function") {
        am.play();
      }
    } else {
      const mk = window.MusicKit?.getInstance?.();
      if (mk) {
        if (mk.isPlaying) mk.pause?.();
        else mk.play?.();
      }
    }
    this.audioState.bassPulse = Math.max(this.audioState.bassPulse, 0.7);
    setTimeout(() => this.updatePlayerDockUI(), 60);
  }

  skipPrevTrack() {
    const am = this.getAppleMusicStore();
    if (am && typeof am.skipToPrevious === "function") {
      if ((am.currentTime || 0) > 3.5 && typeof am.seekTo === "function") {
        am.seekTo(0);
      } else {
        am.skipToPrevious();
      }
    } else {
      window.MusicKit?.getInstance?.()?.skipToPreviousItem?.();
    }
    setTimeout(() => this.updatePlayerDockUI(), 120);
  }

  skipNextTrack() {
    const am = this.getAppleMusicStore();
    if (am && typeof am.skipToNext === "function") {
      am.skipToNext();
    } else {
      window.MusicKit?.getInstance?.()?.skipToNextItem?.();
    }
    setTimeout(() => this.updatePlayerDockUI(), 120);
  }

  seekToTime(sec) {
    const target = Math.max(0, Number(sec) || 0);
    const am = this.getAppleMusicStore();
    if (am && typeof am.seekTo === "function") {
      try {
        am.seekTo(target);
        if (!am.isPlaying && typeof am.play === "function") {
          am.play();
        }
      } catch (err) {
        console.warn("[Cider IDE Lyrics] seekTo error:", err);
      }
    } else {
      const mk = window.MusicKit?.getInstance?.();
      if (mk?.seekToTime) mk.seekToTime(target);
    }
    this.currentTime = target + 0.05;
    this._lastRawAudioTime = this.currentTime;
    this.domSyncedTime = this.currentTime;
    this.audioState.bassPulse = Math.max(this.audioState.bassPulse, 0.85);
    this.syncWordCursor(this.getSyncAdjustedTime(this.currentTime), true);
    this.updatePlayerDockUI();
  }

  jumpRelativeLine(delta) {
    if (!this.compiledLines.length) return;
    const baseIdx = this.activeLineIndex >= 0 ? this.activeLineIndex : 0;
    const targetIdx = Math.max(0, Math.min(this.compiledLines.length - 1, baseIdx + delta));
    const targetLine = this.compiledLines[targetIdx];
    const domNodes = this.getValidLyricLineNodes();
    if (domNodes && domNodes[targetIdx] && (domNodes.length === this.compiledLines.length || !targetLine?.hasRealTimestamp)) {
      try {
        domNodes[targetIdx].click();
        this.lastDomActiveIdx = targetIdx;
        if (targetLine) {
          this.currentTime = targetLine.start + 0.05;
          this._lastRawAudioTime = this.currentTime;
          this.domSyncedTime = this.currentTime;
          this.syncWordCursor(this.getSyncAdjustedTime(this.currentTime), true);
        }
        return;
      } catch {}
    }
    if (targetLine) {
      this.seekToTime(targetLine.start);
    }
  }

  setVolume(val) {
    const clamped = Math.max(0, Math.min(1, Number(val)));
    const am = this.getAppleMusicStore();
    if (am && "volume" in am) {
      am.volume = clamped;
    } else {
      const mk = window.MusicKit?.getInstance?.();
      if (mk) mk.volume = clamped;
    }
    if (clamped > 0.01) this.lastMutedVolume = clamped;
    this.updatePlayerDockUI();
  }

  toggleMute() {
    const am = this.getAppleMusicStore();
    const cur = am?.volume ?? 1;
    if (cur > 0.01) {
      this.lastMutedVolume = cur;
      this.setVolume(0);
    } else {
      this.setVolume(this.lastMutedVolume || 0.8);
    }
  }

  toggleShuffle() {
    const am = this.getAppleMusicStore();
    if (am && typeof am.toggleQueueShuffle === "function") {
      am.toggleQueueShuffle();
      setTimeout(() => this.updatePlayerDockUI(), 80);
    }
  }

  toggleRepeat() {
    const am = this.getAppleMusicStore();
    if (am && typeof am.toggleRepeatMode === "function") {
      am.toggleRepeatMode();
      setTimeout(() => this.updatePlayerDockUI(), 80);
    }
  }

  bindKeyboardShortcuts() {
    if (this._keyHandlerBound) return;
    this._keyHandlerBound = true;
    this._keydownHandler = (e) => {
      this._lastActivityTime = Date.now();
      const code = e.code || "";
      const rawKey = e.key || "";
      const key = rawKey.toLowerCase();

      // If recording a custom keybind in Settings, capture the next non-modifier key press
      if (this.recordingKeybindAction) {
        if (rawKey === "Control" || rawKey === "Shift" || rawKey === "Alt" || rawKey === "Meta") {
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        if (code === "Escape" || rawKey === "Escape") {
          this.recordingKeybindAction = null;
          this.renderKeybindsList();
          return;
        }
        const actKey = this.recordingKeybindAction;
        if (this.keybinds && this.keybinds[actKey]) {
          this.keybinds[actKey] = {
            ...this.keybinds[actKey],
            label: this.formatKeyDisplay(e),
            key,
            code,
            ctrl: !!e.ctrlKey,
            alt: !!e.altKey,
            shift: !!e.shiftKey,
            meta: !!e.metaKey
          };
          try {
            localStorage.setItem("cider_ide_lyrics_keybinds", JSON.stringify(this.keybinds));
          } catch (err) {}
        }
        this.recordingKeybindAction = null;
        this.renderKeybindsList();
        return;
      }

      // Check if hardware media key
      const isHardwareMediaKey =
        code === "MediaPlayPause" ||
        rawKey === "MediaPlayPause" ||
        code === "MediaTrackNext" ||
        rawKey === "MediaTrackNext" ||
        code === "MediaTrackPrevious" ||
        rawKey === "MediaTrackPrevious" ||
        code === "AudioVolumeUp" ||
        rawKey === "AudioVolumeUp" ||
        code === "AudioVolumeDown" ||
        rawKey === "AudioVolumeDown" ||
        code === "AudioVolumeMute" ||
        rawKey === "AudioVolumeMute";

      // If user is focused on an input/editable field, ignore typing/navigation keys,
      // but permit dedicated hardware media keys.
      const tag = (e.target?.tagName || "").toLowerCase();
      const isInput =
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        Boolean(e.target?.isContentEditable);

      // Close visual settings panel via Escape (even if an input/slider inside the modal is focused)
      if ((code === "Escape" || rawKey === "Escape") && this.settingsPanelOpen) {
        e.preventDefault();
        this.closeSettingsPanel();
        return;
      }

      // If Ambient Lock Screen or Screensaver is active, ANY non-repeat key wakes/unlocks
      if (this.isLockActive) {
        e.preventDefault();
        if (e.repeat) return;
        this.deactivateLockOrScreensaver();
        return;
      }

      const kb = this.keybinds || DEFAULT_KEYBINDS;

      // Ambient Lock Screen / Screensaver (default: Ctrl/Cmd + Alt/Option + S)
      if (this.matchesKeybind(e, kb.screensaverLock)) {
        e.preventDefault();
        if (this.isLockActive) {
          this.deactivateLockOrScreensaver();
        } else {
          this.activateLockOrScreensaver(true);
        }
        return;
      }

      if (isInput && !isHardwareMediaKey) return;

      // Exit Clean Feed via Escape before exiting Fullscreen
      if ((code === "Escape" || rawKey === "Escape") && this.settings.cleanFeed) {
        e.preventDefault();
        this.setCleanFeed(false);
        return;
      }

      // Exit Fullscreen via Escape (always available whenever in fullscreen)
      if ((code === "Escape" || rawKey === "Escape") && this.isFullscreen) {
        e.preventDefault();
        this.toggleFullscreenMode();
        return;
      }

      // Toggle IDE lyrics ON/OFF (default: Ctrl/Cmd + Alt/Option + L)
      if (this.matchesKeybind(e, kb.toggleVisualizer)) {
        e.preventDefault();
        this.toggleVisualizerEnable();
        return;
      }

      // Toggle Fullscreen (default: Ctrl/Cmd + Shift + L): turns it ON if it was off, then toggles fullscreen
      if (this.matchesKeybind(e, kb.toggleFullscreen)) {
        e.preventDefault();
        if (!this.enabled) {
          this.toggleVisualizerEnable(true);
        }
        this.toggleFullscreenMode();
        return;
      }

      // Global Hardware Media Keys: always trigger playback control if event reaches window
      if (code === "MediaPlayPause" || rawKey === "MediaPlayPause") {
        e.preventDefault();
        this.togglePlayPause();
        return;
      }
      if (code === "MediaTrackNext" || rawKey === "MediaTrackNext") {
        e.preventDefault();
        this.skipNextTrack();
        return;
      }
      if (code === "MediaTrackPrevious" || rawKey === "MediaTrackPrevious") {
        e.preventDefault();
        this.skipPrevTrack();
        return;
      }
      if (code === "AudioVolumeUp" || rawKey === "AudioVolumeUp") {
        e.preventDefault();
        const am = this.getAppleMusicStore();
        const curVol = am?.volume ?? window.MusicKit?.getInstance?.()?.volume ?? 1;
        this.setVolume(Math.min(1, curVol + 0.05));
        return;
      }
      if (code === "AudioVolumeDown" || rawKey === "AudioVolumeDown") {
        e.preventDefault();
        const am = this.getAppleMusicStore();
        const curVol = am?.volume ?? window.MusicKit?.getInstance?.()?.volume ?? 1;
        this.setVolume(Math.max(0, curVol - 0.05));
        return;
      }
      if (code === "AudioVolumeMute" || rawKey === "AudioVolumeMute") {
        e.preventDefault();
        this.toggleMute();
        return;
      }

      // Standard keyboard shortcuts: active whenever lyrics, fullscreen, or settings panel is active
      const isLyricsOrFsActive =
        this.isFullscreen ||
        this.settingsPanelOpen ||
        (typeof this.isLyricsActive === "function" && this.isLyricsActive()) ||
        (this.root && this.root.style.display !== "none");

      // Quick Sync Nudge: [ (-25ms), ] (+25ms), \ (0ms reset)
      if (
        isLyricsOrFsActive &&
        this.enabled &&
        !e.ctrlKey &&
        !e.altKey &&
        !e.metaKey
      ) {
        if (code === "BracketLeft" || rawKey === "[") {
          e.preventDefault();
          this.nudgeSyncOffset(-25);
          return;
        }
        if (code === "BracketRight" || rawKey === "]") {
          e.preventDefault();
          this.nudgeSyncOffset(25);
          return;
        }
        if (code === "Backslash" || rawKey === "\\") {
          e.preventDefault();
          this.nudgeSyncOffset(null, 0);
          return;
        }
      }

      if (!isLyricsOrFsActive) return;

      // Toggle Settings panel (default: S)
      if (this.matchesKeybind(e, kb.toggleSettings)) {
        e.preventDefault();
        this.toggleSettingsPanel();
        return;
      }

      // Toggle Clean Feed / Edit Mode (default: E)
      if (this.matchesKeybind(e, kb.toggleCleanFeed)) {
        e.preventDefault();
        this.setCleanFeed(!this.settings.cleanFeed);
        return;
      }

      const noModifiers = !e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey;
      const navModifiers = (e.shiftKey || e.ctrlKey || e.metaKey) && !e.altKey;

      // Play / Pause: custom bind (default Space) or KeyK
      if (
        this.matchesKeybind(e, kb.playPause) ||
        (noModifiers && (code === "KeyK" || key === "k"))
      ) {
        e.preventDefault();
        this.togglePlayPause();
        return;
      }

      // Next track: custom bind (default Shift + ArrowRight), Ctrl/Cmd + ArrowRight, or KeyN
      if (
        this.matchesKeybind(e, kb.nextTrack) ||
        (navModifiers && (code === "ArrowRight" || rawKey === "ArrowRight")) ||
        (noModifiers && (code === "KeyN" || key === "n"))
      ) {
        e.preventDefault();
        this.skipNextTrack();
        return;
      }

      // Previous track: custom bind (default Shift + ArrowLeft), Ctrl/Cmd + ArrowLeft, or KeyP
      if (
        this.matchesKeybind(e, kb.prevTrack) ||
        (navModifiers && (code === "ArrowLeft" || rawKey === "ArrowLeft")) ||
        (noModifiers && (code === "KeyP" || key === "p"))
      ) {
        e.preventDefault();
        this.skipPrevTrack();
        return;
      }

      // Seek forward 5s: ArrowRight (unmodified) or KeyL
      if (
        (noModifiers && (code === "ArrowRight" || rawKey === "ArrowRight")) ||
        (noModifiers && (code === "KeyL" || key === "l"))
      ) {
        e.preventDefault();
        this.seekToTime((this.currentTime || 0) + 5);
        return;
      }

      // Seek backward 5s: ArrowLeft (unmodified) or KeyJ
      if (
        (noModifiers && (code === "ArrowLeft" || rawKey === "ArrowLeft")) ||
        (noModifiers && (code === "KeyJ" || key === "j"))
      ) {
        e.preventDefault();
        this.seekToTime(Math.max(0, (this.currentTime || 0) - 5));
        return;
      }

      // Volume Up: Shift/Ctrl + ArrowUp
      if (navModifiers && (code === "ArrowUp" || rawKey === "ArrowUp")) {
        e.preventDefault();
        const am = this.getAppleMusicStore();
        const curVol = am?.volume ?? window.MusicKit?.getInstance?.()?.volume ?? 1;
        this.setVolume(Math.min(1, curVol + 0.05));
        return;
      }

      // Volume Down: Shift/Ctrl + ArrowDown
      if (navModifiers && (code === "ArrowDown" || rawKey === "ArrowDown")) {
        e.preventDefault();
        const am = this.getAppleMusicStore();
        const curVol = am?.volume ?? window.MusicKit?.getInstance?.()?.volume ?? 1;
        this.setVolume(Math.max(0, curVol - 0.05));
        return;
      }

      // Relative line jump: ArrowUp (prev line), ArrowDown (next line)
      if (noModifiers && (code === "ArrowUp" || rawKey === "ArrowUp")) {
        e.preventDefault();
        this.jumpRelativeLine(-1);
        return;
      }
      if (noModifiers && (code === "ArrowDown" || rawKey === "ArrowDown")) {
        e.preventDefault();
        this.jumpRelativeLine(1);
        return;
      }

      // Toggle Mute: KeyM
      if (noModifiers && (code === "KeyM" || key === "m")) {
        e.preventDefault();
        this.toggleMute();
        return;
      }

      // Toggle Fullscreen: KeyF
      if (noModifiers && (code === "KeyF" || key === "f")) {
        e.preventDefault();
        this.toggleFullscreenMode();
        return;
      }
    };
    window.addEventListener("keydown", this._keydownHandler);
  }

  injectStylesheet() {
    if (document.getElementById("cider-ide-lyrics-injected-style")) return;
    const styleEl = document.createElement("style");
    styleEl.id = "cider-ide-lyrics-injected-style";
    styleEl.textContent = INJECTED_CSS;
    document.head.appendChild(styleEl);
  }

  initGrainPattern() {
    this.grainCanvas = document.createElement("canvas");
    this.grainCanvas.width = 180;
    this.grainCanvas.height = 180;
    const gctx = this.grainCanvas.getContext("2d");
    const imgData = gctx.createImageData(180, 180);
    const buf = imgData.data;
    for (let i = 0; i < buf.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      buf[i] = v;
      buf[i + 1] = (v * 0.85) | 0;
      buf[i + 2] = v;
      buf[i + 3] = 255;
    }
    gctx.putImageData(imgData, 0, 0);
  }

  ensureBackgroundLyricFeeder() {
    if (this._bgLyricFeederMounted) return;
    const existingLyricView = document.querySelector(
      ".lyric-view-wrapper, .lyric-view, .clp-line, .lyric-line"
    );
    if (existingLyricView) return;

    const renderComp = window.__PLUGINSYS__?.App?.RenderComponent;
    if (typeof renderComp === "function") {
      try {
        const holder = document.createElement("div");
        holder.id = "cider-ide-bg-lyric-feeder";
        holder.style.cssText =
          "position:fixed;left:-9999px;top:0;width:320px;height:320px;opacity:0;pointer-events:none;overflow:hidden;z-index:-1;";
        document.body.appendChild(holder);
        this._bgLyricFeederMounted = true;
        renderComp({
          component: "LyricView",
          element: holder,
          props: {}
        });
      } catch {}
    }
  }

  mountStage(hostContainer = null) {
    if (!this.root) {
      this.root = document.createElement("div");
      this.root.id = "cider-ide-visualizer-root";

      this.customBgEl = document.createElement("div");
      this.customBgEl.className = "cider-ide-custom-bg";
      this.customBgEl.setAttribute("aria-hidden", "true");
      this.customBgImg = document.createElement("img");
      this.customBgImg.className = "cider-ide-custom-bg-img";
      this.customBgImg.alt = "";
      this.customBgVideo = document.createElement("video");
      this.customBgVideo.className = "cider-ide-custom-bg-video";
      this.customBgVideo.autoplay = true;
      this.customBgVideo.loop = true;
      this.customBgVideo.muted = true;
      this.customBgVideo.playsInline = true;
      this.customBgEl.appendChild(this.customBgImg);
      this.customBgEl.appendChild(this.customBgVideo);
      this.root.appendChild(this.customBgEl);

      this.canvas = document.createElement("canvas");
      this.canvas.id = "cider-ide-wave-canvas";
      this.ctx = this.canvas.getContext("2d");

      this.stage = document.createElement("div");
      this.stage.className = "cider-ide-stage";

      this.codePlane = document.createElement("div");
      this.codePlane.className = "cider-ide-plane";
      this.stage.appendChild(this.codePlane);

      this.interludeEl = document.createElement("div");
      this.interludeEl.className = "cider-ide-interlude";
      this.interludeEl.setAttribute("aria-hidden", "true");
      this.interludeEl.innerHTML = '<span class="cider-ide-interlude-label"></span><div class="cider-ide-interlude-track"><div class="cider-ide-interlude-fill"></div></div>';
      this.interludeLabelEl = this.interludeEl.querySelector(".cider-ide-interlude-label");
      this.interludeFillEl = this.interludeEl.querySelector(".cider-ide-interlude-fill");
      this.stage.appendChild(this.interludeEl);

      this.progressHairlineEl = document.createElement("div");
      this.progressHairlineEl.className = "cider-ide-progress-hairline";
      this.progressHairlineEl.setAttribute("aria-hidden", "true");
      this.stage.appendChild(this.progressHairlineEl);

      this.syncHudEl = document.createElement("div");
      this.syncHudEl.className = "cider-ide-sync-hud";
      this.syncHudEl.setAttribute("aria-hidden", "true");

      this.vignette = document.createElement("div");
      this.vignette.id = "cider-ide-vignette";

      this.frameGuideEl = document.createElement("div");
      this.frameGuideEl.id = "cider-ide-frame-guide";
      this.frameGuideEl.className = "cider-ide-frame-guide";
      this.frameGuideEl.setAttribute("aria-hidden", "true");
      this.frameGuideLabelEl = document.createElement("span");
      this.frameGuideLabelEl.className = "cider-frame-guide-label";
      this.frameGuideEl.appendChild(this.frameGuideLabelEl);

      this.root.appendChild(this.canvas);
      this.root.appendChild(this.stage);
      this.root.appendChild(this.vignette);
      this.root.appendChild(this.frameGuideEl);
      this.root.appendChild(this.syncHudEl);
      this.mountCoverShowcase();
      this.mountPlayerDock();
      this.mountSettingsPanel();

      this.resizeHandler = () => this.resizeCanvas();
      window.addEventListener("resize", this.resizeHandler);
      if (typeof ResizeObserver !== "undefined" && !this._resizeObserver) {
        this._resizeObserver = new ResizeObserver(() => {
          this.resizeCanvas();
        });
        this._resizeObserver.observe(this.root);
      }
    }

    const targetHost = hostContainer || (this.isFullscreen ? document.body : this.findLyricHost());
    if (targetHost) {
      if (this.root.parentElement && this.root.parentElement !== targetHost) {
        if (this.root.parentElement !== document.body) {
          this.root.parentElement.classList.remove("cider-ide-host-active");
        }
      }
      const computedPos = window.getComputedStyle(targetHost).position;
      if (computedPos === "static" && targetHost !== document.body) {
        targetHost.style.position = "relative";
      }
      if (targetHost !== document.body) {
        targetHost.classList.toggle("cider-ide-host-active", this.enabled);
      }
      if (this.root.parentElement !== targetHost) {
        targetHost.appendChild(this.root);
      }
      this.root.classList.toggle("is-fullscreen", this.isFullscreen);
      this.root.style.display = (this.enabled || this.isLockActive) ? "flex" : "none";
      if (this.pill) {
        if (this.pill.parentElement !== targetHost) {
          targetHost.appendChild(this.pill);
        }
        this.pill.classList.toggle("is-fullscreen", this.isFullscreen);
        this.pill.style.display = "flex";
      }
    } else {
      if (this.root.parentElement && this.root.parentElement !== document.body) {
        this.root.parentElement.classList.remove("cider-ide-host-active");
      }
      this.root.classList.remove("is-fullscreen");
      this.root.style.display = "none";
      if (this.pill) this.pill.style.display = "none";
      this.closeSettingsPanel();
    }

    if (!this.enabled || this.root.style.display === "none") {
      document.body.classList.remove("cider-ide-host-active", "cider-ide-lyrics-active", "cider-ide-clean-feed");
      if (targetHost && targetHost !== document.body) {
        targetHost.classList.remove("cider-ide-host-active");
      }
      this.closeSettingsPanel();
    }
    this.applyEditStudioState();
    this.resizeCanvas();
    this.updatePlayerDockUI();
    if (this.isRenderActive()) this.resumeRenderLoop();
    else this.pauseRenderLoop();
  }

  mountCoverShowcase() {
    if (!this.root) return;
    if (this.coverShowcase) this.coverShowcase.remove();

    const showcase = document.createElement("div");
    showcase.id = "cider-ide-cover-showcase";
    showcase.innerHTML = `
      <div class="cider-cover-art-frame" data-showcase="frame" title="Click to Play / Pause">
        <img class="cider-cover-art-img" data-showcase="art" alt="Album Cover" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />
        <div class="cider-cover-art-overlay" data-showcase="overlay">Play / Pause</div>
      </div>
      <div class="cider-cover-showcase-meta">
        <div class="cider-cover-meta-left">
          <div class="cider-cover-showcase-title" data-showcase="title">Cider IDE Visualizer</div>
          <div class="cider-cover-showcase-artist" data-showcase="artist">Playing in Cider</div>
          <div class="cider-cover-showcase-album" data-showcase="album"></div>
        </div>
        <div class="cider-cover-meta-right">
          <button class="cider-cover-btn-icon" data-act="favorite" title="Favorite">★</button>
        </div>
      </div>
      <div class="cider-cover-controls">
        <div class="cider-cover-scrubber-wrap">
          <input type="range" class="cider-cover-scrubber" data-showcase="scrubber" min="0" max="200" step="0.1" value="0" title="Drag to seek" />
          <div class="cider-cover-times">
            <span class="cider-cover-time" data-showcase="time-cur">00:00</span>
            <span class="cider-cover-time" data-showcase="time-rem">-00:00</span>
          </div>
        </div>
        <div class="cider-cover-main-transport">
          <button class="cider-cover-trans-btn" data-act="prev-track" title="Previous Track (Shift+Left)">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
          </button>
          <button class="cider-cover-trans-btn is-play-main" data-act="play-pause" title="Play / Pause (Space)">
            <svg class="cider-icon-play" viewBox="0 0 24 24" width="34" height="34" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            <svg class="cider-icon-pause" viewBox="0 0 24 24" width="34" height="34" fill="currentColor" style="display:none;"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          </button>
          <button class="cider-cover-trans-btn" data-act="next-track" title="Next Track (Shift+Right)">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
          </button>
        </div>
        <div class="cider-cover-sub-transport">
          <button class="cider-cover-sub-btn" data-act="repeat" title="Toggle Repeat (Infinity)">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.6 6.62c-1.44 0-2.8.56-3.77 1.58L12 11.08 9.17 8.2c-.97-1.02-2.33-1.58-3.77-1.58-2.98 0-5.4 2.42-5.4 5.38 0 2.98 2.42 5.4 5.4 5.4 1.44 0 2.8-.56 3.77-1.58L12 12.92l2.83 2.88c.97 1.02 2.33 1.58 3.77 1.58 2.98 0 5.4-2.42 5.4-5.4 0-2.96-2.42-5.36-5.4-5.36zm0 8.78c-1.88 0-3.4-1.52-3.4-3.4s1.52-3.4 3.4-3.4 3.4 1.52 3.4 3.4-1.52 3.4-3.4 3.4zM5.4 15.4c-1.88 0-3.4-1.52-3.4-3.4s1.52-3.4 3.4-3.4 3.4 1.52 3.4 3.4-1.52 3.4-3.4 3.4z"/></svg>
            <span class="cider-rep-badge" style="display:none;">1</span>
          </button>
          <button class="cider-cover-sub-btn" data-act="shuffle" title="Toggle Shuffle">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>
          </button>
        </div>
      </div>
    `;

    const frame = showcase.querySelector('[data-showcase="frame"]');
    if (frame) {
      frame.addEventListener("click", (e) => {
        e.stopPropagation();
        this.togglePlayPause();
      });
    }

    const scrubber = showcase.querySelector('[data-showcase="scrubber"]');
    const curLabel = showcase.querySelector('[data-showcase="time-cur"]');
    const remLabel = showcase.querySelector('[data-showcase="time-rem"]');
    if (scrubber) {
      const commitScrub = () => {
        if (!this.isScrubbing) return;
        this.isScrubbing = false;
        const val = parseFloat(scrubber.value) || 0;
        this.seekToTime(val);
      };
      const cancelScrub = () => {
        this.isScrubbing = false;
      };
      scrubber.addEventListener("pointerdown", () => {
        this.isScrubbing = true;
        const onWinEnd = (ev) => {
          window.removeEventListener("pointerup", onWinEnd);
          window.removeEventListener("pointercancel", onWinEnd);
          if (ev.type === "pointercancel") cancelScrub();
          else commitScrub();
        };
        window.addEventListener("pointerup", onWinEnd);
        window.addEventListener("pointercancel", onWinEnd);
      });
      scrubber.addEventListener("input", (e) => {
        this.isScrubbing = true;
        const val = parseFloat(e.target.value) || 0;
        if (curLabel) curLabel.textContent = this.formatTime(val);
        if (remLabel) remLabel.textContent = "-" + this.formatTime(Math.max(0, (this.duration || 0) - val));
      });
      scrubber.addEventListener("change", commitScrub);
      scrubber.addEventListener("pointerup", commitScrub);
      scrubber.addEventListener("pointercancel", cancelScrub);
      scrubber.addEventListener("blur", cancelScrub);
    }

    showcase.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-act]");
      if (!btn) return;
      const act = btn.dataset.act;
      if (act === "play-pause") this.togglePlayPause();
      else if (act === "prev-track") this.skipPrevTrack();
      else if (act === "next-track") this.skipNextTrack();
      else if (act === "shuffle") this.toggleShuffle();
      else if (act === "repeat") this.toggleRepeat();
      else if (act === "favorite") {
        btn.classList.toggle("is-active");
      }
    });

    this.coverShowcase = showcase;
    this.root.appendChild(showcase);
  }

  toggleCoverShowcase() {
    this.showCoverShowcase = !this.showCoverShowcase;
    this.resizeCanvas();
    this.updatePlayerDockUI();
    const pillCoverBtn = this.pill?.querySelector('button[data-act="toggle-cover"]');
    if (pillCoverBtn) pillCoverBtn.classList.toggle("is-on", this.showCoverShowcase);
  }

  mountPlayerDock() {
    if (!this.root) return;
    if (this.playerDock) this.playerDock.remove();

    const dock = document.createElement("div");
    dock.id = "cider-ide-player-dock";
    if (this.dockMinimized) dock.classList.add("is-minimized");

    dock.innerHTML = `
      <div class="cider-dock-scrubber-row">
        <span class="cider-dock-time is-current" data-dock="time-cur">00:00</span>
        <input type="range" class="cider-dock-slider" data-dock="scrubber" min="0" max="200" step="0.1" value="0" title="Drag or click to seek song" />
        <span class="cider-dock-time" data-dock="time-tot">00:00</span>
      </div>
      <div class="cider-dock-main-row">
        <div class="cider-dock-track">
          <img class="cider-dock-art" data-dock="art" alt="Cover" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />
          <div class="cider-dock-meta">
            <div class="cider-dock-title" data-dock="title">Cider IDE Visualizer</div>
            <div class="cider-dock-artist" data-dock="artist">Click any code line to jump</div>
          </div>
        </div>
        <div class="cider-dock-transport">
          <button class="cider-dock-btn cider-dock-hide-compact" data-act="shuffle" title="Toggle Shuffle">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>
          </button>
          <button class="cider-dock-btn" data-act="prev-track" title="Previous Track (Shift+Left)">|&lt;&lt;</button>
          <button class="cider-dock-btn cider-dock-hide-compact" data-act="prev-line" title="Previous Lyric Line (Up Arrow)">&lt; Line</button>
          <button class="cider-dock-btn is-play" data-act="play-pause" title="Play / Pause (Space)">Play</button>
          <button class="cider-dock-btn cider-dock-hide-compact" data-act="next-line" title="Next Lyric Line (Down Arrow)">Line &gt;</button>
          <button class="cider-dock-btn" data-act="next-track" title="Next Track (Shift+Right)">&gt;&gt;|</button>
          <button class="cider-dock-btn cider-dock-hide-compact" data-act="repeat" title="Toggle Repeat (Infinity)">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.6 6.62c-1.44 0-2.8.56-3.77 1.58L12 11.08 9.17 8.2c-.97-1.02-2.33-1.58-3.77-1.58-2.98 0-5.4 2.42-5.4 5.38 0 2.98 2.42 5.4 5.4 5.4 1.44 0 2.8-.56 3.77-1.58L12 12.92l2.83 2.88c.97 1.02 2.33 1.58 3.77 1.58 2.98 0 5.4-2.42 5.4-5.4 0-2.96-2.42-5.36-5.4-5.36zm0 8.78c-1.88 0-3.4-1.52-3.4-3.4s1.52-3.4 3.4-3.4 3.4 1.52 3.4 3.4-1.52 3.4-3.4 3.4zM5.4 15.4c-1.88 0-3.4-1.52-3.4-3.4s1.52-3.4 3.4-3.4 3.4 1.52 3.4 3.4-1.52 3.4-3.4 3.4z"/></svg>
            <span class="cider-rep-badge" style="display:none;">1</span>
          </button>
        </div>
        <div class="cider-dock-extra-controls">
          <button class="cider-dock-btn" data-act="mute" title="Mute / Unmute"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg></button>
          <input type="range" class="cider-dock-vol-slider" data-dock="volume" min="0" max="1" step="0.01" value="1" title="Volume" />
          <button class="cider-dock-btn cider-dock-hide-compact" data-act="cycle-style" title="Cycle Syntax Style">${this.settings.syntaxStyle ? (this.settings.syntaxStyle.charAt(0).toUpperCase() + this.settings.syntaxStyle.slice(1)) : "Style"}</button>
          <button class="cider-dock-btn cider-dock-hide-compact${this.settings.matchSongTheme ? " is-active" : ""}" data-act="toggle-theme" title="Toggle Song-Adaptive Theme">Theme</button>
          <button class="cider-dock-btn cider-dock-hide-compact" data-act="toggle-settings" title="Visual Settings">Settings</button>
          <button class="cider-dock-btn cider-dock-hide-compact${this.showCoverShowcase ? " is-active" : ""}" data-act="toggle-cover" title="Toggle Large Song Cover Showcase">Cover</button>
          <button class="cider-dock-btn" data-act="fullscreen" title="Toggle Fullscreen Visualizer (${typeof navigator !== 'undefined' && (/Mac|iPod|iPhone|iPad/.test(navigator.platform) || /Macintosh|Mac OS X/.test(navigator.userAgent)) ? '⌘⇧L' : 'Ctrl+Shift+L'})">Full</button>
          <button class="cider-dock-btn" data-act="minimize" title="Minimize / Expand Player Bar">${this.dockMinimized ? "▲" : "▼"}</button>
        </div>
      </div>
    `;

    const scrubber = dock.querySelector('[data-dock="scrubber"]');
    const curLabel = dock.querySelector('[data-dock="time-cur"]');
    if (scrubber) {
      const commitScrub = () => {
        if (!this.isScrubbing) return;
        this.isScrubbing = false;
        const val = parseFloat(scrubber.value) || 0;
        this.seekToTime(val);
      };
      const cancelScrub = () => {
        this.isScrubbing = false;
      };
      scrubber.addEventListener("pointerdown", () => {
        this.isScrubbing = true;
        const onWinEnd = (ev) => {
          window.removeEventListener("pointerup", onWinEnd);
          window.removeEventListener("pointercancel", onWinEnd);
          if (ev.type === "pointercancel") cancelScrub();
          else commitScrub();
        };
        window.addEventListener("pointerup", onWinEnd);
        window.addEventListener("pointercancel", onWinEnd);
      });
      scrubber.addEventListener("input", (e) => {
        this.isScrubbing = true;
        const val = parseFloat(e.target.value) || 0;
        if (curLabel) curLabel.textContent = this.formatTime(val);
      });
      scrubber.addEventListener("change", commitScrub);
      scrubber.addEventListener("pointerup", commitScrub);
      scrubber.addEventListener("pointercancel", cancelScrub);
      scrubber.addEventListener("blur", cancelScrub);
    }

    const volSlider = dock.querySelector('[data-dock="volume"]');
    if (volSlider) {
      volSlider.addEventListener("input", (e) => {
        this.setVolume(parseFloat(e.target.value));
      });
    }

    dock.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-act]");
      if (!btn) return;
      const act = btn.dataset.act;
      if (act === "play-pause") this.togglePlayPause();
      else if (act === "prev-track") this.skipPrevTrack();
      else if (act === "next-track") this.skipNextTrack();
      else if (act === "prev-line") this.jumpRelativeLine(-1);
      else if (act === "next-line") this.jumpRelativeLine(1);
      else if (act === "shuffle") this.toggleShuffle();
      else if (act === "repeat") this.toggleRepeat();
      else if (act === "mute") this.toggleMute();
      else if (act === "cycle-style") {
        const modes = ["mixed", "oop", "control", "pattern"];
        const idx = (modes.indexOf(this.settings.syntaxStyle) + 1) % modes.length;
        this.settings.syntaxStyle = modes[idx];
        btn.textContent = `${this.settings.syntaxStyle.charAt(0).toUpperCase() + this.settings.syntaxStyle.slice(1)}`;
        const pillStyle = this.pill?.querySelector('button[data-act="cycle-style"]');
        if (pillStyle) {
          const lSpan = pillStyle.querySelector(".pill-long-label");
          const sSpan = pillStyle.querySelector(".pill-short-label");
          if (lSpan && sSpan) {
            lSpan.textContent = `Style: ${this.settings.syntaxStyle}`;
            sSpan.textContent = this.settings.syntaxStyle;
          } else {
            pillStyle.textContent = `Style: ${this.settings.syntaxStyle}`;
          }
        }
        try {
          localStorage.setItem("cider_ide_lyrics_visual_settings", JSON.stringify(this.getVisualSettings()));
        } catch {}
        this.lastScrapedSignature = "";
        this.scrapeVisibleCiderLyrics(true);
      }
      else if (act === "toggle-theme") {
        this.settings.matchSongTheme = !this.settings.matchSongTheme;
        btn.classList.toggle("is-active", this.settings.matchSongTheme);
        const pillTheme = this.pill?.querySelector('button[data-act="toggle-theme"]');
        if (pillTheme) pillTheme.classList.toggle("is-on", this.settings.matchSongTheme);
        try {
          localStorage.setItem("cider_ide_lyrics_visual_settings", JSON.stringify(this.getVisualSettings()));
        } catch {}
        if (!this.settings.matchSongTheme) {
          this._artworkReqId = (this._artworkReqId || 0) + 1;
          this.applyPaletteToCSS(DEFAULT_PALETTE);
        } else {
          this.refreshCurrentTrackArtwork(true);
        }
      }
      else if (act === "toggle-settings") this.toggleSettingsPanel();
      else if (act === "toggle-cover") this.toggleCoverShowcase();
      else if (act === "fullscreen") this.toggleFullscreenMode();
      else if (act === "minimize") {
        this.dockMinimized = !this.dockMinimized;
        dock.classList.toggle("is-minimized", this.dockMinimized);
        btn.textContent = this.dockMinimized ? "▲" : "▼";
      }
    });

    this.playerDock = dock;
    this.root.appendChild(dock);
  }

  updatePlayerDockUI() {
    if (!this.playerDock) return;
    const am = this.getAppleMusicStore();
    const mk = window.MusicKit?.getInstance?.();

    const isPlaying = am ? !!am.isPlaying : !!mk?.isPlaying;
    const curTime = am && typeof am.currentTime === "number" ? am.currentTime : this.currentTime;
    const dur = am && typeof am.duration === "number" && am.duration > 0
      ? am.duration
      : (mk?.currentPlaybackDuration || Math.max(curTime + 1, this.compiledLines[this.compiledLines.length - 1]?.end || 180));

    this.isPlaying = isPlaying;
    this.duration = dur;

    const item = this.getNowPlayingTrack();
    const attrs = item?.attributes || item || {};
    const title = attrs.name || attrs.title || "Playing in Cider";
    const artist = attrs.artistName || attrs.AlbumName || attrs.albumName || "Click any code line to seek";
    const album = attrs.albumName || "";

    const rawArtTemplate =
      attrs?.artwork?.url ||
      am?.nowPlayingItem?.attributes?.artwork?.url ||
      mk?.nowPlayingItem?.artwork?.url ||
      am?.currentArtworkUrlHiRes ||
      am?.currentArtworkUrl ||
      "";
    let artUrl = rawArtTemplate;
    let hiResArtUrl = rawArtTemplate;
    if (artUrl) {
      artUrl = artUrl.replace("{w}", "128").replace("{h}", "128").replace("{f}", "webp");
      hiResArtUrl = rawArtTemplate.replace("{w}", "600").replace("{h}", "600").replace("{f}", "webp");
    } else {
      const domImg = document.querySelector("img.artwork, .now-playing-artwork img, [class*='artwork'] img");
      if (domImg?.src) {
        artUrl = domImg.src;
        hiResArtUrl = domImg.src.replace(/\/\d+x\d+/, "/600x600");
      }
    }

    const titleEl = this.playerDock.querySelector('[data-dock="title"]');
    const artistEl = this.playerDock.querySelector('[data-dock="artist"]');
    const artEl = this.playerDock.querySelector('[data-dock="art"]');
    const curEl = this.playerDock.querySelector('[data-dock="time-cur"]');
    const totEl = this.playerDock.querySelector('[data-dock="time-tot"]');
    const scrubEl = this.playerDock.querySelector('[data-dock="scrubber"]');
    const playBtn = this.playerDock.querySelector('button[data-act="play-pause"]');
    const shufBtn = this.playerDock.querySelector('button[data-act="shuffle"]');
    const repBtn = this.playerDock.querySelector('button[data-act="repeat"]');
    const muteBtn = this.playerDock.querySelector('button[data-act="mute"]');
    const volEl = this.playerDock.querySelector('[data-dock="volume"]');
    const coverBtn = this.playerDock.querySelector('button[data-act="toggle-cover"]');
    const fsBtn = this.playerDock.querySelector('button[data-act="fullscreen"]');

    if (titleEl && titleEl.textContent !== title) titleEl.textContent = title;
    if (artistEl && artistEl.textContent !== artist) artistEl.textContent = artist;
    if (artEl && artUrl && artEl.dataset.src !== artUrl) {
      artEl.dataset.src = artUrl;
      artEl.src = artUrl;
    }

    if (this.coverShowcase) {
      const scArt = this.coverShowcase.querySelector('[data-showcase="art"]');
      const scTitle = this.coverShowcase.querySelector('[data-showcase="title"]');
      const scArtist = this.coverShowcase.querySelector('[data-showcase="artist"]');
      const scAlbum = this.coverShowcase.querySelector('[data-showcase="album"]');
      const scOverlay = this.coverShowcase.querySelector('[data-showcase="overlay"]');
      const scPlayIcon = this.coverShowcase.querySelector('.cider-icon-play');
      const scPauseIcon = this.coverShowcase.querySelector('.cider-icon-pause');
      const scCur = this.coverShowcase.querySelector('[data-showcase="time-cur"]');
      const scRem = this.coverShowcase.querySelector('[data-showcase="time-rem"]');
      const scScrub = this.coverShowcase.querySelector('[data-showcase="scrubber"]');
      const scShuf = this.coverShowcase.querySelector('button[data-act="shuffle"]');
      const scRep = this.coverShowcase.querySelector('button[data-act="repeat"]');
      const scHideOthers = this.coverShowcase.querySelector('button[data-act="toggle-hide-others"]');

      if (scTitle && scTitle.textContent !== title) scTitle.textContent = title;
      if (scArtist && scArtist.textContent !== artist) scArtist.textContent = artist;
      if (scAlbum && scAlbum.textContent !== album) scAlbum.textContent = album;
      if (scOverlay) scOverlay.textContent = isPlaying ? "Pause Track" : "Play Track";
      if (scArt && hiResArtUrl && scArt.dataset.src !== hiResArtUrl) {
        scArt.dataset.src = hiResArtUrl;
        scArt.src = hiResArtUrl;
      }
      if (scPlayIcon && scPauseIcon) {
        scPlayIcon.style.display = isPlaying ? "none" : "block";
        scPauseIcon.style.display = isPlaying ? "block" : "none";
      }
      if (scCur) scCur.textContent = this.formatTime(curTime);
      if (scRem) scRem.textContent = "-" + this.formatTime(Math.max(0, dur - curTime));
      if (scScrub && !this.isScrubbing) {
        scScrub.max = String(Math.max(1, Math.ceil(dur)));
        scScrub.value = String(Math.min(dur, Math.max(0, curTime)));
        const pct = Math.min(100, Math.max(0, (curTime / Math.max(1, dur)) * 100));
        scScrub.style.background = `linear-gradient(90deg, ${this.palette.keyword} 0%, ${this.palette.method} ${pct}%, rgba(255,255,255,0.2) ${pct}%)`;
      }
      if (scShuf) {
        scShuf.classList.toggle("is-active", !!(am ? am.isShuffled : false));
      }
      if (scRep) {
        const rMode = am ? am.repeatMode : 0;
        const isActive = rMode === "one" || rMode === "all" || rMode === 1 || rMode === 2;
        scRep.classList.toggle("is-active", isActive);
        const isOne = rMode === "one" || rMode === 1;
        const badge = scRep.querySelector(".cider-rep-badge");
        if (badge) badge.style.display = isOne ? "inline-block" : "none";
      }
    }

    if (totEl) totEl.textContent = this.formatTime(dur);
    this.updateStageProgress(curTime, dur);
    if (!this.isScrubbing) {
      if (curEl) curEl.textContent = this.formatTime(curTime);
      if (scrubEl) {
        scrubEl.max = String(Math.max(1, Math.ceil(dur)));
        scrubEl.value = String(Math.min(dur, Math.max(0, curTime)));
        const pct = Math.min(100, Math.max(0, (curTime / Math.max(1, dur)) * 100));
        scrubEl.style.background = `linear-gradient(90deg, ${this.palette.keyword} 0%, ${this.palette.method} ${pct}%, rgba(255,255,255,0.16) ${pct}%)`;
      }
    }

    if (playBtn) {
      const label = isPlaying ? "Pause" : "Play";
      if (playBtn.textContent !== label) playBtn.textContent = label;
    }
    if (shufBtn) {
      const isShuffled = !!(am ? am.isShuffled : false);
      shufBtn.classList.toggle("is-active", isShuffled);
      shufBtn.title = isShuffled ? "Shuffle: On" : "Toggle Shuffle";
    }
    if (repBtn) {
      const rMode = am ? am.repeatMode : 0;
      const isActive = rMode === "one" || rMode === "all" || rMode === 1 || rMode === 2;
      repBtn.classList.toggle("is-active", isActive);
      const isOne = rMode === "one" || rMode === 1;
      const repBadge = repBtn.querySelector(".cider-rep-badge");
      if (repBadge) {
        repBadge.style.display = isOne ? "inline-block" : "none";
      }
      repBtn.title = isOne ? "Repeat: One" : isActive ? "Repeat: All (Infinity)" : "Toggle Repeat (Infinity)";
    }
    if (volEl && am && typeof am.volume === "number" && document.activeElement !== volEl) {
      volEl.value = String(am.volume);
    }
    if (muteBtn && am && typeof am.volume === "number") {
      muteBtn.innerHTML = am.volume <= 0.01 ? '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>' : '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>';
      muteBtn.classList.toggle("is-active", am.volume <= 0.01);
    }
    if (coverBtn) {
      coverBtn.classList.toggle("is-active", this.showCoverShowcase);
    }
    if (fsBtn) {
      fsBtn.classList.toggle("is-active", this.isFullscreen);
    }
  }

  toggleFullscreenMode() {
    this.isFullscreen = !this.isFullscreen;
    if (this.root) {
      if (this.isFullscreen) {
        this.ensureBackgroundLyricFeeder();
        this.mountStage(document.body);
        if (this.compiledLines.length > 0) this.buildCodeDOM();
        document.body.classList.toggle("cider-ide-lyrics-active", this.enabled);
      } else {
        const lyricHost = this.findLyricHost();
        if (lyricHost) {
          this.mountStage(lyricHost);
          if (this.compiledLines.length > 0) this.buildCodeDOM();
          document.body.classList.toggle("cider-ide-lyrics-active", this.enabled);
        } else {
          this.mountStage(null);
        }
      }
    }
    const pillFsBtn = this.pill?.querySelector('button[data-act="toggle-fs"]');
    if (pillFsBtn) pillFsBtn.classList.toggle("is-on", this.isFullscreen);
    if (this.pill) this.pill.classList.toggle("is-fullscreen", this.isFullscreen);
    this.resizeCanvas();
    this.updatePlayerDockUI();
  }

  mountFloatingControlPill() {
    if (this.pill) this.pill.remove();
    this.pill = document.createElement("div");
    this.pill.id = "cider-ide-floating-pill";
    this.pill.innerHTML = `
      <span class="cider-pill-title" style="display:none !important;"></span>
      <button data-act="toggle-enable" class="${this.enabled ? "is-on" : ""}">${
        this.enabled
          ? "ON"
          : '<span class="pill-long-label">OFF</span><span class="pill-short-label">OFF</span>'
      }</button>
      <button data-act="toggle-theme" class="${this.settings.matchSongTheme ? "is-on" : ""}"><span class="pill-long-label">Song Theme</span><span class="pill-short-label">Theme</span></button>
      <button data-act="cycle-style"><span class="pill-long-label">Style: ${this.settings.syntaxStyle}</span><span class="pill-short-label">${this.settings.syntaxStyle}</span></button>
      <button data-act="toggle-settings" class="${this.settingsPanelOpen ? "is-on" : ""}" title="Visual Settings & Sliders"><span class="pill-long-label">Settings</span><span class="pill-short-label">Settings</span></button>
      <button data-act="toggle-focus" class="${this.settings.dynamicWordZoom ? "is-on" : ""}" title="Focus on active sung word"><span class="pill-long-label">Focus: ${this.settings.dynamicWordZoom ? "ON" : "OFF"}</span><span class="pill-short-label">Focus</span></button>
      <button data-act="toggle-lock" title="Lock Screen / Screensaver Preview (${typeof navigator !== 'undefined' && (/Mac|iPod|iPhone|iPad/.test(navigator.platform) || /Macintosh|Mac OS X/.test(navigator.userAgent)) ? '⌘⌥S' : 'Ctrl+Alt+S'})"><span class="pill-long-label">Lock</span><span class="pill-short-label">Lock</span></button>
      <button data-act="toggle-cover" class="${this.showCoverShowcase ? "is-on" : ""}">Cover</button>
      <button data-act="toggle-clean-feed" class="${this.settings.cleanFeed ? "is-on" : ""}" title="Clean Feed / Edit Recording Mode (E)"><span class="pill-long-label">Clean</span><span class="pill-short-label">Clean</span></button>
      <button data-act="toggle-fs"><span class="pill-long-label">Fullscreen</span><span class="pill-short-label">Full</span></button>
    `;
    this.pill.classList.toggle("is-disabled", !this.enabled);
    if (this._isCompact) this.pill.classList.add("is-compact");
    if (this.settings.cleanFeed) this.pill.classList.add("is-clean-feed");

    this.pill.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      const act = btn.dataset.act;
      if (act === "toggle-enable") {
        this.toggleVisualizerEnable();
      } else if (act === "toggle-theme") {
        this.settings.matchSongTheme = !this.settings.matchSongTheme;
        btn.classList.toggle("is-on", this.settings.matchSongTheme);
        const dockTheme = this.playerDock?.querySelector('button[data-act="toggle-theme"]');
        if (dockTheme) dockTheme.classList.toggle("is-active", this.settings.matchSongTheme);
        try {
          localStorage.setItem("cider_ide_lyrics_visual_settings", JSON.stringify(this.getVisualSettings()));
        } catch {}
        if (!this.settings.matchSongTheme) {
          this._artworkReqId = (this._artworkReqId || 0) + 1;
          this.applyPaletteToCSS(DEFAULT_PALETTE);
        } else {
          this.refreshCurrentTrackArtwork(true);
        }
      } else if (act === "cycle-style") {
        const modes = ["mixed", "oop", "control", "pattern"];
        const idx = (modes.indexOf(this.settings.syntaxStyle) + 1) % modes.length;
        this.settings.syntaxStyle = modes[idx];
        const lSpan = btn.querySelector(".pill-long-label");
        const sSpan = btn.querySelector(".pill-short-label");
        if (lSpan && sSpan) {
          lSpan.textContent = `Style: ${this.settings.syntaxStyle}`;
          sSpan.textContent = this.settings.syntaxStyle;
        } else {
          btn.textContent = `Style: ${this.settings.syntaxStyle}`;
        }
        const dockStyleBtn = this.playerDock?.querySelector('button[data-act="cycle-style"]');
        if (dockStyleBtn) dockStyleBtn.textContent = `${this.settings.syntaxStyle.charAt(0).toUpperCase() + this.settings.syntaxStyle.slice(1)}`;
        try {
          localStorage.setItem("cider_ide_lyrics_visual_settings", JSON.stringify(this.getVisualSettings()));
        } catch {}
        this.lastScrapedSignature = "";
        this.scrapeVisibleCiderLyrics(true);
      } else if (act === "toggle-settings") {
        this.toggleSettingsPanel();
      } else if (act === "toggle-focus") {
        this.toggleFocusMode();
      } else if (act === "toggle-lock") {
        if (this.isLockActive) {
          this.deactivateLockOrScreensaver();
        } else {
          this.activateLockOrScreensaver(true);
        }
      } else if (act === "toggle-cover") {
        this.toggleCoverShowcase();
      } else if (act === "toggle-clean-feed") {
        this.setCleanFeed(!this.settings.cleanFeed);
      } else if (act === "toggle-fs") {
        this.toggleFullscreenMode();
      }
    });

    const lyricHost = this.findLyricHost();
    const targetHost = this.isFullscreen ? document.body : lyricHost;
    if (targetHost) {
      if (this.pill.parentElement !== targetHost) {
        targetHost.appendChild(this.pill);
      }
      this.pill.classList.toggle("is-fullscreen", this.isFullscreen);
      this.pill.style.display = "flex";
    } else {
      this.pill.style.display = "none";
    }
  }

  mountSettingsPanel() {
    if (this.settingsBackdrop) this.settingsBackdrop.remove();
    if (this.settingsPanel) this.settingsPanel.remove();

    const backdrop = document.createElement("div");
    backdrop.id = "cider-ide-settings-backdrop";
    backdrop.style.display = "none";
    backdrop.addEventListener("click", () => this.closeSettingsPanel());

    const panel = document.createElement("div");
    panel.id = "cider-ide-settings-panel";
    panel.style.display = "none";

    const s = this.settings;
    panel.innerHTML = `
      <div class="cider-settings-header">
        <div class="cider-settings-title-group">
          
          <h3 class="cider-settings-title">Visual Settings</h3>
        </div>
        <button class="cider-settings-close-btn" data-act="close-settings" title="Close Settings (Esc)">✕</button>
      </div>

      <div class="cider-settings-body">
        <div class="cider-settings-section">
          <div class="cider-settings-section-title">Perspective Angles</div>
          <div class="cider-settings-row">
            <div class="cider-settings-label-row">
              <label for="cider-slider-rotX">Tilt X (Pitch)</label>
              <span class="cider-settings-badge" data-badge="rotX">${Math.round(s.rotX)}°</span>
            </div>
            <input type="range" class="cider-settings-slider" id="cider-slider-rotX" data-setting="rotX" min="-30" max="45" step="1" value="${s.rotX}" />
          </div>
          <div class="cider-settings-row">
            <div class="cider-settings-label-row">
              <label for="cider-slider-rotY">Tilt Y (Yaw)</label>
              <span class="cider-settings-badge" data-badge="rotY">${Math.round(s.rotY)}°</span>
            </div>
            <input type="range" class="cider-settings-slider" id="cider-slider-rotY" data-setting="rotY" min="-45" max="45" step="1" value="${s.rotY}" />
          </div>
          <div class="cider-settings-row">
            <div class="cider-settings-label-row">
              <label for="cider-slider-rotZ">Tilt Z (Roll)</label>
              <span class="cider-settings-badge" data-badge="rotZ">${Math.round(s.rotZ)}°</span>
            </div>
            <input type="range" class="cider-settings-slider" id="cider-slider-rotZ" data-setting="rotZ" min="-20" max="20" step="1" value="${s.rotZ}" />
          </div>
        </div>

        <div class="cider-settings-section">
          <div class="cider-settings-section-title">Typography & Spacing</div>
          <div class="cider-settings-row">
            <div class="cider-settings-label-row">
              <label for="cider-slider-fontSize">Font Size</label>
              <span class="cider-settings-badge" data-badge="fontSize">${Math.round(s.fontSize)}px</span>
            </div>
            <input type="range" class="cider-settings-slider" id="cider-slider-fontSize" data-setting="fontSize" min="14" max="64" step="1" value="${s.fontSize}" />
          </div>
          <div class="cider-settings-row">
            <div class="cider-settings-label-row">
              <label for="cider-slider-lineSpacing">Line Spacing</label>
              <span class="cider-settings-badge" data-badge="lineSpacing">${Number(s.lineSpacing).toFixed(2)}x</span>
            </div>
            <input type="range" class="cider-settings-slider" id="cider-slider-lineSpacing" data-setting="lineSpacing" min="0.8" max="2.5" step="0.05" value="${s.lineSpacing}" />
          </div>
          <div class="cider-settings-row">
            <div class="cider-settings-label-row">
              <label for="cider-slider-tokenPadding">Token Padding</label>
              <span class="cider-settings-badge" data-badge="tokenPadding">${Math.round(s.tokenPadding)}px</span>
            </div>
            <input type="range" class="cider-settings-slider" id="cider-slider-tokenPadding" data-setting="tokenPadding" min="0" max="16" step="1" value="${s.tokenPadding}" />
          </div>
          <div class="cider-settings-row">
            <div class="cider-settings-label-row">
              <label for="cider-slider-lineGutter">Line Gutter / Indent</label>
              <span class="cider-settings-badge" data-badge="lineGutter">${Math.round(s.lineGutter)}%</span>
            </div>
            <input type="range" class="cider-settings-slider" id="cider-slider-lineGutter" data-setting="lineGutter" min="0" max="25" step="1" value="${s.lineGutter}" />
          </div>
        </div>

        <div class="cider-settings-section">
          <div class="cider-settings-section-title">Visual Effects</div>
          <div class="cider-settings-row">
            <div class="cider-settings-label-row">
              <label for="cider-slider-waveAmplitude">Wave Motion</label>
              <span class="cider-settings-badge" data-badge="waveAmplitude">${Number(s.waveAmplitude).toFixed(2)}x</span>
            </div>
            <input type="range" class="cider-settings-slider" id="cider-slider-waveAmplitude" data-setting="waveAmplitude" min="0.0" max="3.0" step="0.05" value="${s.waveAmplitude}" />
          </div>
          <div class="cider-settings-row">
            <div class="cider-settings-label-row">
              <label for="cider-slider-dofStrength">Depth of Field (Blur)</label>
              <span class="cider-settings-badge" data-badge="dofStrength">${Number(s.dofStrength).toFixed(1)}px</span>
            </div>
            <input type="range" class="cider-settings-slider" id="cider-slider-dofStrength" data-setting="dofStrength" min="0.0" max="8.0" step="0.1" value="${s.dofStrength}" />
          </div>
          <div class="cider-settings-row">
            <div class="cider-settings-label-row">
              <label for="cider-slider-glowIntensity">Glow Intensity</label>
              <span class="cider-settings-badge" data-badge="glowIntensity">${Number(s.glowIntensity).toFixed(2)}x</span>
            </div>
            <input type="range" class="cider-settings-slider" id="cider-slider-glowIntensity" data-setting="glowIntensity" min="0.2" max="2.5" step="0.05" value="${s.glowIntensity}" />
          </div>
        </div>

        <div class="cider-settings-section">
          <div class="cider-settings-section-title">Word Zoom & Beat Motion</div>
          <div class="cider-settings-row">
            <div class="cider-settings-label-row">
              <label>Lyric Reveal Mode</label>
              <div class="cider-settings-btn-group" data-group="lyricRevealMode">
                <button type="button" class="cider-group-btn ${(s.lyricRevealMode || 'highlight') === 'highlight' ? 'is-active' : ''}" data-val="highlight">Highlight</button>
                <button type="button" class="cider-group-btn ${s.lyricRevealMode === 'typewriter' ? 'is-active' : ''}" data-val="typewriter">Typewriter</button>
              </div>
            </div>
          </div>
          <div class="cider-settings-row">
            <div class="cider-settings-label-row">
              <label>Active Line Only (Hide past &amp; future lines)</label>
              <button class="cider-settings-toggle-btn ${s.activeLineOnly ? "is-on" : ""}" data-toggle-setting="activeLineOnly">${s.activeLineOnly ? "ON" : "OFF"}</button>
            </div>
          </div>
          <div class="cider-settings-row">
            <div class="cider-settings-label-row">
              <label>Word Zoom (Focus active lyric phrase)</label>
              <button class="cider-settings-toggle-btn ${s.dynamicWordZoom ? "is-on" : ""}" data-toggle-setting="dynamicWordZoom">${s.dynamicWordZoom ? "ON" : "OFF"}</button>
            </div>
          </div>
          <div class="cider-settings-row" data-row-setting="wordZoomScale" style="${s.dynamicWordZoom ? "" : "opacity:0.4; pointer-events:none;"}">
            <div class="cider-settings-label-row">
              <label for="cider-slider-wordZoomScale">Word Zoom Intensity</label>
              <span class="cider-settings-badge" data-badge="wordZoomScale">${Number(s.wordZoomScale ?? 1.25).toFixed(2)}x</span>
            </div>
            <input type="range" class="cider-settings-slider" id="cider-slider-wordZoomScale" data-setting="wordZoomScale" min="1.05" max="1.60" step="0.05" value="${s.wordZoomScale ?? 1.25}" />
          </div>
          <div class="cider-settings-row" data-row-setting="wordTracking" style="${s.dynamicWordZoom ? "" : "opacity:0.4; pointer-events:none;"}">
            <div class="cider-settings-label-row">
              <label>Word-Tracking Camera (Glide with voice)</label>
              <button class="cider-settings-toggle-btn ${s.wordTracking !== false ? "is-on" : ""}" data-toggle-setting="wordTracking">${s.wordTracking !== false ? "ON" : "OFF"}</button>
            </div>
          </div>
          <div class="cider-settings-row" data-row-setting="wordTrackingMode" style="${s.dynamicWordZoom && s.wordTracking !== false ? "" : "opacity:0.4; pointer-events:none;"}">
            <div class="cider-settings-label-row">
              <label>Word Tracking Style</label>
              <div class="cider-settings-btn-group" data-group="wordTrackingMode">
                <button type="button" class="cider-group-btn ${(s.wordTrackingMode || 'stable') === 'stable' ? 'is-active' : ''}" data-val="stable">Stable (Zero Bounce)</button>
                <button type="button" class="cider-group-btn ${s.wordTrackingMode === 'live' ? 'is-active' : ''}" data-val="live">Real-Time (As Sung)</button>
                <button type="button" class="cider-group-btn ${s.wordTrackingMode === 'anticipate' ? 'is-active' : ''}" data-val="anticipate">Anticipate (Glides Ahead)</button>
              </div>
            </div>
          </div>
          <div class="cider-settings-row">
            <div class="cider-settings-label-row">
              <label>Beat Bounce (Pulse on vocal onsets)</label>
              <button class="cider-settings-toggle-btn ${s.beatBounce ? "is-on" : ""}" data-toggle-setting="beatBounce">${s.beatBounce ? "ON" : "OFF"}</button>
            </div>
          </div>
          <div class="cider-settings-row" data-row-setting="bounceIntensity" style="${s.beatBounce ? "" : "opacity:0.4; pointer-events:none;"}">
            <div class="cider-settings-label-row">
              <label for="cider-slider-bounceIntensity">Bounce Punch</label>
              <span class="cider-settings-badge" data-badge="bounceIntensity">${Number(s.bounceIntensity ?? 1.2).toFixed(2)}x</span>
            </div>
            <input type="range" class="cider-settings-slider" id="cider-slider-bounceIntensity" data-setting="bounceIntensity" min="0.2" max="2.5" step="0.05" value="${s.bounceIntensity ?? 1.2}" />
          </div>
        </div>

        <div class="cider-settings-section">
          <div class="cider-settings-section-title">Edit Studio &amp; Immersion</div>
          <div class="cider-settings-row">
            <div class="cider-settings-label-row">
              <label>Clean Feed (Hide UI Chrome — Hotkey E)</label>
              <button type="button" class="cider-settings-toggle-btn ${s.cleanFeed ? "is-on" : ""}" data-toggle-setting="cleanFeed">${s.cleanFeed ? "ON" : "OFF"}</button>
            </div>
          </div>
          <div class="cider-settings-row">
            <div class="cider-settings-label-row">
              <label>Background Style</label>
              <div class="cider-settings-btn-group" data-group="backdropMode" style="flex-wrap:wrap;">
                <button type="button" class="cider-group-btn ${(s.backdropMode || 'ambient') === 'ambient' ? 'is-active' : ''}" data-val="ambient">Waves</button>
                <button type="button" class="cider-group-btn ${s.backdropMode === 'simple' ? 'is-active' : ''}" data-val="simple">Simple</button>
                <button type="button" class="cider-group-btn ${s.backdropMode === 'custom' ? 'is-active' : ''}" data-val="custom">Custom</button>
                <button type="button" class="cider-group-btn ${s.backdropMode === 'vignette' ? 'is-active' : ''}" data-val="vignette">Vignette</button>
                <button type="button" class="cider-group-btn ${s.backdropMode === 'black' ? 'is-active' : ''}" data-val="black">Black</button>
                <button type="button" class="cider-group-btn ${s.backdropMode === 'green' ? 'is-active' : ''}" data-val="green">Green</button>
                <button type="button" class="cider-group-btn ${s.backdropMode === 'blue' ? 'is-active' : ''}" data-val="blue">Blue</button>
              </div>
            </div>
          </div>
          <div class="cider-settings-row" data-row-setting="customBgControls" style="${s.backdropMode === 'custom' ? '' : 'display:none;'}">
            <div class="cider-custom-bg-controls">
              <div class="cider-custom-bg-actions">
                <button type="button" class="cider-custom-bg-btn" data-act="upload-custom-bg">Upload Image / Video</button>
                <button type="button" class="cider-custom-bg-btn" data-act="clear-custom-bg">Clear</button>
                <input type="file" accept="image/*,video/*" data-custom-bg-file style="display:none;" />
              </div>
              <div class="cider-custom-bg-url-row">
                <input type="text" class="cider-custom-bg-url-input" data-custom-bg-url placeholder="Or paste image / video URL (https://...)" value="${(s.customBgUrl && !String(s.customBgUrl).startsWith('data:') && !String(s.customBgUrl).startsWith('blob:')) ? String(s.customBgUrl).replace(/"/g, '&quot;') : ''}" />
                <button type="button" class="cider-custom-bg-btn" data-act="apply-custom-bg-url">Set</button>
              </div>
              <div class="cider-settings-label-row">
                <label for="cider-slider-customBgOpacity">Background Brightness</label>
                <span class="cider-settings-badge" data-badge="customBgOpacity">${Math.round((s.customBgOpacity ?? 0.6) * 100)}%</span>
              </div>
              <input type="range" class="cider-settings-slider" id="cider-slider-customBgOpacity" data-setting="customBgOpacity" min="0.15" max="1" step="0.05" value="${s.customBgOpacity ?? 0.6}" />
              <div class="cider-settings-label-row">
                <label for="cider-slider-customBgBlur">Background Blur</label>
                <span class="cider-settings-badge" data-badge="customBgBlur">${Math.round(s.customBgBlur ?? 0)}px</span>
              </div>
              <input type="range" class="cider-settings-slider" id="cider-slider-customBgBlur" data-setting="customBgBlur" min="0" max="16" step="1" value="${s.customBgBlur ?? 0}" />
            </div>
          </div>
          <div class="cider-settings-row">
            <div class="cider-settings-label-row">
              <label>Edit Framing Ratio</label>
              <div class="cider-settings-btn-group" data-group="frameRatio">
                <button type="button" class="cider-group-btn ${(s.frameRatio || 'off') === 'off' ? 'is-active' : ''}" data-val="off">Off</button>
                <button type="button" class="cider-group-btn ${s.frameRatio === '9:16' ? 'is-active' : ''}" data-val="9:16">9:16</button>
                <button type="button" class="cider-group-btn ${s.frameRatio === '16:9' ? 'is-active' : ''}" data-val="16:9">16:9</button>
                <button type="button" class="cider-group-btn ${s.frameRatio === '1:1' ? 'is-active' : ''}" data-val="1:1">1:1</button>
              </div>
            </div>
          </div>
          <div class="cider-settings-row" data-row-setting="showFrameGuide" style="${(s.frameRatio || 'off') !== 'off' ? "" : "opacity:0.4; pointer-events:none;"}">
            <div class="cider-settings-label-row">
              <label>Show Safe Frame Guide Lines</label>
              <button type="button" class="cider-settings-toggle-btn ${s.showFrameGuide !== false ? "is-on" : ""}" data-toggle-setting="showFrameGuide">${s.showFrameGuide !== false ? "ON" : "OFF"}</button>
            </div>
          </div>
          <div class="cider-settings-row" data-row-setting="cinematicFx" style="${isSolidBackdrop(s.backdropMode) ? "opacity:0.4; pointer-events:none;" : ""}">
            <div class="cider-settings-label-row">
              <label>Cinematic Polish (Motes &amp; Bloom)</label>
              <button type="button" class="cider-settings-toggle-btn ${s.cinematicFx !== false ? "is-on" : ""}" data-toggle-setting="cinematicFx">${s.cinematicFx !== false ? "ON" : "OFF"}</button>
            </div>
          </div>
        </div>

        <div class="cider-settings-section">
          <div class="cider-settings-section-title">Language & Script Direction</div>
          <div class="cider-settings-row">
            <div class="cider-settings-label-row">
              <label>Text Flow Direction</label>
              <div class="cider-settings-btn-group" data-group="textDirection">
                <button type="button" class="cider-group-btn ${(s.textDirection || 'auto') === 'auto' ? 'is-active' : ''}" data-val="auto">Auto</button>
                <button type="button" class="cider-group-btn ${s.textDirection === 'ltr' ? 'is-active' : ''}" data-val="ltr">LTR</button>
                <button type="button" class="cider-group-btn ${s.textDirection === 'rtl' ? 'is-active' : ''}" data-val="rtl">RTL (Persian/Arabic)</button>
              </div>
            </div>
          </div>
          <div class="cider-settings-row">
            <div class="cider-settings-label-row">
              <label>Inline Code Comments (Roman / Trans)</label>
              <div class="cider-settings-btn-group" data-group="annotationMode">
                <button type="button" class="cider-group-btn ${s.annotationMode === 'off' ? 'is-active' : ''}" data-val="off">Off</button>
                <button type="button" class="cider-group-btn ${s.annotationMode === 'roman' ? 'is-active' : ''}" data-val="roman">Roman</button>
                <button type="button" class="cider-group-btn ${s.annotationMode === 'trans' ? 'is-active' : ''}" data-val="trans">Trans</button>
                <button type="button" class="cider-group-btn ${(s.annotationMode || 'both') === 'both' ? 'is-active' : ''}" data-val="both">Both</button>
              </div>
            </div>
          </div>
          <div class="cider-settings-row">
            <div class="cider-settings-label-row">
              <label>Adlibs (Parenthesized &amp; BG)</label>
              <div class="cider-settings-btn-group" data-group="adlibMode">
                <button type="button" class="cider-group-btn ${(s.adlibMode || 'separate') === 'separate' ? 'is-active' : ''}" data-val="separate">Separate</button>
                <button type="button" class="cider-group-btn ${s.adlibMode === 'hide' ? 'is-active' : ''}" data-val="hide">Hide</button>
                <button type="button" class="cider-group-btn ${s.adlibMode === 'inline' ? 'is-active' : ''}" data-val="inline">Inline</button>
              </div>
            </div>
          </div>
          <div class="cider-settings-row">
            <div class="cider-settings-label-row">
              <label>Background Vocals (/* bg: ... */)</label>
              <button type="button" class="cider-settings-toggle-btn ${s.showBackgroundVocals !== false ? 'is-on' : ''}" data-toggle-setting="showBackgroundVocals">${s.showBackgroundVocals !== false ? 'ON' : 'OFF'}</button>
            </div>
          </div>
          <div class="cider-settings-row">
            <div class="cider-settings-label-row">
              <label for="cider-slider-syncOffsetMs">Lyric Sync Offset</label>
              <span class="cider-settings-badge" data-badge="syncOffsetMs">${(s.syncOffsetMs || 0) > 0 ? '+' : ''}${Math.round(s.syncOffsetMs || 0)}ms</span>
            </div>
            <input type="range" class="cider-settings-slider" id="cider-slider-syncOffsetMs" data-setting="syncOffsetMs" min="-1000" max="1000" step="25" value="${s.syncOffsetMs ?? 0}" />
          </div>
        </div>

        <div class="cider-settings-section">
          <div class="cider-settings-section-title">Screensaver & Lock Screen</div>
          <div class="cider-settings-row">
            <div class="cider-settings-label-row">
              <label>Screensaver / Lock Mode</label>
              <div class="cider-settings-btn-group" data-group="idleMode">
                <button type="button" class="cider-group-btn ${s.idleMode === 'off' ? 'is-active' : ''}" data-val="off">Off</button>
                <button type="button" class="cider-group-btn ${s.idleMode === 'screensaver' ? 'is-active' : ''}" data-val="screensaver">Screensaver</button>
                <button type="button" class="cider-group-btn ${s.idleMode === 'lock' ? 'is-active' : ''}" data-val="lock">Lock Screen</button>
              </div>
            </div>
          </div>
          <div class="cider-settings-row">
            <div class="cider-settings-label-row">
              <label>Auto-Idle Timeout (while song plays)</label>
              <div class="cider-settings-btn-group" data-group="idleTimeout">
                <button type="button" class="cider-group-btn ${Number(s.idleTimeout) === 0 ? 'is-active' : ''}" data-val="0">Off</button>
                <button type="button" class="cider-group-btn ${Number(s.idleTimeout) === 30 ? 'is-active' : ''}" data-val="30">30s</button>
                <button type="button" class="cider-group-btn ${Number(s.idleTimeout) === 60 ? 'is-active' : ''}" data-val="60">1m</button>
                <button type="button" class="cider-group-btn ${Number(s.idleTimeout) === 120 ? 'is-active' : ''}" data-val="120">2m</button>
                <button type="button" class="cider-group-btn ${Number(s.idleTimeout) === 300 ? 'is-active' : ''}" data-val="300">5m</button>
              </div>
            </div>
          </div>
          <div class="cider-settings-row" style="margin-top: 6px;">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; flex-wrap: wrap; gap: 8px;">
              <span style="font-size: 11px; color: rgba(255, 255, 255, 0.65);">Quick Trigger: <kbd style="background: rgba(255,255,255,0.12); padding: 2px 6px; border-radius: 4px; font-family: monospace;">${typeof navigator !== 'undefined' && (/Mac|iPod|iPhone|iPad/.test(navigator.platform) || /Macintosh|Mac OS X/.test(navigator.userAgent)) ? '⌘⌥S / Ctrl+Alt+S' : 'Ctrl+Alt+S'}</kbd> or Pill Lock button</span>
              <button type="button" class="cider-settings-btn cider-settings-reset-btn" data-act="preview-lock" style="padding: 4px 12px; font-size: 11px;">Preview Now</button>
            </div>
          </div>
        </div>

        <div class="cider-settings-section">
          <div class="cider-settings-section-title">Keyboard Shortcuts</div>
          <div class="cider-keybinds-list" id="cider-keybinds-list"></div>
          <div class="cider-settings-row" style="margin-top: 6px;">
            <button type="button" class="cider-settings-btn cider-settings-reset-btn" data-act="reset-keybinds" style="width: 100%; text-align: center;">Reset Keybinds to Defaults</button>
          </div>
        </div>
      </div>

      <div class="cider-preset-import-box" data-preset-import-box style="display:none;">
        <textarea class="cider-preset-textarea" data-preset-input rows="3" placeholder="Paste settings preset JSON here..."></textarea>
        <div class="cider-preset-import-actions">
          <button type="button" class="cider-settings-btn cider-settings-reset-btn" data-act="cancel-import-preset">Cancel</button>
          <button type="button" class="cider-settings-btn cider-settings-done-btn" data-act="apply-import-preset">Apply Preset</button>
        </div>
      </div>

      <div class="cider-settings-toast" data-settings-toast role="status" aria-live="polite"></div>

      <div class="cider-settings-footer">
        <div class="cider-settings-footer-actions">
          <button type="button" class="cider-settings-btn cider-settings-preset-btn" data-act="copy-preset" title="Copy visual/layout/theme settings JSON to clipboard">Copy Preset</button>
          <button type="button" class="cider-settings-btn cider-settings-preset-btn" data-act="toggle-import-preset" title="Paste and import a settings preset JSON">Import Preset</button>
          <button type="button" class="cider-settings-btn cider-settings-reset-btn" data-act="reset-defaults">Reset to Defaults</button>
        </div>
        <button type="button" class="cider-settings-btn cider-settings-done-btn" data-act="close-settings">Done</button>
      </div>
    `;

    const handleSliderInput = (e) => {
      const input = e.target.closest("input[data-setting]");
      if (!input) return;
      const key = input.dataset.setting;
      const val = parseFloat(input.value);
      this.settings[key] = val;

      const badge = panel.querySelector(`[data-badge="${key}"]`);
      if (badge) {
        if (key === "rotX" || key === "rotY" || key === "rotZ") badge.textContent = `${Math.round(val)}°`;
        else if (key === "fontSize" || key === "tokenPadding") badge.textContent = `${Math.round(val)}px`;
        else if (key === "lineGutter") badge.textContent = `${Math.round(val)}%`;
        else if (key === "dofStrength") badge.textContent = `${val.toFixed(1)}px`;
        else if (key === "customBgBlur") badge.textContent = `${Math.round(val)}px`;
        else if (key === "customBgOpacity") badge.textContent = `${Math.round(val * 100)}%`;
        else if (key === "syncOffsetMs") badge.textContent = `${val > 0 ? "+" : ""}${Math.round(val)}ms`;
        else badge.textContent = `${val.toFixed(2)}x`;
      }

      this.applyVisualSettings();
      if (key === "syncOffsetMs" && this.compiledLines?.length) {
        this.syncWordCursor(this.getSyncAdjustedTime(this.domSyncedTime ?? this.currentTime), true);
      }
      try {
        localStorage.setItem("cider_ide_lyrics_visual_settings", JSON.stringify(this.getVisualSettings()));
      } catch (err) {}
    };

    panel.addEventListener("input", handleSliderInput);
    panel.addEventListener("change", handleSliderInput);

    panel.addEventListener("click", (e) => {
      const groupBtn = e.target.closest(".cider-group-btn");
      if (groupBtn) {
        const group = groupBtn.closest("[data-group]");
        if (group) {
          const key = group.dataset.group;
          let val = groupBtn.dataset.val;
          if (key === "idleTimeout") val = parseInt(val, 10);
          else if (key === "backdropMode") val = normalizeBackdropMode(val);
          else if (key === "frameRatio") val = normalizeFrameRatio(val);
          else if (key === "lyricRevealMode") val = normalizeRevealMode(val);
          this.settings[key] = val;
          group.querySelectorAll(".cider-group-btn").forEach((b) => b.classList.remove("is-active"));
          groupBtn.classList.add("is-active");
          if (key === "lyricRevealMode") {
            try {
              localStorage.setItem("cider_ide_reveal_mode", val);
            } catch (err) {}
            this._lastTypingSig = "";
            this.applyVisualSettings();
            if (this.compiledLines?.length) {
              this.syncWordCursor(this.getSyncAdjustedTime(this.domSyncedTime ?? this.currentTime), true);
            }
          } else if (key === "textDirection") {
            const RTL_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u0590-\u05FF]/u;
            if (val === "rtl") this.isRtlSong = true;
            else if (val === "ltr") this.isRtlSong = false;
            else this.isRtlSong = (this.compiledLines || []).some(l => RTL_REGEX.test(l.text || ""));
            if (this.codePlane) this.codePlane.classList.toggle("is-rtl", !!this.isRtlSong);
            (this.cachedLineNodes || []).forEach((node, idx) => {
              const el = node?.row || node;
              const lineObj = this.compiledLines?.[idx];
              const rowRtl = val === "ltr" ? false : (val === "rtl" ? true : Boolean(this.isRtlSong || lineObj?.isRtl));
              if (el?.classList) el.classList.toggle("is-rtl", rowRtl);
            });
            this.applyVisualSettings();
          } else if (key === "annotationMode") {
            this.buildCodeDOM();
            if (this.compiledLines?.length) {
              this.syncWordCursor(this.getSyncAdjustedTime(this.domSyncedTime ?? this.currentTime), true);
            }
          } else if (key === "adlibMode") {
            if (Array.isArray(this._lastRawLyrics) && this._lastRawLyrics.length > 0) {
              this.compiledLines = this.compileLyricsArray(this._lastRawLyrics);
            }
            this.buildCodeDOM();
            if (this.compiledLines?.length) {
              this.syncWordCursor(this.getSyncAdjustedTime(this.domSyncedTime ?? this.currentTime), true);
            }
          } else if (key === "backdropMode" || key === "frameRatio") {
            this.syncEditStudioDependentRows(panel);
            this.applyVisualSettings();
          }
          try {
            localStorage.setItem("cider_ide_lyrics_visual_settings", JSON.stringify(this.getVisualSettings()));
          } catch (err) {}
          return;
        }
      }

      const toggleSettingBtn = e.target.closest("button[data-toggle-setting]");
      if (toggleSettingBtn) {
        const settingKey = toggleSettingBtn.dataset.toggleSetting;
        if (settingKey === "cleanFeed") {
          this.setCleanFeed(!this.settings.cleanFeed);
          return;
        }
        const defaultTrueKeys = ["wordTracking", "showBackgroundVocals", "showFrameGuide", "cinematicFx"];
        if (defaultTrueKeys.includes(settingKey)) {
          this.settings[settingKey] = this.settings[settingKey] === false;
        } else {
          this.settings[settingKey] = !this.settings[settingKey];
        }
        const isSettingOn = defaultTrueKeys.includes(settingKey)
          ? this.settings[settingKey] !== false
          : !!this.settings[settingKey];
        toggleSettingBtn.classList.toggle("is-on", isSettingOn);
        toggleSettingBtn.textContent = isSettingOn ? "ON" : "OFF";

        if (settingKey === "showBackgroundVocals") {
          this.buildCodeDOM();
          if (this.compiledLines?.length) {
            this.syncWordCursor(this.getSyncAdjustedTime(this.domSyncedTime ?? this.currentTime), true);
          }
        }
        if (settingKey === "dynamicWordZoom" || settingKey === "wordTracking") {
          this.syncFocusDependentRows(panel);
          if (settingKey === "dynamicWordZoom") {
            this.updatePillFocusState();
          }
        } else if (settingKey === "beatBounce") {
          const row = panel.querySelector('[data-row-setting="bounceIntensity"]');
          if (row) {
            row.style.opacity = this.settings.beatBounce ? "1" : "0.4";
            row.style.pointerEvents = this.settings.beatBounce ? "auto" : "none";
          }
        }
        try {
          localStorage.setItem("cider_ide_lyrics_visual_settings", JSON.stringify(this.getVisualSettings()));
        } catch (err) {}
        this.applyVisualSettings();
        return;
      }

      const btn = e.target.closest("button[data-act]");
      if (!btn) return;
      const act = btn.dataset.act;
      if (act === "close-settings") {
        this.closeSettingsPanel();
      } else if (act === "preview-lock") {
        this.closeSettingsPanel();
        this.activateLockOrScreensaver(true);
      } else if (act === "reset-defaults") {
        this.resetVisualSettings();
      } else if (act === "copy-preset") {
        this.copySettingsPreset();
      } else if (act === "toggle-import-preset") {
        const box = panel.querySelector("[data-preset-import-box]");
        const input = panel.querySelector("[data-preset-input]");
        if (box) {
          const isOpen = box.style.display !== "none";
          box.style.display = isOpen ? "none" : "flex";
          if (!isOpen && input) {
            input.value = "";
            input.focus();
          }
        }
      } else if (act === "cancel-import-preset") {
        const box = panel.querySelector("[data-preset-import-box]");
        if (box) box.style.display = "none";
      } else if (act === "apply-import-preset") {
        const input = panel.querySelector("[data-preset-input]");
        const box = panel.querySelector("[data-preset-import-box]");
        const res = this.importSettingsPreset(input?.value || "");
        if (res.ok && box) {
          box.style.display = "none";
          if (input) input.value = "";
        }
      } else if (act === "upload-custom-bg") {
        const fileInput = panel.querySelector("input[data-custom-bg-file]");
        if (fileInput) fileInput.click();
      } else if (act === "apply-custom-bg-url") {
        const urlInput = panel.querySelector("input[data-custom-bg-url]");
        const url = (urlInput?.value || "").trim();
        if (url) {
          this.setCustomBackground(url, /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url) ? "video" : "image");
        }
      } else if (act === "clear-custom-bg") {
        this.clearCustomBackground();
        const urlInput = panel.querySelector("input[data-custom-bg-url]");
        if (urlInput) urlInput.value = "";
      } else if (act === "reset-keybinds") {
        this.keybinds = Object.assign({}, DEFAULT_KEYBINDS);
        try {
          localStorage.removeItem("cider_ide_lyrics_keybinds");
        } catch (err) {}
        this.recordingKeybindAction = null;
        this.renderKeybindsList();
      }
    });

    const customBgFileInput = panel.querySelector("input[data-custom-bg-file]");
    if (customBgFileInput) {
      customBgFileInput.addEventListener("change", (ev) => {
        const file = ev.target?.files?.[0];
        if (file) this.handleCustomBgFile(file);
        ev.target.value = "";
      });
    }

    this.settingsBackdrop = backdrop;
    this.settingsPanel = panel;

    if (this.root) {
      this.root.appendChild(backdrop);
      this.root.appendChild(panel);
    }
  }

  openSettingsPanel() {
    if (!this.settingsPanel || !this.settingsBackdrop) {
      this.mountSettingsPanel();
    }
    if (this.root && this.settingsPanel.parentElement !== this.root) {
      this.root.appendChild(this.settingsBackdrop);
      this.root.appendChild(this.settingsPanel);
    }
    this.syncSettingsPanelInputs();
    this.renderKeybindsList();
    this.settingsBackdrop.style.display = "block";
    this.settingsPanel.style.display = "flex";
    this.settingsPanelOpen = true;

    const pillSettings = this.pill?.querySelector('button[data-act="toggle-settings"]');
    if (pillSettings) pillSettings.classList.add("is-on");
    const dockSettings = this.playerDock?.querySelector('button[data-act="toggle-settings"]');
    if (dockSettings) dockSettings.classList.add("is-active");
    this.clearCursorIdleState();
  }

  closeSettingsPanel() {
    if (this.settingsPanel) {
      this.settingsPanel.style.display = "none";
      const importBox = this.settingsPanel.querySelector("[data-preset-import-box]");
      if (importBox) importBox.style.display = "none";
    }
    if (this.settingsBackdrop) this.settingsBackdrop.style.display = "none";
    this.settingsPanelOpen = false;
    this.recordingKeybindAction = null;

    const pillSettings = this.pill?.querySelector('button[data-act="toggle-settings"]');
    if (pillSettings) pillSettings.classList.remove("is-on");
    const dockSettings = this.playerDock?.querySelector('button[data-act="toggle-settings"]');
    if (dockSettings) dockSettings.classList.remove("is-active");
    this.resetCursorIdleTimer();
  }

  toggleSettingsPanel() {
    if (this.settingsPanelOpen) {
      this.closeSettingsPanel();
    } else {
      this.openSettingsPanel();
    }
  }

  toggleFocusMode(forceState) {
    this.settings.dynamicWordZoom = typeof forceState === "boolean"
      ? forceState
      : !this.settings.dynamicWordZoom;
    try {
      localStorage.setItem("cider_ide_lyrics_visual_settings", JSON.stringify(this.getVisualSettings()));
    } catch {}
    this.updatePillFocusState();
    this.syncSettingsPanelInputs();
    this.applyVisualSettings();
  }

  syncFocusDependentRows(panel = this.settingsPanel) {
    if (!panel) return;
    const focusOn = !!this.settings.dynamicWordZoom;
    const trackingOn = focusOn && this.settings.wordTracking !== false;
    const rowZoom = panel.querySelector('[data-row-setting="wordZoomScale"]');
    if (rowZoom) {
      rowZoom.style.opacity = focusOn ? "1" : "0.4";
      rowZoom.style.pointerEvents = focusOn ? "auto" : "none";
    }
    const rowTrack = panel.querySelector('[data-row-setting="wordTracking"]');
    if (rowTrack) {
      rowTrack.style.opacity = focusOn ? "1" : "0.4";
      rowTrack.style.pointerEvents = focusOn ? "auto" : "none";
    }
    const rowTrackMode = panel.querySelector('[data-row-setting="wordTrackingMode"]');
    if (rowTrackMode) {
      rowTrackMode.style.opacity = trackingOn ? "1" : "0.4";
      rowTrackMode.style.pointerEvents = trackingOn ? "auto" : "none";
    }
  }

  updatePillFocusState() {
    const isOn = !!this.settings.dynamicWordZoom;
    if (this.pill) {
      const focusBtn = this.pill.querySelector('button[data-act="toggle-focus"]');
      if (focusBtn) {
        focusBtn.classList.toggle("is-on", isOn);
        focusBtn.setAttribute("aria-pressed", isOn ? "true" : "false");
        const lSpan = focusBtn.querySelector(".pill-long-label");
        if (lSpan) lSpan.textContent = `Focus: ${isOn ? "ON" : "OFF"}`;
      }
    }
    const dockFocusBtn = this.playerDock?.querySelector('button[data-act="toggle-focus"]');
    if (dockFocusBtn) {
      dockFocusBtn.classList.toggle("is-active", isOn);
      dockFocusBtn.setAttribute("aria-pressed", isOn ? "true" : "false");
    }
  }

  matchesKeybind(e, kb) {
    if (!kb) return false;
    const keyLower = (e.key || "").toLowerCase();
    const codeMatch = kb.code && e.code === kb.code;
    const keyMatch = kb.key && keyLower === kb.key.toLowerCase();
    if (!codeMatch && !keyMatch) return false;

    const hasCtrlOrCmd = e.ctrlKey || e.metaKey;
    const needCtrl = !!(kb.ctrl || kb.meta);
    if (hasCtrlOrCmd !== needCtrl) return false;
    if (!!e.altKey !== !!kb.alt) return false;
    if (!!e.shiftKey !== !!kb.shift) return false;
    return true;
  }

  formatKeyDisplay(e) {
    const isMac = typeof navigator !== "undefined" && (/Mac|iPod|iPhone|iPad/.test(navigator.platform) || /Macintosh|Mac OS X/.test(navigator.userAgent));
    const parts = [];
    if (e.ctrlKey) parts.push(isMac ? "⌃" : "Ctrl");
    if (e.altKey) parts.push(isMac ? "⌥" : "Alt");
    if (e.shiftKey) parts.push(isMac ? "⇧" : "Shift");
    if (e.metaKey) parts.push(isMac ? "⌘" : "Cmd");

    let keyName = e.key;
    if (e.code === "Space" || keyName === " ") keyName = "Space";
    else if (e.code === "ArrowRight") keyName = "→";
    else if (e.code === "ArrowLeft") keyName = "←";
    else if (e.code === "ArrowUp") keyName = "↑";
    else if (e.code === "ArrowDown") keyName = "↓";
    else if (keyName.length === 1) keyName = keyName.toUpperCase();

    parts.push(keyName);
    return isMac ? parts.join("") : parts.join(" + ");
  }

  renderKeybindsList() {
    if (!this.settingsPanel) return;
    const list = this.settingsPanel.querySelector("#cider-keybinds-list");
    if (!list) return;
    list.innerHTML = "";

    Object.keys(this.keybinds).forEach((actKey) => {
      const item = this.keybinds[actKey];
      const row = document.createElement("div");
      row.className = "cider-keybind-row";

      const action = document.createElement("span");
      action.className = "cider-keybind-action";
      action.textContent = item.name || actKey;

      const badge = document.createElement("button");
      badge.type = "button";
      badge.className = "cider-keybind-badge" + (this.recordingKeybindAction === actKey ? " is-recording" : "");
      badge.textContent = this.recordingKeybindAction === actKey ? "Press key..." : item.label;
      badge.dataset.actKey = actKey;

      badge.addEventListener("click", (e) => {
        e.stopPropagation();
        if (this.recordingKeybindAction === actKey) {
          this.recordingKeybindAction = null;
        } else {
          this.recordingKeybindAction = actKey;
        }
        this.renderKeybindsList();
      });

      row.appendChild(action);
      row.appendChild(badge);
      list.appendChild(row);
    });
  }

  syncSettingsPanelInputs() {
    if (!this.settingsPanel) return;
    const s = this.settings;
    const inputs = this.settingsPanel.querySelectorAll("input[data-setting]");
    inputs.forEach((input) => {
      const key = input.dataset.setting;
      if (typeof s[key] === "number") {
        input.value = s[key];
        const badge = this.settingsPanel.querySelector(`[data-badge="${key}"]`);
        if (badge) {
          const val = s[key];
          if (key === "rotX" || key === "rotY" || key === "rotZ") badge.textContent = `${Math.round(val)}°`;
          else if (key === "fontSize" || key === "tokenPadding" || key === "customBgBlur") badge.textContent = `${Math.round(val)}px`;
          else if (key === "lineGutter") badge.textContent = `${Math.round(val)}%`;
          else if (key === "customBgOpacity") badge.textContent = `${Math.round(val * 100)}%`;
          else if (key === "dofStrength") badge.textContent = `${val.toFixed(1)}px`;
          else if (key === "syncOffsetMs") badge.textContent = `${val > 0 ? "+" : ""}${Math.round(val)}ms`;
          else badge.textContent = `${val.toFixed(2)}x`;
        }
      }
    });

    const toggles = this.settingsPanel.querySelectorAll("button[data-toggle-setting]");
    const defaultTrueKeys = ["wordTracking", "showBackgroundVocals", "showFrameGuide", "cinematicFx"];
    toggles.forEach((tBtn) => {
      const key = tBtn.dataset.toggleSetting;
      const isOn = defaultTrueKeys.includes(key) ? s[key] !== false : !!s[key];
      tBtn.classList.toggle("is-on", isOn);
      tBtn.textContent = isOn ? "ON" : "OFF";
      if (key === "beatBounce") {
        const row = this.settingsPanel.querySelector('[data-row-setting="bounceIntensity"]');
        if (row) {
          row.style.opacity = isOn ? "1" : "0.4";
          row.style.pointerEvents = isOn ? "auto" : "none";
        }
      }
    });
    this.syncFocusDependentRows(this.settingsPanel);
    this.syncEditStudioDependentRows(this.settingsPanel);

    const btnGroups = this.settingsPanel.querySelectorAll("[data-group]");
    btnGroups.forEach((group) => {
      const key = group.dataset.group;
      const curVal = String(s[key]);
      group.querySelectorAll(".cider-group-btn").forEach((btn) => {
        btn.classList.toggle("is-active", btn.dataset.val === curVal);
      });
    });
    this.renderKeybindsList();
  }

  applyVisualSettings() {
    if (!this.root) return;
    const s = this.settings;
    const isTypewriter = normalizeRevealMode(s.lyricRevealMode) === "typewriter";
    this.root.classList.toggle("is-active-line-only", Boolean(s.activeLineOnly));
    this.root.classList.toggle("is-typewriter", isTypewriter);
    if (this.codePlane) {
      this.codePlane.classList.toggle("is-typewriter", isTypewriter);
    }
    this.applyEditStudioState();
    const lineSpacingMult = typeof s.lineSpacing === "number" ? s.lineSpacing : 1.0;
    const tokenPad = typeof s.tokenPadding === "number" ? s.tokenPadding : 4;
    const gutterPercent = typeof s.lineGutter === "number" ? s.lineGutter : 4;
    const glow = typeof s.glowIntensity === "number" ? s.glowIntensity : 1.0;
    const dofRaw = typeof s.dofStrength === "number" ? s.dofStrength : 0.55;
    const dofMult = s.linuxLowSpecMode ? dofRaw * 0.35 : dofRaw;

    this.root.style.setProperty("--ide-line-height", (1.48 * lineSpacingMult).toFixed(3));
    this.root.style.setProperty("--ide-line-margin", `${(0.2 * lineSpacingMult).toFixed(3)}em`);
    this.root.style.setProperty("--ide-line-height-compact", (1.36 * lineSpacingMult).toFixed(3));
    this.root.style.setProperty("--ide-line-margin-compact", `${(0.12 * lineSpacingMult).toFixed(3)}em`);
    this.root.style.setProperty("--ide-token-padding", `${Math.max(0, tokenPad * 0.35).toFixed(1)}px ${tokenPad}px`);
    this.root.style.setProperty("--ide-token-padding-compact", `${Math.max(0, tokenPad * 0.2).toFixed(1)}px ${Math.max(1, Math.round(tokenPad * 0.65))}px`);
    this.root.style.setProperty("--ide-plane-padding-left", `${gutterPercent}%`);
    this.root.style.setProperty("--ide-glow-mult", glow.toFixed(2));
    this.root.style.setProperty("--ide-dof-mult", dofMult.toFixed(2));

    if (this.codePlane) {
      this.codePlane.style.paddingLeft = `${gutterPercent}%`;
      const isCompact = this._isCompact ?? this.root.classList.contains("is-compact");
      if (!s.dynamicWordZoom || isCompact) {
        this.currentCameraZoom = 1.0;
        this.currentPanX = 0;
        this.targetPanX = 0;
        this.sustainedPanX = 0;
        this.root.classList.remove("is-vocal-zoomed");
      } else if (!this.rafId && this.isCurrentlySpeaking) {
        this.currentCameraZoom = typeof s.wordZoomScale === "number" ? s.wordZoomScale : 1.25;
        this.root.classList.toggle("is-vocal-zoomed", this.currentCameraZoom > 1.05);
      }
      if (isCompact) {
        this.codePlane.style.transform = `translateY(${this.currentScrollRem.toFixed(1)}px)`;
      } else {
        const rotX = s.rotX ?? 14;
        const rotY = s.rotY ?? -12;
        const rotZ = s.rotZ ?? -4;
        const zoom = this.currentCameraZoom ?? 1.0;
        const bounceMult = typeof s.bounceIntensity === "number" ? s.bounceIntensity : 1.2;
        const bounceZ = s.beatBounce ? (this.audioState.bassPulse * 16 * bounceMult) : 0;
        const bounceScale = s.beatBounce ? (this.audioState.bassPulse * 0.024 * bounceMult) : 0;
        const totalScale = (zoom + bounceScale);
        const effectiveRotY = this.isRtlSong ? -rotY : rotY;
        const panX = this.currentPanX ?? 0;

        this.codePlane.style.transform = `
          translate3d(${panX.toFixed(1)}px, ${this.currentScrollRem.toFixed(1)}px, 0px)
          rotateX(${rotX.toFixed(1)}deg)
          rotateY(${effectiveRotY.toFixed(1)}deg)
          rotateZ(${rotZ.toFixed(1)}deg)
          translateZ(${bounceZ.toFixed(1)}px)
          scale(${totalScale.toFixed(3)})
        `;
      }
    }
    this.resizeCanvas();
    this.updateTokenVisuals();
  }

  resetVisualSettings() {
    Object.assign(this.settings, this.defaultVisualSettings);
    const RTL_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u0590-\u05FF]/u;
    const dir = this.settings.textDirection || "auto";
    if (dir === "rtl") this.isRtlSong = true;
    else if (dir === "ltr") this.isRtlSong = false;
    else this.isRtlSong = (this.compiledLines || []).some(l => l.isRtl || RTL_REGEX.test(l.text || ""));
    try {
      localStorage.setItem("cider_ide_lyrics_visual_settings", JSON.stringify(this.getVisualSettings()));
      localStorage.setItem("cider_ide_reveal_mode", normalizeRevealMode(this.settings.lyricRevealMode));
    } catch (e) {}
    this.syncSettingsPanelInputs();
    this.updatePillFocusState();
    if (this.compiledLines?.length > 0) {
      this.buildCodeDOM();
      this.syncWordCursor(this.getSyncAdjustedTime(this.domSyncedTime ?? this.currentTime), true);
    }
    this.applyVisualSettings();
  }

  showSettingsToast(message, variant = "success") {
    const toastEl = this.settingsPanel?.querySelector("[data-settings-toast]");
    if (!toastEl) return;
    toastEl.textContent = String(message || "");
    toastEl.classList.remove("is-success", "is-error");
    toastEl.classList.add(variant === "error" ? "is-error" : "is-success", "is-visible");
    if (this._settingsToastTimer) clearTimeout(this._settingsToastTimer);
    this._settingsToastTimer = setTimeout(() => {
      toastEl.classList.remove("is-visible");
      this._settingsToastTimer = null;
    }, 2400);
  }

  exportSettingsPreset() {
    const visual = this.getVisualSettings();
    const safeVisual = { ...visual };
    if (
      typeof safeVisual.customBgUrl === "string" &&
      (safeVisual.customBgUrl.startsWith("blob:") || safeVisual.customBgUrl.length > 4096)
    ) {
      safeVisual.customBgUrl = "";
    }
    return JSON.stringify(
      {
        presetVersion: 1,
        app: "cider-ide-lyrics",
        settings: safeVisual,
        showCoverShowcase: Boolean(this.showCoverShowcase)
      },
      null,
      2
    );
  }

  copySettingsPreset() {
    const json = this.exportSettingsPreset();
    const fallbackCopy = () => {
      try {
        const ta = document.createElement("textarea");
        ta.value = json;
        ta.setAttribute("readonly", "");
        ta.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0;";
        document.body.appendChild(ta);
        ta.select();
        const ok = typeof document.execCommand === "function" && document.execCommand("copy");
        ta.remove();
        return Boolean(ok);
      } catch {
        return false;
      }
    };

    if (typeof navigator !== "undefined" && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      navigator.clipboard.writeText(json).then(
        () => this.showSettingsToast("Preset JSON copied to clipboard!", "success"),
        () => {
          if (fallbackCopy()) this.showSettingsToast("Preset JSON copied to clipboard!", "success");
          else this.showSettingsToast("Could not access clipboard", "error");
        }
      );
    } else if (fallbackCopy()) {
      this.showSettingsToast("Preset JSON copied to clipboard!", "success");
    } else {
      this.showSettingsToast("Clipboard unavailable", "error");
    }
    return json;
  }

  importSettingsPreset(rawText) {
    const text = typeof rawText === "string" ? rawText.trim() : "";
    if (!text) {
      this.showSettingsToast("Paste a preset JSON first", "error");
      return { ok: false, error: "Empty preset input" };
    }
    if (text.length > 65536) {
      this.showSettingsToast("Preset JSON is too large", "error");
      return { ok: false, error: "Preset exceeds size limit" };
    }
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      this.showSettingsToast("Invalid JSON format", "error");
      return { ok: false, error: "Invalid JSON syntax" };
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      this.showSettingsToast("Preset must be a JSON object", "error");
      return { ok: false, error: "Root must be a JSON object" };
    }

    const src =
      parsed.settings && typeof parsed.settings === "object" && !Array.isArray(parsed.settings)
        ? parsed.settings
        : parsed;

    const numRanges = {
      rotX: [-30, 45],
      rotY: [-45, 45],
      rotZ: [-20, 20],
      fontSize: [14, 64],
      lineSpacing: [0.8, 2.5],
      tokenPadding: [0, 16],
      lineGutter: [0, 25],
      waveAmplitude: [0, 3.0],
      dofStrength: [0, 8.0],
      glowIntensity: [0.2, 2.5],
      wordZoomScale: [1.05, 1.6],
      bounceIntensity: [0.2, 2.5],
      syncOffsetMs: [-1000, 1000],
      customBgOpacity: [0.15, 1.0],
      customBgBlur: [0, 16]
    };
    const boolKeys = new Set([
      "matchSongTheme",
      "audioMoodShift",
      "dynamicWordZoom",
      "wordTracking",
      "beatBounce",
      "showBackgroundVocals",
      "activeLineOnly",
      "showFrameGuide",
      "cinematicFx"
    ]);
    const enumMaps = {
      syntaxStyle: ["mixed", "oop", "control", "pattern"],
      lyricRevealMode: ["highlight", "typewriter"],
      wordTrackingMode: ["stable", "live", "anticipate"],
      idleMode: ["off", "screensaver", "lock"],
      textDirection: ["auto", "ltr", "rtl"],
      annotationMode: ["off", "roman", "trans", "both"],
      adlibMode: ["separate", "hide", "inline"],
      backdropMode: VALID_BACKDROP_MODES,
      customBgType: ["image", "video"],
      frameRatio: VALID_FRAME_RATIOS
    };
    const validIdleTimeouts = [0, 30, 60, 120, 300];
    const validated = {};
    let appliedCount = 0;

    for (const [k, v] of Object.entries(src)) {
      if (k === "__proto__" || k === "constructor" || k === "prototype" || k === "cleanFeed") continue;
      if (Object.prototype.hasOwnProperty.call(numRanges, k)) {
        const n = Number(v);
        if (Number.isFinite(n)) {
          const [min, max] = numRanges[k];
          validated[k] = Math.max(min, Math.min(max, n));
          appliedCount++;
        }
      } else if (k === "idleTimeout") {
        const n = parseInt(v, 10);
        if (validIdleTimeouts.includes(n)) {
          validated[k] = n;
          appliedCount++;
        }
      } else if (boolKeys.has(k)) {
        if (typeof v === "boolean") {
          validated[k] = v;
          appliedCount++;
        }
      } else if (Object.prototype.hasOwnProperty.call(enumMaps, k)) {
        if (typeof v === "string" && enumMaps[k].includes(v)) {
          validated[k] = v;
          appliedCount++;
        }
      } else if (k === "customBgUrl") {
        if (typeof v === "string") {
          const trimmed = v.trim();
          if (trimmed === "" || /^https?:\/\//i.test(trimmed)) {
            validated[k] = trimmed;
            appliedCount++;
          }
        }
      }
    }

    const hasCoverToggle = typeof parsed.showCoverShowcase === "boolean";
    if (appliedCount === 0 && !hasCoverToggle) {
      this.showSettingsToast("No valid preset settings found", "error");
      return { ok: false, error: "No recognized settings in preset" };
    }

    const prevTheme = this.settings.matchSongTheme;
    const prevStyle = this.settings.syntaxStyle;
    const prevAdlib = this.settings.adlibMode;
    const prevAnno = this.settings.annotationMode;
    const prevBgVocals = this.settings.showBackgroundVocals;
    const prevDir = this.settings.textDirection;

    Object.assign(this.settings, validated);
    this.settings.lyricRevealMode = normalizeRevealMode(this.settings.lyricRevealMode);
    this.settings.backdropMode = normalizeBackdropMode(this.settings.backdropMode);
    this.settings.frameRatio = normalizeFrameRatio(this.settings.frameRatio);

    if (hasCoverToggle) {
      this.showCoverShowcase = parsed.showCoverShowcase;
      const pillCoverBtn = this.pill?.querySelector('button[data-act="toggle-cover"]');
      if (pillCoverBtn) pillCoverBtn.classList.toggle("is-on", this.showCoverShowcase);
      appliedCount++;
    }

    // Sync pill & dock theme/style buttons
    const pillThemeBtn = this.pill?.querySelector('button[data-act="toggle-theme"]');
    if (pillThemeBtn) pillThemeBtn.classList.toggle("is-on", this.settings.matchSongTheme !== false);
    const dockThemeBtn = this.playerDock?.querySelector('button[data-act="toggle-theme"]');
    if (dockThemeBtn) dockThemeBtn.classList.toggle("is-active", this.settings.matchSongTheme !== false);

    const pillStyleBtn = this.pill?.querySelector('button[data-act="cycle-style"]');
    if (pillStyleBtn) {
      const lSpan = pillStyleBtn.querySelector(".pill-long-label");
      const sSpan = pillStyleBtn.querySelector(".pill-short-label");
      if (lSpan && sSpan) {
        lSpan.textContent = `Style: ${this.settings.syntaxStyle}`;
        sSpan.textContent = this.settings.syntaxStyle;
      }
    }
    const dockStyleBtn = this.playerDock?.querySelector('button[data-act="cycle-style"]');
    if (dockStyleBtn) {
      dockStyleBtn.textContent = `${this.settings.syntaxStyle.charAt(0).toUpperCase() + this.settings.syntaxStyle.slice(1)}`;
    }

    if (this.settings.matchSongTheme !== prevTheme) {
      if (!this.settings.matchSongTheme) {
        this._artworkReqId = (this._artworkReqId || 0) + 1;
        this.applyPaletteToCSS(DEFAULT_PALETTE);
      } else {
        this.refreshCurrentTrackArtwork(true);
      }
    }

    // Update RTL state & rebuild DOM when structural lyric settings change
    const RTL_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u0590-\u05FF]/u;
    const dir = this.settings.textDirection || "auto";
    if (dir === "rtl") this.isRtlSong = true;
    else if (dir === "ltr") this.isRtlSong = false;
    else this.isRtlSong = (this.compiledLines || []).some((l) => l.isRtl || RTL_REGEX.test(l.text || ""));

    try {
      localStorage.setItem("cider_ide_lyrics_visual_settings", JSON.stringify(this.getVisualSettings()));
      localStorage.setItem("cider_ide_reveal_mode", this.settings.lyricRevealMode);
    } catch {}

    const needsRecompile =
      (this.settings.syntaxStyle !== prevStyle || this.settings.adlibMode !== prevAdlib) &&
      Array.isArray(this._lastRawLyrics) &&
      this._lastRawLyrics.length > 0;
    const needsRebuild =
      needsRecompile ||
      this.settings.annotationMode !== prevAnno ||
      this.settings.showBackgroundVocals !== prevBgVocals ||
      this.settings.textDirection !== prevDir;

    if (needsRecompile) {
      this.compiledLines = this.compileLyricsArray(this._lastRawLyrics);
    }
    this._lastTypingSig = "";
    this.syncSettingsPanelInputs();
    this.updatePillFocusState();
    this.applyVisualSettings();
    if (needsRebuild && this.compiledLines?.length > 0) {
      this.buildCodeDOM();
    } else if (this.compiledLines?.length > 0) {
      this.syncWordCursor(this.getSyncAdjustedTime(this.domSyncedTime ?? this.currentTime), true);
    }
    this.updatePlayerDockUI();
    this.showSettingsToast(`Preset imported (${appliedCount} settings)`, "success");
    return { ok: true, appliedCount };
  }

  getVisualSettings() {
    return {
      matchSongTheme: this.settings.matchSongTheme !== false,
      syntaxStyle: this.settings.syntaxStyle || "mixed",
      rotX: this.settings.rotX,
      rotY: this.settings.rotY,
      rotZ: this.settings.rotZ,
      fontSize: this.settings.fontSize,
      lineSpacing: this.settings.lineSpacing,
      tokenPadding: this.settings.tokenPadding,
      lineGutter: this.settings.lineGutter,
      waveAmplitude: this.settings.waveAmplitude,
      dofStrength: this.settings.dofStrength,
      glowIntensity: this.settings.glowIntensity,
      dynamicWordZoom: this.settings.dynamicWordZoom,
      wordZoomScale: this.settings.wordZoomScale,
      wordTracking: this.settings.wordTracking ?? true,
      wordTrackingMode: this.settings.wordTrackingMode ?? "stable",
      beatBounce: this.settings.beatBounce,
      bounceIntensity: this.settings.bounceIntensity,
      idleMode: this.settings.idleMode ?? "lock",
      idleTimeout: typeof this.settings.idleTimeout === "number" ? this.settings.idleTimeout : 60,
      textDirection: this.settings.textDirection ?? "auto",
      annotationMode: this.settings.annotationMode ?? "both",
      showBackgroundVocals: this.settings.showBackgroundVocals !== false,
      adlibMode: ["separate", "hide", "inline"].includes(this.settings.adlibMode) ? this.settings.adlibMode : "separate",
      activeLineOnly: Boolean(this.settings.activeLineOnly),
      lyricRevealMode: normalizeRevealMode(this.settings.lyricRevealMode),
      syncOffsetMs: typeof this.settings.syncOffsetMs === "number" ? this.settings.syncOffsetMs : 0,
      backdropMode: normalizeBackdropMode(this.settings.backdropMode),
      customBgUrl: (typeof this.settings.customBgUrl === "string" && !this.settings.customBgUrl.startsWith("blob:")) ? this.settings.customBgUrl : "",
      customBgType: this.settings.customBgType === "video" ? "video" : "image",
      customBgOpacity: typeof this.settings.customBgOpacity === "number" ? this.settings.customBgOpacity : 0.6,
      customBgBlur: typeof this.settings.customBgBlur === "number" ? this.settings.customBgBlur : 0,
      frameRatio: normalizeFrameRatio(this.settings.frameRatio),
      showFrameGuide: this.settings.showFrameGuide !== false,
      cinematicFx: this.settings.cinematicFx !== false
    };
  }

  isCinematicActive() {
    const isCompact = this._isCompact ?? Boolean(this.root?.classList?.contains("is-compact"));
    return this.settings.cinematicFx !== false && !isCompact && !isSolidBackdrop(this.settings.backdropMode);
  }

  setCleanFeed(val) {
    const next = Boolean(val);
    this.settings.cleanFeed = next;
    if (next) {
      if (this.settingsPanelOpen) this.closeSettingsPanel();
      if (this.isLockActive) this.deactivateLockOrScreensaver();
    }
    this.applyEditStudioState();
    this.syncSettingsPanelInputs();
    this.resizeCanvas();
    this.updatePlayerDockUI();
  }

  syncEditStudioDependentRows(panel = this.settingsPanel) {
    if (!panel) return;
    const hasRatio = normalizeFrameRatio(this.settings.frameRatio) !== "off";
    const rowGuide = panel.querySelector('[data-row-setting="showFrameGuide"]');
    if (rowGuide) {
      rowGuide.style.opacity = hasRatio ? "1" : "0.4";
      rowGuide.style.pointerEvents = hasRatio ? "auto" : "none";
    }
    const rowCustomBg = panel.querySelector('[data-row-setting="customBgControls"]');
    if (rowCustomBg) {
      rowCustomBg.style.display = this.settings.backdropMode === "custom" ? "" : "none";
    }
    const solid = isSolidBackdrop(this.settings.backdropMode);
    const rowCin = panel.querySelector('[data-row-setting="cinematicFx"]');
    if (rowCin) {
      rowCin.style.opacity = solid ? "0.4" : "1";
      rowCin.style.pointerEvents = solid ? "none" : "auto";
    }
  }

  updateEditFrameMetrics(w, h) {
    const ratioKey = normalizeFrameRatio(this.settings.frameRatio);
    const R = EDIT_FRAME_RATIO_MAP[ratioKey];
    if (!this.root) return null;
    if (!R || !w || !h) {
      this.root.style.removeProperty("--edit-frame-w");
      this.root.style.removeProperty("--edit-frame-h");
      this.root.style.removeProperty("--edit-plane-max-w");
      if (this.frameGuideLabelEl) this.frameGuideLabelEl.textContent = "";
      return null;
    }
    let frameW;
    let frameH;
    if (w / Math.max(1, h) > R) {
      frameH = Math.round(h * 0.94);
      frameW = Math.round(frameH * R);
    } else {
      frameW = Math.round(w * 0.94);
      frameH = Math.round(frameW / R);
    }
    frameW = Math.min(Math.round(w), Math.max(160, frameW));
    frameH = Math.min(Math.round(h), Math.max(160, frameH));
    const planeMaxW = Math.max(200, Math.round(frameW * 0.88));
    this.root.style.setProperty("--edit-frame-w", `${frameW}px`);
    this.root.style.setProperty("--edit-frame-h", `${frameH}px`);
    this.root.style.setProperty("--edit-plane-max-w", `${planeMaxW}px`);
    if (this.frameGuideLabelEl) {
      this.frameGuideLabelEl.textContent = `${ratioKey} SAFE FRAME`;
    }
    return { frameW, frameH, planeMaxW };
  }

  applyEditStudioState() {
    const mode = normalizeBackdropMode(this.settings.backdropMode);
    const ratio = normalizeFrameRatio(this.settings.frameRatio);
    const solid = isSolidBackdrop(mode);
    const cleanOn = Boolean(this.settings.cleanFeed);
    const showGuide = this.settings.showFrameGuide !== false;
    const cinematicOn = this.isCinematicActive();

    if (this.root) {
      this.root.classList.toggle("is-clean-feed", cleanOn);
      this.root.setAttribute("data-backdrop", mode);
      this.root.classList.toggle("is-solid-backdrop", solid);
      this.root.setAttribute("data-frame-ratio", ratio);
      this.root.classList.toggle("has-frame-ratio", ratio !== "off");
      this.root.classList.toggle("show-frame-guide", showGuide);
      this.root.classList.toggle("is-cinematic-fx", cinematicOn);
      if (!cinematicOn) {
        if (this._lastCinematicBassStr !== "0") {
          this.root.style.setProperty("--cinematic-bass", "0");
          this._lastCinematicBassStr = "0";
        }
        if (this.vignette && this._lastVignetteOpacityStr !== "") {
          this.vignette.style.opacity = "";
          this._lastVignetteOpacityStr = "";
        }
      }
    }
    if (this.pill) {
      this.pill.classList.toggle("is-clean-feed", cleanOn);
      const cleanBtn = this.pill.querySelector('button[data-act="toggle-clean-feed"]');
      if (cleanBtn) {
        cleanBtn.classList.toggle("is-on", cleanOn);
        cleanBtn.setAttribute("aria-pressed", cleanOn ? "true" : "false");
      }
    }
    if (typeof document !== "undefined" && document.body) {
      const rootVisible = Boolean(this.enabled && this.root && this.root.style.display !== "none");
      document.body.classList.toggle("cider-ide-clean-feed", cleanOn && rootVisible);
    }
    if (this.canvas) {
      const isCompact = this._isCompact ?? Boolean(this.root?.classList?.contains("is-compact"));
      this.canvas.style.display = (isCompact || solid || mode === "simple" || mode === "custom") ? "none" : "";
    }
    this.applyCustomBackground();
  }

  setCustomBackground(url, type = "image") {
    if (this._customBgObjectUrl && this._customBgObjectUrl !== url) {
      try { URL.revokeObjectURL(this._customBgObjectUrl); } catch {}
      this._customBgObjectUrl = null;
    }
    this.settings.customBgUrl = String(url || "").trim();
    this.settings.customBgType = type === "video" ? "video" : "image";
    this.settings.backdropMode = "custom";
    try {
      localStorage.setItem("cider_ide_lyrics_visual_settings", JSON.stringify(this.getVisualSettings()));
    } catch {}
    this.applyVisualSettings();
    if (this.settingsPanel) this.syncSettingsPanelInputs();
  }

  clearCustomBackground() {
    if (this._customBgObjectUrl) {
      try { URL.revokeObjectURL(this._customBgObjectUrl); } catch {}
      this._customBgObjectUrl = null;
    }
    this.settings.customBgUrl = "";
    this.settings.customBgType = "image";
    try {
      localStorage.setItem("cider_ide_lyrics_visual_settings", JSON.stringify(this.getVisualSettings()));
    } catch {}
    this.applyCustomBackground();
  }

  handleCustomBgFile(file) {
    if (!file) return;
    const isVideo = Boolean(file.type && file.type.startsWith("video/")) || /\.(mp4|webm|ogg|mov)$/i.test(file.name || "");
    if (!isVideo && file.size <= 2500000 && typeof FileReader !== "undefined") {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          this.setCustomBackground(reader.result, "image");
        }
      };
      reader.readAsDataURL(file);
    } else if (typeof URL !== "undefined" && typeof URL.createObjectURL === "function") {
      const objUrl = URL.createObjectURL(file);
      this.setCustomBackground(objUrl, isVideo ? "video" : "image");
      this._customBgObjectUrl = objUrl;
    }
  }

  applyCustomBackground() {
    if (!this.root || !this.customBgEl) return;
    const mode = normalizeBackdropMode(this.settings.backdropMode);
    const url = typeof this.settings.customBgUrl === "string" ? this.settings.customBgUrl.trim() : "";
    const isVideo = this.settings.customBgType === "video";
    const active = mode === "custom" && url.length > 0;
    this.root.classList.toggle("has-custom-bg", active);
    const op = Math.max(0.1, Math.min(1, typeof this.settings.customBgOpacity === "number" ? this.settings.customBgOpacity : 0.6));
    const blurPx = Math.max(0, Math.min(24, typeof this.settings.customBgBlur === "number" ? this.settings.customBgBlur : 0));
    const filterCss = blurPx > 0 ? `blur(${blurPx}px)` : "none";
    const scaleCss = blurPx > 0 ? "scale(1.05)" : "none";

    if (active && isVideo && this.customBgVideo) {
      if (this.customBgImg) this.customBgImg.style.display = "none";
      if (this.customBgVideo.getAttribute("src") !== url) {
        this.customBgVideo.src = url;
      }
      this.customBgVideo.style.display = "block";
      this.customBgVideo.style.opacity = String(op);
      this.customBgVideo.style.filter = filterCss;
      this.customBgVideo.style.transform = scaleCss;
      try {
        const p = this.customBgVideo.play();
        if (p && typeof p.catch === "function") p.catch(() => {});
      } catch {}
    } else if (active && this.customBgImg) {
      if (this.customBgVideo) {
        this.customBgVideo.style.display = "none";
        try { this.customBgVideo.pause(); } catch {}
      }
      if (this.customBgImg.getAttribute("src") !== url) {
        this.customBgImg.src = url;
      }
      this.customBgImg.style.display = "block";
      this.customBgImg.style.opacity = String(op);
      this.customBgImg.style.filter = filterCss;
      this.customBgImg.style.transform = scaleCss;
    } else {
      if (this.customBgImg) this.customBgImg.style.display = "none";
      if (this.customBgVideo) {
        this.customBgVideo.style.display = "none";
        try { this.customBgVideo.pause(); } catch {}
      }
    }
  }

  updateCinematicVignette(bass) {
    if (!this.root) return;
    if (!this.isCinematicActive()) {
      if (this._lastCinematicBassStr !== "0") {
        this.root.style.setProperty("--cinematic-bass", "0");
        this._lastCinematicBassStr = "0";
      }
      if (this.vignette && this._lastVignetteOpacityStr !== "") {
        this.vignette.style.opacity = "";
        this._lastVignetteOpacityStr = "";
      }
      return;
    }
    const clamped = Math.max(0, Math.min(1, Number(bass) || 0));
    const bassStr = clamped.toFixed(2);
    if (bassStr !== this._lastCinematicBassStr) {
      this.root.style.setProperty("--cinematic-bass", bassStr);
      this._lastCinematicBassStr = bassStr;
    }
    if (this.vignette) {
      const mode = normalizeBackdropMode(this.settings.backdropMode);
      const op = (mode === "vignette" ? (0.90 + clamped * 0.10) : (0.84 + clamped * 0.16)).toFixed(2);
      if (op !== this._lastVignetteOpacityStr) {
        this.vignette.style.opacity = op;
        this._lastVignetteOpacityStr = op;
      }
    }
  }

  initAmbientMotes() {
    const count = this.settings.linuxLowSpecMode ? 12 : 24;
    if (Array.isArray(this._ambientMotes) && this._ambientMotes.length === count) return;
    const motes = [];
    for (let i = 0; i < count; i++) {
      motes.push({
        x: Math.random(),
        y: Math.random(),
        r: 1.2 + Math.random() * 2.4,
        vx: (Math.random() - 0.5) * 0.014,
        vy: -(0.008 + Math.random() * 0.018),
        phase: Math.random() * Math.PI * 2,
        speed: 0.7 + Math.random() * 1.1,
        alpha: 0.16 + Math.random() * 0.24,
        colorIdx: i % 3
      });
    }
    this._ambientMotes = motes;
  }

  drawAmbientMotes(ctx, w, h, dt = 0.016, bass = 0) {
    if (!ctx || !w || !h || !this.isCinematicActive()) return;
    this.initAmbientMotes();
    const colors = [
      this.palette?.keyword || "#ff9922",
      this.palette?.method || "#ff4fa8",
      "#ffffff"
    ];
    const safeDt = Math.max(0.001, Math.min(0.1, Number(dt) || 0.016));
    const b = Math.max(0, Math.min(1, Number(bass) || 0));
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < this._ambientMotes.length; i++) {
      const m = this._ambientMotes[i];
      m.x = (m.x + m.vx * safeDt + 1) % 1;
      m.y += m.vy * safeDt;
      if (m.y < -0.05) {
        m.y = 1.05;
        m.x = Math.random();
      }
      m.phase += m.speed * safeDt;
      const twinkle = 0.65 + 0.35 * Math.sin(m.phase);
      const alpha = Math.min(0.85, m.alpha * twinkle * (0.75 + b * 0.65));
      const px = m.x * w;
      const py = m.y * h;
      const col = colors[m.colorIdx % colors.length];

      ctx.beginPath();
      ctx.globalAlpha = alpha * 0.28;
      ctx.fillStyle = col;
      ctx.arc(px, py, m.r * (3.2 + b * 1.2), 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = col;
      ctx.arc(px, py, m.r * (0.95 + b * 0.25), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  getSyncAdjustedTime(baseTime = this.currentTime) {
    const offsetSec = (Number(this.settings?.syncOffsetMs) || 0) / 1000;
    return Math.max(0, (Number(baseTime) || 0) + offsetSec);
  }

  nudgeSyncOffset(deltaMs, exactMs = null) {
    const current = Number(this.settings?.syncOffsetMs) || 0;
    const rawNext = exactMs !== null ? exactMs : current + deltaMs;
    const next = Math.max(-1000, Math.min(1000, Math.round(rawNext)));
    this.settings.syncOffsetMs = next;
    try {
      localStorage.setItem("cider_ide_lyrics_visual_settings", JSON.stringify(this.getVisualSettings()));
    } catch (err) {}
    this.syncSettingsPanelInputs();
    if (this.compiledLines?.length) {
      this.syncWordCursor(this.getSyncAdjustedTime(this.domSyncedTime ?? this.currentTime), true);
    }
    this.showSyncOffsetHud(next);
  }

  showSyncOffsetHud(ms) {
    if (!this.syncHudEl) return;
    const rounded = Math.round(ms || 0);
    this.syncHudEl.textContent = `sync: ${rounded > 0 ? "+" : ""}${rounded}ms`;
    this.syncHudEl.classList.add("is-visible");
    if (this._syncHudTimer) clearTimeout(this._syncHudTimer);
    this._syncHudTimer = setTimeout(() => {
      this.syncHudEl?.classList.remove("is-visible");
      this._syncHudTimer = null;
    }, 1200);
  }

  updateStageProgress(curTime, dur) {
    if (!this.progressHairlineEl) return;
    if (!dur || dur <= 0 || !Number.isFinite(dur)) {
      this.progressHairlineEl.style.width = "0%";
      return;
    }
    const pct = Math.min(100, Math.max(0, ((Number(curTime) || 0) / dur) * 100));
    this.progressHairlineEl.style.width = `${pct.toFixed(2)}%`;
  }

  clearCursorIdleState() {
    if (this._cursorIdleTimer) {
      clearTimeout(this._cursorIdleTimer);
      this._cursorIdleTimer = null;
    }
    this.root?.classList.remove("is-cursor-idle");
    this.pill?.classList.remove("is-cursor-idle");
  }

  resetCursorIdleTimer() {
    this.clearCursorIdleState();
    if (!this.isFullscreen || !this.enabled || this.settingsPanelOpen || this.isLockActive) {
      return;
    }
    this._cursorIdleTimer = setTimeout(() => {
      if (this.isFullscreen && this.enabled && !this.settingsPanelOpen && !this.isLockActive) {
        this.root?.classList.add("is-cursor-idle");
        this.pill?.classList.add("is-cursor-idle");
      }
      this._cursorIdleTimer = null;
    }, 3000);
  }

  initIdleWatcher() {
    if (this._idleWatcherInitialized) return;
    this._idleWatcherInitialized = true;
    this._lastActivityTime = Date.now();

    const onUserActivity = (e) => {
      const now = Date.now();
      if (this.isLockActive) {
        if (now - (this._lockActivatedAt || 0) < 400) {
          if (e.type === "mousemove") {
            const curX = e.clientX ?? 0;
            const curY = e.clientY ?? 0;
            this._lockInitialMouse = { x: curX, y: curY };
          }
          return;
        }

        if (e.type === "keydown" || e.type === "mousedown" || e.type === "pointerdown" || e.type === "touchstart") {
          this.deactivateLockOrScreensaver();
        } else if (e.type === "mousemove") {
          const curX = e.clientX ?? 0;
          const curY = e.clientY ?? 0;
          if (!this._lockInitialMouse) {
            this._lockInitialMouse = { x: curX, y: curY };
          } else {
            const dist = Math.hypot(curX - this._lockInitialMouse.x, curY - this._lockInitialMouse.y);
            if (dist > 20) {
              this.deactivateLockOrScreensaver();
            }
          }
        }
      } else {
        this._lastActivityTime = now;
        this.resetCursorIdleTimer();
      }
    };

    this._idleActivityHandler = onUserActivity;
    window.addEventListener("mousemove", this._idleActivityHandler, { passive: true });
    window.addEventListener("mousedown", this._idleActivityHandler, { passive: true });
    window.addEventListener("pointerdown", this._idleActivityHandler, { passive: true });
    window.addEventListener("touchstart", this._idleActivityHandler, { passive: true });
    window.addEventListener("wheel", this._idleActivityHandler, { passive: true });
    window.addEventListener("keydown", this._idleActivityHandler, { passive: true });

    if (this._idleCheckTimer) clearInterval(this._idleCheckTimer);
    this._idleCheckTimer = setInterval(() => {
      if (this.isLockActive || this.settings.cleanFeed) return;
      if (!this.enabled) return;
      const mode = this.settings.idleMode;
      const timeout = Number(this.settings.idleTimeout);
      if (mode === "off" || !timeout || timeout <= 0) return;

      const am = this.getAppleMusicStore();
      const mk = window.MusicKit?.getInstance?.();
      const isPlaying = am ? Boolean(am.isPlaying) : (mk ? Boolean(mk.isPlaying) : Boolean(this.isPlaying));
      if (!isPlaying) return;

      const idleSec = (Date.now() - (this._lastActivityTime || Date.now())) / 1000;
      if (idleSec >= timeout) {
        this.activateLockOrScreensaver(false);
      }
    }, 1000);
  }

  activateLockOrScreensaver(manual = false) {
    if (this.isLockActive) return;
    const modeSetting = this.settings.idleMode;
    const timeout = Number(this.settings.idleTimeout);
    if (!manual && (modeSetting === "off" || !timeout || timeout <= 0)) return;

    const targetMode = modeSetting === "screensaver" ? "screensaver" : "lock";
    this.currentLockMode = targetMode;
    this.isLockActive = true;
    this._lockActivatedAt = Date.now();
    this._lockInitialMouse = null;
    this._preLockFullscreen = this.isFullscreen;
    this._preLockRootHidden = !this.enabled;

    if (!this.isFullscreen) {
      this.toggleFullscreenMode();
    }
    if (this.root) {
      this.root.style.display = "flex";
    }

    if (targetMode === "lock") {
      this.mountLockOverlay();
    } else {
      this.mountScreensaverClock();
    }
    if (this.isRenderActive()) this.resumeRenderLoop();
  }

  deactivateLockOrScreensaver() {
    if (!this.isLockActive) return;
    this.isLockActive = false;
    this._lastActivityTime = Date.now();

    if (this._lockClockTimer) {
      clearInterval(this._lockClockTimer);
      this._lockClockTimer = null;
    }
    if (this._screensaverClockTimer) {
      clearInterval(this._screensaverClockTimer);
      this._screensaverClockTimer = null;
    }

    if (this.lockOverlay) {
      this.lockOverlay.style.display = "none";
    }
    if (this.screensaverClock) {
      this.screensaverClock.style.display = "none";
    }
    if (this.root) {
      this.root.classList.remove("is-screensaver-active");
    }
    document.body.classList.remove("cider-ide-screensaver-active");
    if (this.pill) {
      this.pill.style.display = "flex";
    }

    const preLockRootHidden = this._preLockRootHidden;
    this._preLockRootHidden = false;
    if (!this._preLockFullscreen && this.isFullscreen) {
      this.toggleFullscreenMode();
    }
    if (preLockRootHidden && !this.enabled && this.root) {
      this.root.style.display = "none";
    }
    if (!this.isRenderActive()) this.pauseRenderLoop();
  }

  mountLockOverlay() {
    if (!this.lockOverlay) {
      this.lockOverlay = document.createElement("div");
      this.lockOverlay.id = "cider-ide-lock-overlay";
      this.lockOverlay.innerHTML = `
        <div class="cider-lock-content">
          <div class="cider-lock-header">
            <div class="cider-lock-badge">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
              <span>Lock Screen</span>
            </div>
            <div class="cider-lock-clock" id="cider-lock-clock">--:--</div>
            <div class="cider-lock-date" id="cider-lock-date">---</div>
          </div>
          <div class="cider-lock-track-card" id="cider-lock-track-card">
            <img class="cider-lock-art" id="cider-lock-art" src="" alt="" style="display:none;" />
            <div class="cider-lock-track-info">
              <div class="cider-lock-track-status">
                <span class="cider-lock-pulse-dot"></span>
                <span class="cider-lock-status-label">Now Playing</span>
              </div>
              <div class="cider-lock-track-title" id="cider-lock-track-title">Cider IDE Lyrics</div>
              <div class="cider-lock-track-artist" id="cider-lock-track-artist">Playing in Cider</div>
            </div>
          </div>
          <div class="cider-lock-hint">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style="animation: ciderLockBounce 2s infinite ease-in-out;">
              <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
            </svg>
            <span>Click, move mouse, or press any key to unlock</span>
          </div>
        </div>
      `;

      this.lockOverlay.addEventListener("click", () => {
        this.deactivateLockOrScreensaver();
      });
    }

    const host = this.root || document.body;
    if (this.lockOverlay.parentElement !== host) {
      host.appendChild(this.lockOverlay);
    }
    this.lockOverlay.style.display = "flex";
    if (this.root) {
      this.root.classList.remove("is-screensaver-active");
    }
    if (this.pill) {
      this.pill.style.display = "none";
    }

    this.updateLockClockAndTrack();
    if (this._lockClockTimer) clearInterval(this._lockClockTimer);
    this._lockClockTimer = setInterval(() => this.updateLockClockAndTrack(), 1000);
  }

  mountScreensaverClock() {
    if (!this.screensaverClock) {
      this.screensaverClock = document.createElement("div");
      this.screensaverClock.id = "cider-ide-screensaver-clock";
    }

    const host = this.root || document.body;
    if (this.screensaverClock.parentElement !== host) {
      host.appendChild(this.screensaverClock);
    }
    this.screensaverClock.style.display = "flex";
    if (this.root) {
      this.root.classList.add("is-screensaver-active");
    }
    document.body.classList.add("cider-ide-screensaver-active");
    if (this.pill) {
      this.pill.style.display = "none";
    }
    if (this.lockOverlay) {
      this.lockOverlay.style.display = "none";
    }

    this.updateScreensaverClock();
    if (this._screensaverClockTimer) clearInterval(this._screensaverClockTimer);
    this._screensaverClockTimer = setInterval(() => this.updateScreensaverClock(), 1000);
  }

  updateLockClockAndTrack() {
    if (!this.lockOverlay) return;
    const now = new Date();
    const clockEl = this.lockOverlay.querySelector("#cider-lock-clock");
    const dateEl = this.lockOverlay.querySelector("#cider-lock-date");
    if (clockEl) {
      clockEl.textContent = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    }
    if (dateEl) {
      dateEl.textContent = now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
    }

    const am = this.getAppleMusicStore();
    const mk = window.MusicKit?.getInstance?.();
    const isPlaying = am ? Boolean(am.isPlaying) : (mk ? Boolean(mk.isPlaying) : Boolean(this.isPlaying));
    const attrs =
      am?.nowPlayingItem?.attributes ||
      mk?.nowPlayingItem?.attributes ||
      mk?.nowPlayingItem ||
      {};
    const title = attrs.name || attrs.title || "Listening in Cider";
    const artist = attrs.artistName || attrs.albumName || "3D IDE Lyric Visualizer";

    const titleEl = this.lockOverlay.querySelector("#cider-lock-track-title");
    const artistEl = this.lockOverlay.querySelector("#cider-lock-track-artist");
    const artEl = this.lockOverlay.querySelector("#cider-lock-art");
    const statusLabel = this.lockOverlay.querySelector(".cider-lock-status-label");
    const pulseDot = this.lockOverlay.querySelector(".cider-lock-pulse-dot");

    if (statusLabel) {
      statusLabel.textContent = isPlaying ? "Now Playing" : "Paused";
    }
    if (pulseDot) {
      pulseDot.classList.toggle("is-paused", !isPlaying);
      pulseDot.style.animationPlayState = isPlaying ? "running" : "paused";
      pulseDot.style.opacity = isPlaying ? "1" : "0.35";
    }

    if (titleEl && titleEl.textContent !== title) titleEl.textContent = title;
    if (artistEl && artistEl.textContent !== artist) artistEl.textContent = artist;

    let artUrl =
      attrs?.artwork?.url ||
      am?.nowPlayingItem?.attributes?.artwork?.url ||
      mk?.nowPlayingItem?.artwork?.url ||
      am?.currentArtworkUrlHiRes ||
      am?.currentArtworkUrl ||
      "";
    if (artUrl) {
      artUrl = artUrl.replace("{w}", "128").replace("{h}", "128").replace("{f}", "webp");
    } else {
      const domImg = document.querySelector("img.artwork, .now-playing-artwork img, [class*='artwork'] img");
      if (domImg?.src) artUrl = domImg.src;
    }

    if (artEl) {
      if (artUrl) {
        if (artEl.src !== artUrl) artEl.src = artUrl;
        artEl.style.display = "block";
      } else {
        artEl.style.display = "none";
      }
    }
  }

  updateScreensaverClock() {
    if (!this.screensaverClock) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    const dateStr = now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
    this.screensaverClock.textContent = `${timeStr}  •  ${dateStr}`;
  }

  toggleVisualizerEnable(forceState) {
    this.enabled = typeof forceState === "boolean" ? forceState : !this.enabled;
    try {
      localStorage.setItem("cider_ide_lyrics_enabled", this.enabled ? "true" : "false");
    } catch (e) {}

    this.updatePillEnableState();

    const active = this.isLyricsActive();
    const lyricHost = this.findLyricHost();
    const targetHost = this.isFullscreen ? document.body : lyricHost;

    if (!this.enabled) {
      if (this.settings.cleanFeed) this.setCleanFeed(false);
      if (this.settingsPanelOpen) this.closeSettingsPanel();
      this.clearCursorIdleState();
      if (this.root) this.root.style.display = "none";
      document.body.classList.remove("cider-ide-host-active", "cider-ide-lyrics-active", "cider-ide-clean-feed");
      if (lyricHost) {
        lyricHost.classList.remove("cider-ide-host-active");
      }
      if (active && targetHost) {
        if (this.pill) {
          if (this.pill.parentElement !== targetHost) {
            targetHost.appendChild(this.pill);
          }
          this.pill.classList.toggle("is-fullscreen", this.isFullscreen);
          this.pill.style.display = "flex";
        }
      } else {
        if (this.pill) this.pill.style.display = "none";
      }
      this.pauseRenderLoop();
    } else {
      if (this.isFullscreen || (active && lyricHost)) {
        if (targetHost) {
          this.mountStage(targetHost);
          if (this.compiledLines.length > 0) this.buildCodeDOM();
        }
        if (this.root) this.root.style.display = "flex";
        document.body.classList.add("cider-ide-lyrics-active");
        if (targetHost && targetHost !== document.body) {
          targetHost.classList.add("cider-ide-host-active");
        }
        if (this.pill) {
          if (this.pill.parentElement !== targetHost) {
            targetHost.appendChild(this.pill);
          }
          this.pill.classList.toggle("is-fullscreen", this.isFullscreen);
          this.pill.style.display = "flex";
        }
        this.resizeCanvas();
        this.updatePlayerDockUI();
        this.resumeRenderLoop();
      } else {
        if (this.root) this.root.style.display = "none";
        document.body.classList.remove("cider-ide-host-active", "cider-ide-lyrics-active");
        if (this.pill) this.pill.style.display = "none";
        this.pauseRenderLoop();
      }
    }
  }

  updatePillEnableState() {
    if (!this.pill) return;
    this.pill.classList.toggle("is-disabled", !this.enabled);
    const btn = this.pill.querySelector('button[data-act="toggle-enable"]');
    if (!btn) return;
    btn.classList.toggle("is-on", this.enabled);
    if (this.enabled) {
      btn.innerHTML = "ON";
    } else {
      btn.innerHTML = '<span class="pill-long-label">OFF</span><span class="pill-short-label">OFF</span>';
    }
  }

  isLyricsActive() {
    if (this.isFullscreen) return true;
    const storeMap = this.getPiniaStoreMap();
    const appState = storeMap?.get?.("app-state");
    if (appState?.appMode === "immersive") return true;
    if (appState?.browserRightDrawerOpen && appState?.browserRightDrawerView === "lyrics") return true;

    const host = this.findLyricHost();
    return !!host;
  }

  findLyricHost() {
    const directLine = document.querySelector(".lyric-line, .clp-line, .clp-word, [data-lyric-line]");
    if (directLine) {
      const container = directLine.closest(
        ".lyric-view-wrapper, .lyric-view, .split-pane--lyrics, .right-drawer-content, .drawer-view, .app-immersive-view, .immersive-lyric-view"
      );
      if (container && (container.offsetParent !== null || window.getComputedStyle(container).display !== "none")) {
        return container;
      }
    }

    const explicitHosts = [
      document.querySelector(".right-drawer-content .drawer-view[key='lyrics']"),
      document.querySelector(".drawer-view[key='lyrics']"),
      document.querySelector(".split-pane--lyrics"),
      document.querySelector(".lyric-view-wrapper"),
      document.querySelector(".lyric-view"),
      document.querySelector(".app-immersive-view"),
      document.querySelector(".immersive-lyric-view"),
      document.querySelector(".clp-mount"),
      document.querySelector(".clp-container")
    ];

    for (const el of explicitHosts) {
      if (el && (el.offsetParent !== null || window.getComputedStyle(el).display !== "none")) {
        return el;
      }
    }

    const storeMap = this.getPiniaStoreMap();
    const appState = storeMap?.get?.("app-state");
    if (appState?.browserRightDrawerOpen && appState?.browserRightDrawerView === "lyrics") {
      const drawerView = document.querySelector(".right-drawer-content .drawer-view, .right-drawer-content, .drawer-view");
      if (drawerView) return drawerView;
    }

    return null;
  }

  getValidLyricLineNodes() {
    const primary = document.querySelectorAll(
      ".lyric-line:not([aria-hidden='true']):not(.collapsable):not(.lyric-background-vocal)"
    );
    if (primary && primary.length > 0) return primary;
    const clp = document.querySelectorAll(
      ".clp-line:not(.clp-line-bg):not(.clp-line-credit)"
    );
    if (clp && clp.length > 0) {
      const nonInterlude = Array.from(clp).filter((el) => !el.querySelector(".clp-dots"));
      if (nonInterlude.length > 0) return nonInterlude;
    }
    return document.querySelectorAll(".am-lyrics .lyric, [data-lyric-line]");
  }

  resizeCanvas() {
    if (!this.canvas || !this.root) return;
    const rect = this.root.getBoundingClientRect();
    const container = this.root.parentElement || (this.isFullscreen ? document.body : this.findLyricHost());
    const parentRect = container ? container.getBoundingClientRect() : null;
    const w = (this.root.style.display !== "none" && rect.width) ? rect.width : (parentRect?.width || window.innerWidth);
    const h = (this.root.style.display !== "none" && rect.height) ? rect.height : (parentRect?.height || window.innerHeight);
    const isCompact = (w > 0 && w < 560 && !this.isFullscreen);
    const showCover = !this.settings.cleanFeed && this.showCoverShowcase && (this.isFullscreen || w >= 760);
    const solidBackdrop = isSolidBackdrop(this.settings.backdropMode);
    this._isCompact = isCompact;
    this.root.classList.toggle("is-compact", isCompact);
    if (this.pill) {
      this.pill.classList.toggle("is-compact", isCompact);
    }
    if (this.canvas) {
      this.canvas.style.display = (isCompact || solidBackdrop) ? "none" : "";
    }
    this.root.classList.toggle("is-medium-dock", w > 0 && w < 960);
    this.root.classList.toggle("has-cover-showcase", showCover);
    const editFrameMetrics = this.updateEditFrameMetrics(w, h);
    this.applyEditStudioState();
    if (this.codePlane) {
      const rawAvailW = showCover ? w * 0.68 : w;
      const availW = (!isCompact && editFrameMetrics) ? Math.min(rawAvailW, editFrameMetrics.frameW * 0.92) : rawAvailW;
      const fontScale = (this.settings.fontSize || 40) / 40;
      let effectiveFontSize;
      if (this.isFullscreen) {
        effectiveFontSize = Math.round(this.settings.fontSize * Math.min(1.0, Math.max(0.65, availW / 1100)));
      } else if (w < 360) {
        effectiveFontSize = Math.min(13, Math.max(11.5, Math.floor(w * 0.038))) * fontScale;
      } else if (w < 520) {
        effectiveFontSize = Math.min(15, Math.max(13, Math.floor(w * 0.034))) * fontScale;
      } else if (w < 760) {
        effectiveFontSize = Math.min(22, Math.max(16, Math.floor(availW * 0.032))) * fontScale;
      } else {
        effectiveFontSize = Math.round(this.settings.fontSize * Math.min(1.0, Math.max(0.65, availW / 1100)));
      }
      this.codePlane.style.fontSize = `${effectiveFontSize}px`;
    }
    const dpr = this.settings.linuxLowSpecMode ? 1 : Math.min(window.devicePixelRatio || 1, 2);
    this._cachedW = w;
    this._cachedH = h;
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (this.grainCanvas) {
      this.cachedGrainPattern = this.ctx.createPattern(this.grainCanvas, "repeat");
    }
    this.updateCachedBgGlow();
  }

  updateCachedBgGlow() {
    if (!this.ctx) {
      this._cachedBgGlow = null;
      return;
    }
    const w = this._cachedW || window.innerWidth;
    const h = this._cachedH || window.innerHeight;
    if (!w || !h) {
      this._cachedBgGlow = null;
      return;
    }
    const bgGlow = this.ctx.createRadialGradient(w * 0.38, h * 0.5, 20, w * 0.45, h * 0.5, Math.max(w, h) * 0.65);
    bgGlow.addColorStop(0, this.palette?.waves?.[1] || "rgba(195, 45, 140, 0.16)");
    bgGlow.addColorStop(0.5, "rgba(60, 20, 90, 0.06)");
    bgGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
    this._cachedBgGlow = bgGlow;
  }

  bindCiderAndMusicKitHooks() {
    const attachMK = () => {
      if (this._destroyed) return;
      const mk = window.MusicKit?.getInstance?.();
      if (!mk || this._mkBound) return;
      this._mkBound = true;
      this._mkInstance = mk;
      this._mkNowPlayingHandler = () => {
        if (this._destroyed) return;
        const key = this.getTrackUniqueKey();
        const np = this.getNowPlayingTrack();
        if (key && key !== this.currentTrackId) {
          this.handleTrackChange(key, np);
        } else {
          this.refreshCurrentTrackArtwork(true);
          if (this._mkScrapeTimer) clearTimeout(this._mkScrapeTimer);
          this._mkScrapeTimer = setTimeout(() => {
            this._mkScrapeTimer = null;
            if (!this._destroyed) this.scrapeVisibleCiderLyrics(true);
          }, 350);
        }
      };
      this._mkPlaybackTimeHandler = (ev) => {
        if (this._destroyed) return;
        const t = ev?.currentPlaybackTime ?? mk.currentPlaybackTime;
        if (typeof t === "number") {
          this.currentTime = t;
          this._lastRawAudioTime = t;
          this.syncWordCursor(this.getSyncAdjustedTime(this.currentTime));
        }
      };
      mk.addEventListener("nowPlayingItemDidChange", this._mkNowPlayingHandler);
      mk.addEventListener("playbackTimeDidChange", this._mkPlaybackTimeHandler);
    };
    attachMK();
    this._attachMkTimeout = setTimeout(attachMK, 2000);

    this._nowPlayingHandler = (e) => {
      if (this._destroyed) return;
      const np = e.detail || this.getNowPlayingTrack();
      const key = this.getTrackUniqueKey(np);
      if (key && key !== this.currentTrackId) {
        this.handleTrackChange(key, np);
      }
      const artUrl = e.detail?.artwork?.url?.replace("{w}", "128").replace("{h}", "128").replace("{f}", "webp");
      if (this.settings.matchSongTheme && artUrl) {
        this.lastArtworkTrackUrl = artUrl;
        this.extractAndApplyArtworkUrl(artUrl);
      }
    };
    window.addEventListener("cider:NowPlayingItemDidChange", this._nowPlayingHandler);
  }

  observeCiderLyricDOM() {
    if (this.domObserver) {
      this.domObserver.disconnect();
      this.domObserver = null;
    }
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }

    if (this._checkRafId) {
      cancelAnimationFrame(this._checkRafId);
      this._checkRafId = null;
    }

    const checkAndMount = () => {
      if (this._destroyed) return;
      const active = this.isLyricsActive();
      const lyricHost = this.findLyricHost();

      if (this.isFullscreen) {
        this.ensureBackgroundLyricFeeder();
        if (this.root.parentElement !== document.body) {
          this.mountStage(document.body);
          if (this.compiledLines.length > 0) this.buildCodeDOM();
        }
        this.root.classList.add("is-fullscreen");
        this.root.style.display = (this.enabled || this.isLockActive) ? "flex" : "none";
        document.body.classList.toggle("cider-ide-lyrics-active", this.enabled);
        if (!this.enabled) {
          document.body.classList.remove("cider-ide-host-active", "cider-ide-lyrics-active");
        }
        if (this.pill && !this.isLockActive) {
          if (this.pill.parentElement !== document.body) document.body.appendChild(this.pill);
          this.pill.classList.toggle("is-fullscreen", true);
          this.pill.style.display = "flex";
        }
        if (!this._cursorIdleTimer && !this.root.classList.contains("is-cursor-idle")) {
          this.resetCursorIdleTimer();
        }
      } else if (active && lyricHost) {
        this.clearCursorIdleState();
        if (this.root.parentElement !== lyricHost) {
          this.mountStage(lyricHost);
          if (this.compiledLines.length > 0) this.buildCodeDOM();
        }
        this.root.classList.remove("is-fullscreen");
        this.root.style.display = this.enabled ? "flex" : "none";
        document.body.classList.toggle("cider-ide-lyrics-active", this.enabled);
        if (!this.enabled) {
          document.body.classList.remove("cider-ide-host-active", "cider-ide-lyrics-active");
          lyricHost.classList.remove("cider-ide-host-active");
        }
        if (this.pill) {
          if (this.pill.parentElement !== lyricHost) lyricHost.appendChild(this.pill);
          this.pill.classList.toggle("is-fullscreen", false);
          this.pill.style.display = "flex";
        }
      } else {
        if (this.settingsPanelOpen) this.closeSettingsPanel();
        if (this.root) {
          this.root.style.display = "none";
          if (this.root.parentElement && this.root.parentElement !== document.body) {
            this.root.parentElement.classList.remove("cider-ide-host-active");
          }
        }
        document.body.classList.remove("cider-ide-host-active", "cider-ide-lyrics-active");
        if (this.pill) this.pill.style.display = "none";
      }

      const trackKey = this.getTrackUniqueKey();
      if (trackKey && trackKey !== this.currentTrackId) {
        this.handleTrackChange(trackKey, this.getNowPlayingTrack());
      } else {
        this.scrapeVisibleCiderLyrics(false);
        this.syncActiveLineFromCiderDOM();
        this.refreshCurrentTrackArtwork(false);
      }
      if (this.isRenderActive()) this.resumeRenderLoop();
      else this.pauseRenderLoop();
    };

    const scheduleCheck = () => {
      if (this._destroyed || this._checkRafId) return;
      this._checkRafId = requestAnimationFrame(() => {
        this._checkRafId = null;
        if (!this._destroyed) checkAndMount();
      });
    };

    this.domObserver = new MutationObserver((mutations) => {
      const isRelevant = mutations.some((record) => {
        const target = record.target;
        if (!target) return false;
        if (target === document.body && record.type === "attributes") return false;
        const elem = target.nodeType === 1 ? target : target.parentElement;
        if (!elem) return false;
        if (elem.closest && elem.closest("#cider-ide-visualizer-root, #cider-ide-floating-pill")) {
          return false;
        }
        if (elem.id === "cider-ide-visualizer-root" || elem.id === "cider-ide-floating-pill") {
          return false;
        }
        if (record.type === "childList") {
          const nonPluginAdded = Array.from(record.addedNodes).some(n => n.id !== "cider-ide-visualizer-root" && n.id !== "cider-ide-floating-pill");
          const nonPluginRemoved = Array.from(record.removedNodes).some(n => n.id !== "cider-ide-visualizer-root" && n.id !== "cider-ide-floating-pill");
          if (!nonPluginAdded && !nonPluginRemoved && (record.addedNodes.length > 0 || record.removedNodes.length > 0)) {
            return false;
          }
        }
        return true;
      });

      if (isRelevant) {
        scheduleCheck();
      }
    });

    this.domObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"]
    });

    checkAndMount();
    this.scrapeVisibleCiderLyrics(true);
    this.pollInterval = setInterval(scheduleCheck, 500);
  }

  extractStructuredWordsFromStoreLine(l) {
    const rawWordEntries = Array.isArray(l?.words)
      ? l.words.filter((w) => w && !w.isBackground && !w.empty)
      : [];

    if (rawWordEntries.length > 0) {
      const hasSubWords = rawWordEntries.some(
        (w) => Array.isArray(w.words) && w.words.length > 0
      );
      const hasTrailingSpaces =
        !hasSubWords &&
        rawWordEntries.some((w) => /\s$/.test(String(w.text || "")));

      const groupedWords = [];
      if (hasTrailingSpaces) {
        let cur = null;
        rawWordEntries.forEach((w) => {
          const piece = String(w.text || "").trim();
          const endsWord = /\s$/.test(String(w.text || ""));
          if (!piece) {
            if (cur) {
              groupedWords.push(cur);
              cur = null;
            }
            return;
          }
          const wStart = typeof w.start === "number" ? w.start : undefined;
          const wEnd = typeof w.end === "number" ? w.end : undefined;
          if (!cur) {
            cur = {
              text: piece,
              start: wStart,
              end: wEnd,
              syllables: [{ text: piece, start: wStart, end: wEnd }]
            };
          } else {
            cur.text += piece;
            if (typeof wEnd === "number") cur.end = wEnd;
            cur.syllables.push({ text: piece, start: wStart, end: wEnd });
          }
          if (endsWord) {
            groupedWords.push(cur);
            cur = null;
          }
        });
        if (cur) groupedWords.push(cur);
      } else {
        rawWordEntries.forEach((w) => {
          const subList =
            Array.isArray(w.words) && w.words.length > 0
              ? w.words.filter((sw) => sw && !sw.isBackground)
              : null;
          const rawText = subList
            ? subList.map((sw) => String(sw.text || "")).join("")
            : String(w.text || "");
          const trimmed = rawText.trim();
          if (!trimmed) return;

          const wStart =
            typeof w.start === "number"
              ? w.start
              : typeof subList?.[0]?.start === "number"
                ? subList[0].start
                : undefined;
          const wEnd =
            typeof w.end === "number"
              ? w.end
              : typeof subList?.[subList.length - 1]?.end === "number"
                ? subList[subList.length - 1].end
                : undefined;

          const parts = trimmed.split(/\s+/).filter(Boolean);
          if (parts.length > 1) {
            const totalChars = parts.reduce((acc, p) => acc + Math.max(1, p.length), 0);
            const span =
              typeof wStart === "number" && typeof wEnd === "number" && wEnd > wStart
                ? wEnd - wStart
                : parts.length * 0.28;
            let accChars = 0;
            parts.forEach((part) => {
              const pStart =
                typeof wStart === "number"
                  ? wStart + (span * accChars) / totalChars
                  : undefined;
              accChars += Math.max(1, part.length);
              const pEnd =
                typeof wStart === "number"
                  ? wStart + (span * accChars) / totalChars
                  : undefined;
              groupedWords.push({
                text: part,
                start: pStart,
                end: pEnd
              });
            });
          } else {
            groupedWords.push({
              text: trimmed,
              start: wStart,
              end: wEnd,
              syllables:
                subList && subList.length > 1
                  ? subList.map((sw) => ({
                      text: String(sw.text || "").trim(),
                      start: sw.start,
                      end: sw.end
                    }))
                  : undefined
            });
          }
        });
      }

      if (groupedWords.length > 0) {
        return groupedWords;
      }
    }

    const fallbackText = String(l?.text || "").trim();
    if (!fallbackText) return [];
    return fallbackText
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => ({ text: w, start: undefined, end: undefined }));
  }

  getLyricsFromCiderStore() {
    const lStore = this.getLyricStore();
    if (!lStore) return null;

    const rawList = lStore?.lyricStore;
    const list = Array.isArray(rawList)
      ? rawList
      : Array.isArray(rawList?.value)
        ? rawList.value
        : [];

    const am = this.getAppleMusicStore();
    const pf = this.getPlaybackFacadeStore();
    const mk = window.MusicKit?.getInstance?.();
    const liveNp = am?.nowPlayingItem || pf?.nowPlayingItem || mk?.nowPlayingItem || null;
    const extNp = am?.nowPlayingExtended || null;
    const settledNp = am?.settledNowPlaying || null;

    const liveName = String(
      liveNp?.attributes?.name || liveNp?.name || liveNp?.title || ""
    ).trim();
    const extName = String(
      extNp?.attributes?.name || extNp?.name || extNp?.title || ""
    ).trim();
    const useExt =
      !liveNp || !liveName || !extName || liveName.toLowerCase() === extName.toLowerCase();

    const sources = [liveNp, useExt ? extNp : null, settledNp].filter(Boolean);
    const candidates = [];
    if (pf?.nowPlayingId) candidates.push(String(pf.nowPlayingId));
    sources.forEach((src) => {
      [
        src?.id,
        src?.songId,
        src?._songId,
        src?.attributes?.playParams?.catalogId,
        src?.attributes?.playParams?.id,
        src?.attributes?.playParams?.reportingId,
        src?.playParams?.catalogId,
        src?.playParams?.id,
        src?.relationships?.catalog?.data?.[0]?.id
      ]
        .filter(Boolean)
        .forEach((v) => candidates.push(String(v)));
    });

    const allCids = new Set();
    candidates.forEach((c) => {
      allCids.add(c);
      allCids.add(c.replace(/^i\./, ""));
      allCids.add(`i.${c}`);
    });

    const hasWordLevel = (entry) =>
      Array.isArray(entry?.lyrics) &&
      entry.lyrics.some((l) => Array.isArray(l?.words) && l.words.length > 0);

    let matched = null;
    let isCidVerified = false;

    if (allCids.size > 0 && typeof lStore?.getAnswer === "function") {
      for (const cid of allCids) {
        try {
          const ans =
            lStore.getAnswer(cid, "Word") ||
            lStore.getAnswer(cid, "Line") ||
            lStore.getAnswer(cid);
          if (ans?.lyrics?.length) {
            matched = ans;
            isCidVerified = true;
            if (hasWordLevel(ans)) break;
          }
        } catch {}
      }
    }
    if ((!matched || !hasWordLevel(matched)) && allCids.size > 0 && typeof lStore?.getDecidedLyrics === "function") {
      for (const cid of allCids) {
        try {
          const decided = lStore.getDecidedLyrics(cid, "Word") || lStore.getDecidedLyrics(cid, "Line");
          if (decided?.lyrics?.length) {
            matched = decided;
            isCidVerified = true;
            if (hasWordLevel(decided)) break;
          }
        } catch {}
      }
    }
    if ((!matched || !hasWordLevel(matched)) && allCids.size > 0 && list.length > 0) {
      let fallbackEntry = matched;
      for (let i = list.length - 1; i >= 0; i--) {
        const entry = list[i];
        const entryCids = [
          entry?.songId,
          entry?.cid,
          entry?.id,
          entry?.trackId,
          entry?.catalogId,
          entry?.playParams?.id,
          entry?.playParams?.catalogId
        ]
          .filter(Boolean)
          .map(String);

        if (
          entry?.lyrics?.length &&
          entryCids.some((c) => allCids.has(c) || allCids.has(c.replace(/^i\./, "")))
        ) {
          isCidVerified = true;
          if (hasWordLevel(entry)) {
            matched = entry;
            break;
          }
          if (!fallbackEntry) fallbackEntry = entry;
        }
      }
      if (!matched && fallbackEntry) matched = fallbackEntry;
    }

    // Check direct active lyrics array on lStore if it isn't stale from the previous song
    if (!matched) {
      const directLyrics = Array.isArray(lStore?.lyrics)
        ? lStore.lyrics
        : Array.isArray(lStore?.currentLyrics)
          ? lStore.currentLyrics
          : null;
      if (directLyrics && directLyrics.length > 0) {
        matched = { lyrics: directLyrics };
        isCidVerified = false;
      }
    }

    if (!matched?.lyrics?.length) return null;

    const items = [];
    let pendingEmptyMarker = false;
    matched.lyrics.forEach((l, idx) => {
      if (l?.empty) {
        pendingEmptyMarker = true;
        return;
      }
      if (l?.isCredit) return;
      if (l?.isBackground) {
        const bgWords = Array.isArray(l.words)
          ? l.words.map((w) => (typeof w === "string" ? w : w?.text || "")).filter(Boolean).join(" ").trim()
          : String(l?.text || "").trim();
        if (bgWords && items.length > 0) {
          items[items.length - 1].bgText = items[items.length - 1].bgText
            ? `${items[items.length - 1].bgText} / ${bgWords}`
            : bgWords;
        }
        return;
      }
      const structuredWords = this.extractStructuredWordsFromStoreLine(l);
      if (!structuredWords.length) return;

      const words = structuredWords.map((w) => w.text);
      const text = words.join(" ").trim();
      if (!text) return;

      const hasWordTimes = structuredWords.some((w) => typeof w.start === "number");
      const wordTimes = hasWordTimes ? structuredWords.map((w) => w.start) : undefined;
      const wordEndTimes = hasWordTimes ? structuredWords.map((w) => w.end) : undefined;
      const roman = String(l.roman || l.romanized || l.romanization || l.transliteration || l.textRomanized || "").trim();
      const trans = String(l.trans || l.translation || l.translated || l.textTranslated || "").trim();
      const inlineBg = Array.isArray(l.words)
        ? l.words.filter((w) => w && w.isBackground && !w.empty).map((w) => w.text || "").filter(Boolean).join(" ").trim()
        : "";
      const bgText = String(l.bgText || l.backgroundText || inlineBg || "").trim();

      items.push({
        startTime: typeof l.start === "number" ? l.start : idx * 2.6,
        endTime: typeof l.end === "number" ? l.end : undefined,
        words,
        wordTimings: hasWordTimes ? structuredWords : undefined,
        wordTimes,
        wordEndTimes,
        hasRealTimestamp: typeof l.start === "number",
        afterEmptyMarker: pendingEmptyMarker,
        roman,
        trans,
        bgText,
        text
      });
      pendingEmptyMarker = false;
    });

    if (items.length === 0) return null;
    const textSig = items.map((it) => it.text.toLowerCase()).join("|");

    // If matched explicitly by the current track's catalogId / songId, it is authoritative
    if (isCidVerified) {
      if (this.staleLyricsTextSig === textSig) {
        this.staleLyricsTextSig = "";
      }
      return items;
    }

    const isStaleActive = Date.now() < (this.staleLyricsExpireAt || 0);
    if (isStaleActive && this.staleLyricsTextSig && textSig === this.staleLyricsTextSig) {
      return null;
    }
    return items;
  }

  extractWordsFromLyricNode(node) {
    const clpMain = node.querySelector?.(".clp-main");
    if (clpMain) {
      const clpWords = clpMain.querySelectorAll(".clp-word:not(.clp-word-bg)");
      if (clpWords && clpWords.length > 0) {
        const words = [];
        let buf = "";
        clpWords.forEach((wEl) => {
          const piece = (wEl.textContent || "").trim();
          const hasGap =
            wEl.classList.contains("clp-gap") ||
            wEl.parentElement?.classList?.contains("clp-gap");
          if (piece) buf += piece;
          if (hasGap && buf) {
            buf.split(/\s+/).filter(Boolean).forEach((p) => words.push(p));
            buf = "";
          }
        });
        if (buf) {
          buf.split(/\s+/).filter(Boolean).forEach((p) => words.push(p));
        }
        if (words.length > 0) return words;
      }
      const mainText = (clpMain.textContent || "").trim();
      if (mainText) return mainText.split(/\s+/).filter(Boolean);
    }

    const textEl = node.querySelector?.(".lyric-text") || node;
    const directWordNodes = textEl.querySelectorAll?.(
      ":scope > .plain-word, :scope > .one-word:not(.background-word), :scope > .lyric-word:not(.background-vocal):not(.background-word), :scope > ruby"
    );
    if (directWordNodes && directWordNodes.length > 0) {
      const words = [];
      directWordNodes.forEach((el) => {
        let w = "";
        if (el.classList.contains("lyric-word")) {
          w = el.getAttribute("data-text") || el.textContent || "";
        } else if (el.classList.contains("one-word")) {
          const subWords = el.querySelectorAll(".lyric-word");
          if (subWords.length > 0) {
            w = Array.from(subWords)
              .map((sw) => sw.getAttribute("data-text") || sw.textContent || "")
              .join("");
          } else {
            w = el.textContent || "";
          }
        } else if (el.tagName.toLowerCase() === "ruby") {
          const base = el.querySelector(".lyric-ruby-base, .plain-word, .lyric-word");
          w = base
            ? base.getAttribute?.("data-text") || base.textContent || ""
            : el.textContent || "";
        } else {
          w = el.textContent || "";
        }
        w = w.trim();
        if (w) {
          w.split(/\s+/).filter(Boolean).forEach((part) => words.push(part));
        }
      });
      if (words.length > 0) return words;
    }

    const plainWords = textEl.querySelectorAll?.(".plain-word");
    if (plainWords && plainWords.length > 0) {
      const words = Array.from(plainWords)
        .map((el) => (el.textContent || "").trim())
        .filter(Boolean);
      if (words.length > 0) return words;
    }

    if (textEl.cloneNode) {
      const clone = textEl.cloneNode(true);
      const noise = clone.querySelectorAll?.(
        ".clp-ts, .clp-trans, .clp-roman, .lyric-text-translated, .lyric-text-romanized, .background-vocal, .clp-word-bg"
      );
      if (noise) noise.forEach((n) => n.remove());
      const cleaned = (clone.textContent || "").trim();
      return cleaned ? cleaned.split(/\s+/).filter(Boolean) : [];
    }

    const raw = (textEl.innerText || textEl.textContent || "").trim();
    return raw ? raw.split(/\s+/).filter(Boolean) : [];
  }

  extractTimingFromDomNode(node) {
    try {
      const clpStart = parseFloat(node.dataset?.clpStart);
      const clpEnd = parseFloat(node.dataset?.clpEnd);
      const attrStart = !isNaN(clpStart)
        ? clpStart
        : parseFloat(node.dataset?.startTime ?? node.dataset?.time ?? node.dataset?.start);
      const attrEnd = !isNaN(clpEnd)
        ? clpEnd
        : parseFloat(node.dataset?.endTime ?? node.dataset?.end);

      const vueComp = node.__vueParentComponent;
      const candidates = [
        node.__vnode?.props?.line,
        node.__vnode?.props?.lyric,
        node.__vnode?.props?.item,
        node.__vnode?.props,
        vueComp?.props?.line,
        vueComp?.props?.lyric,
        vueComp?.props?.item,
        vueComp?.props,
        vueComp?.setupState?.line,
        vueComp?.setupState?.lyric,
        vueComp?.ctx?.line
      ].filter(Boolean);

      for (const cand of candidates) {
        const s =
          typeof cand.start === "number"
            ? cand.start
            : typeof cand.startTime === "number"
              ? cand.startTime
              : typeof cand.begin === "number"
                ? cand.begin
                : undefined;
        const e =
          typeof cand.end === "number"
            ? cand.end
            : typeof cand.endTime === "number"
              ? cand.endTime
              : undefined;
        if (typeof s === "number") {
          const structuredWords = Array.isArray(cand.words)
            ? this.extractStructuredWordsFromStoreLine(cand)
            : null;
          return {
            startTime: s,
            endTime: e,
            hasRealTimestamp: true,
            wordTimings:
              structuredWords && structuredWords.some((w) => typeof w.start === "number")
                ? structuredWords
                : undefined
          };
        }
      }

      if (!isNaN(attrStart)) {
        return {
          startTime: attrStart,
          endTime: !isNaN(attrEnd) ? attrEnd : undefined,
          hasRealTimestamp: true
        };
      }
    } catch {}
    return null;
  }

  getDomLyricsTextSignature(lineNodes = null) {
    const nodes = lineNodes || this.getValidLyricLineNodes();
    if (!nodes || !nodes.length) return "";
    const parts = [];
    nodes.forEach((node) => {
      const words = this.extractWordsFromLyricNode(node);
      if (words.length > 0) {
        parts.push(words.join(" ").toLowerCase().trim());
      }
    });
    return parts.join("|");
  }

  scrapeVisibleCiderLyrics(forceRebuild = false) {
    try {
      const lineNodes = this.getValidLyricLineNodes();
      const storeItems = this.getLyricsFromCiderStore();
      const domTextSig = this.getDomLyricsTextSignature(lineNodes);
      const isStaleActive = Date.now() < (this.staleLyricsExpireAt || 0);
      const knownCurrentTrackSig = this.currentTrackId
        ? this.confirmedLyricsByTrack.get(this.currentTrackId)
        : null;

      const isDomStale = Boolean(
        isStaleActive &&
          domTextSig &&
          domTextSig !== knownCurrentTrackSig &&
          (domTextSig === this.staleDomLyricsSig || domTextSig === this.staleLyricsTextSig)
      );

      const normKey = (s) =>
        String(s || "")
          .toLowerCase()
          .replace(/[^\p{L}\p{N}\p{M}\u200c\u200d]/gu, "");

      let rawItems = [];

      if (storeItems && storeItems.length > 0) {
        // Check if DOM lineNodes represent the same song as storeItems
        let domMatchesStore = false;
        if (lineNodes && lineNodes.length > 0 && !isDomStale) {
          let matchCount = 0;
          const sampleCount = Math.min(lineNodes.length, 8);
          for (let i = 0; i < sampleCount; i++) {
            const w = this.extractWordsFromLyricNode(lineNodes[i]).join(" ");
            const dn = normKey(w);
            if (dn && storeItems.some((st) => normKey(st.text) === dn)) {
              matchCount++;
            }
          }
          domMatchesStore = matchCount >= Math.max(1, Math.floor(sampleCount * 0.4));
        }

        if (domMatchesStore && lineNodes && lineNodes.length > 0) {
          let storeCursor = 0;
          lineNodes.forEach((node, idx) => {
            const extractedWords = this.extractWordsFromLyricNode(node);
            const domText = extractedWords.join(" ").trim();
            if (!domText) return;

            const domNorm = normKey(domText);
            let matchedStore = null;
            for (
              let k = Math.max(0, storeCursor - 1);
              k < Math.min(storeItems.length, storeCursor + 6);
              k++
            ) {
              if (normKey(storeItems[k].text) === domNorm) {
                matchedStore = storeItems[k];
                storeCursor = k + 1;
                break;
              }
            }
            if (!matchedStore && idx < storeItems.length) {
              matchedStore = storeItems[idx];
            }

            const domRoman = (node.querySelector?.(".clp-roman, .lyric-text-romanized")?.textContent || "").trim();
            const domTrans = (node.querySelector?.(".clp-trans, .lyric-text-translated")?.textContent || "").trim();
            const domBg = Array.from(node.querySelectorAll?.(".background-vocal, .clp-word-bg") || [])
              .map((el) => (el.textContent || "").trim())
              .filter(Boolean)
              .join(" ")
              .trim();
            if (matchedStore) {
              rawItems.push({
                startTime: matchedStore.startTime,
                endTime: matchedStore.endTime,
                words:
                  matchedStore.words && matchedStore.words.length > 0
                    ? matchedStore.words
                    : extractedWords,
                wordTimings: matchedStore.wordTimings,
                wordTimes: matchedStore.wordTimes,
                wordEndTimes: matchedStore.wordEndTimes,
                hasRealTimestamp: matchedStore.hasRealTimestamp,
                afterEmptyMarker: !!matchedStore.afterEmptyMarker,
                roman: matchedStore.roman || domRoman,
                trans: matchedStore.trans || domTrans,
                bgText: matchedStore.bgText || domBg,
                text: (matchedStore.words || extractedWords).join(" ").trim()
              });
            }
          });
        }

        if (rawItems.length === 0) {
          rawItems = storeItems;
        }
      } else if (lineNodes && lineNodes.length > 0 && !isDomStale) {
        const estSpan = Math.max(60, (this.duration || 180) * 0.88);
        const stepDur = Math.max(2.0, Math.min(4.5, estSpan / Math.max(1, lineNodes.length)));
        lineNodes.forEach((node, idx) => {
          const extractedWords = this.extractWordsFromLyricNode(node);
          const domText = extractedWords.join(" ").trim();
          if (!domText) return;

          const domTiming = this.extractTimingFromDomNode(node);
          const startTime = domTiming ? domTiming.startTime : idx * stepDur;
          const endTime =
            domTiming && typeof domTiming.endTime === "number"
              ? domTiming.endTime
              : startTime + stepDur;

          const domRoman = (node.querySelector?.(".clp-roman, .lyric-text-romanized")?.textContent || "").trim();
          const domTrans = (node.querySelector?.(".clp-trans, .lyric-text-translated")?.textContent || "").trim();
          const domBg = Array.from(node.querySelectorAll?.(".background-vocal, .clp-word-bg") || [])
            .map((el) => (el.textContent || "").trim())
            .filter(Boolean)
            .join(" ")
            .trim();
          rawItems.push({
            startTime,
            endTime,
            words: extractedWords,
            wordTimings: domTiming?.wordTimings,
            hasRealTimestamp: !!domTiming?.hasRealTimestamp,
            roman: domRoman,
            trans: domTrans,
            bgText: domBg,
            text: domText
          });
        });
      }

      if (rawItems.length === 0) {
        const np = this.getNowPlayingTrack();
        const title = np?.attributes?.name || np?.name || "Track";
        const artist = np?.attributes?.artistName || np?.artistName || "Playing in Cider";
        const album = np?.attributes?.albumName || np?.albumName || "";
        this.setTrackFallbackState(title, artist, album);
        return;
      }

      const sig = rawItems
        .map(
          (r) =>
            `${r.text}@${r.hasRealTimestamp ? r.startTime.toFixed(2) : "dom"}:${
              r.wordTimings ? r.wordTimings.length : 0
            }`
        )
        .join("|");
      if (sig && (forceRebuild || sig !== this.lastScrapedSignature)) {
        this.lastScrapedSignature = sig;
        const confirmedSig = rawItems.map((r) => r.text.toLowerCase()).join("|");
        this.lastConfirmedLyricsTextSig = confirmedSig;
        if (this.currentTrackId) {
          this.confirmedLyricsByTrack.set(this.currentTrackId, confirmedSig);
        }
        this.compiledLines = this.compileLyricsArray(rawItems);
        this.buildCodeDOM();
        this.refreshCurrentTrackArtwork(true);
      }
    } catch (err) {
      this.fallbackToNativeLyrics(err);
    }
  }

  setTrackFallbackState(title, artist, album) {
    try {
      const cleanT = String(title || "Track").replace(/[^\p{L}\p{N}\p{M}\u200c\u200d\s-]/gu, "").trim() || "Track";
      const cleanA = String(artist || "Artist").replace(/[^\p{L}\p{N}\p{M}\u200c\u200d\s-]/gu, "").trim() || "Artist";
      const fallbackSig = `fallback:${cleanT}:${cleanA}`;
      if (this.lastScrapedSignature === fallbackSig && this.compiledLines.length > 0) return;
      this.lastScrapedSignature = fallbackSig;
      const lines = [
        { startTime: 0.0, text: `${cleanT} ${cleanA}` },
        { startTime: 0.8, text: `cider audio stream ${album || "single"}` },
        { startTime: 1.6, text: `syncing live track lyrics` }
      ];
      this.compiledLines = this.compileLyricsArray(lines);
      this.buildCodeDOM();
    } catch (err) {
      this.fallbackToNativeLyrics(err);
    }
  }

  handleTrackChange(trackId, np) {
    const isDifferentTrack = Boolean(
      (this.currentTrackId && this.currentTrackId !== trackId) ||
        (!this.currentTrackId && this.lastConfirmedLyricsTextSig)
    );
    const knownSigForTarget = trackId ? this.confirmedLyricsByTrack.get(trackId) : null;

    if (isDifferentTrack) {
      const curDomSig = this.getDomLyricsTextSignature();
      if (curDomSig && curDomSig !== knownSigForTarget) {
        this.staleDomLyricsSig = curDomSig;
      } else if (
        this.lastConfirmedLyricsTextSig &&
        this.lastConfirmedLyricsTextSig !== knownSigForTarget
      ) {
        this.staleDomLyricsSig = this.lastConfirmedLyricsTextSig;
      } else {
        this.staleDomLyricsSig = "";
      }

      if (
        this.lastConfirmedLyricsTextSig &&
        this.lastConfirmedLyricsTextSig !== knownSigForTarget
      ) {
        this.staleLyricsTextSig = this.lastConfirmedLyricsTextSig;
      } else {
        this.staleLyricsTextSig = "";
      }
      this.staleLyricsExpireAt = Date.now() + 4500;
    }

    this.currentTrackId = trackId;
    this.lastScrapedSignature = "";
    this.activeLineIndex = -1;
    this.activeWordIndex = -1;
    this.activeTokenIndex = -1;
    this.targetScrollRem = 0;
    this.currentScrollRem = 0;
    this.domSyncedTime = null;
    this._lastRawAudioTime = 0;
    this.cachedLineNodes = [];
    this.lastDomActiveIdx = -1;

    if (this.isFullscreen) {
      this.ensureBackgroundLyricFeeder();
    }

    const trackObj = np || this.getNowPlayingTrack();
    const title = trackObj?.attributes?.name || trackObj?.name || "Track";
    const artist = trackObj?.attributes?.artistName || trackObj?.artistName || "Artist";
    const album = trackObj?.attributes?.albumName || trackObj?.albumName || "";

    // Clear old lines immediately and display current track header
    this.setTrackFallbackState(title, artist, album);
    this.refreshCurrentTrackArtwork(true);

    // Ask Cider's lyric-store to refresh if a helper method is exposed
    try {
      const lStore = this.getLyricStore();
      const songId =
        trackObj?.attributes?.playParams?.catalogId ||
        trackObj?.attributes?.playParams?.id ||
        trackObj?.id;
      if (lStore && songId) {
        if (typeof lStore.getLyrics === "function") lStore.getLyrics(songId);
        else if (typeof lStore.fetchLyrics === "function") lStore.fetchLyrics(songId);
      }
    } catch {}

    // Poll at staggered intervals as Cider loads the new track's lyrics
    this.scrapeVisibleCiderLyrics(true);
    if (Array.isArray(this._trackPollTimers)) {
      this._trackPollTimers.forEach((id) => clearTimeout(id));
    }
    this._trackPollTimers = [200, 500, 1000, 1800, 3000, 4500].map((delay) =>
      setTimeout(() => {
        if (!this._destroyed && this.currentTrackId === trackId) {
          this.scrapeVisibleCiderLyrics(false);
        }
      }, delay)
    );
  }

  syncActiveLineFromCiderDOM() {
    try {
      const lineNodes = this.getValidLyricLineNodes();
      if (!lineNodes.length || !this.compiledLines.length) return;
      const domSig = this.getDomLyricsTextSignature(lineNodes);
      const isStaleActive = Date.now() < (this.staleLyricsExpireAt || 0);
      const knownSig = this.currentTrackId
        ? this.confirmedLyricsByTrack.get(this.currentTrackId)
        : null;
      if (
        isStaleActive &&
        domSig &&
        domSig !== knownSig &&
        (domSig === this.staleDomLyricsSig || domSig === this.staleLyricsTextSig)
      ) {
        return;
      }

      let activeDomIdx = -1;
      let passedCount = 0;
      lineNodes.forEach((node, i) => {
        if (
          node.classList.contains("active") ||
          node.classList.contains("is-active") ||
          node.classList.contains("current") ||
          node.classList.contains("clp-live") ||
          node.classList.contains("clp-active") ||
          node.classList.contains("clp-line-active") ||
          node.dataset?.active === "true" ||
          node.getAttribute?.("aria-current") === "true"
        ) {
          activeDomIdx = i;
        } else if (
          node.classList.contains("finished") ||
          node.classList.contains("clp-finished") ||
          node.classList.contains("clp-past")
        ) {
          passedCount = i + 1;
        }
      });

      if (activeDomIdx < 0 && passedCount > 0) {
        activeDomIdx = Math.min(this.compiledLines.length - 1, passedCount - 1);
      }

      if (activeDomIdx >= 0 && activeDomIdx < this.compiledLines.length) {
        const lineObj = this.compiledLines[activeDomIdx];
        const activeNode = lineNodes[activeDomIdx];
        const textEl = activeNode?.querySelector?.(".lyric-text") || activeNode;
        const wordEls = textEl?.querySelectorAll?.(
          ":scope > .one-word:not(.background-word), :scope > .lyric-word:not(.background-vocal):not(.background-word), :scope > .plain-word"
        );

        let resolvedWordIdx = -1;
        if (wordEls && wordEls.length > 0) {
          let activeW = -1;
          let finishedW = 0;
          wordEls.forEach((wEl, wIdx) => {
            const allSubWords = wEl.classList.contains("one-word")
              ? Array.from(wEl.querySelectorAll(".lyric-word"))
              : [wEl];
            const isDone =
              allSubWords.length > 0 &&
              allSubWords.every((sw) => sw.classList.contains("finished-word"));
            const isCurrent =
              !isDone &&
              allSubWords.some(
                (sw) =>
                  sw.classList.contains("active") ||
                  sw.classList.contains("current-word")
              );
            if (isCurrent) activeW = wIdx;
            else if (isDone) finishedW = wIdx + 1;
          });
          resolvedWordIdx = activeW >= 0 ? activeW : finishedW > 0 ? finishedW - 1 : -1;
        }

        if (this.lastDomActiveIdx !== activeDomIdx) {
          this.lastDomActiveIdx = activeDomIdx;
          this.audioState.bassPulse = Math.max(this.audioState.bassPulse, 0.85);
          this.domSyncedTime = lineObj.start + 0.04;
        }

        if (resolvedWordIdx >= 0 && lineObj.wordTimings && lineObj.wordTimings[resolvedWordIdx]) {
          const wt = lineObj.wordTimings[resolvedWordIdx];
          if (
            typeof this.domSyncedTime !== "number" ||
            this.domSyncedTime < wt.start ||
            this.domSyncedTime > wt.end
          ) {
            this.domSyncedTime = wt.start + 0.02;
          }
        } else if (resolvedWordIdx >= 0 && wordEls) {
          const wordProgressRatio = (resolvedWordIdx + 0.25) / Math.max(1, wordEls.length);
          const lineDur = Math.max(0.4, lineObj.end - lineObj.start);
          this.domSyncedTime = lineObj.start + wordProgressRatio * lineDur * 0.92;
        } else if (
          typeof this.domSyncedTime !== "number" ||
          this.domSyncedTime < lineObj.start ||
          this.domSyncedTime > lineObj.end
        ) {
          this.domSyncedTime = lineObj.start + 0.05;
        }
      }
    } catch (err) {
      this.fallbackToNativeLyrics(err);
    }
  }

  refreshCurrentTrackArtwork(force = false) {
    if (!this.settings.matchSongTheme) return;
    const am = this.getAppleMusicStore();
    const mk = window.MusicKit?.getInstance?.();
    const liveTrack = this.getNowPlayingTrack();
    let artUrl =
      liveTrack?.attributes?.artwork?.url ||
      liveTrack?.artwork?.url ||
      am?.nowPlayingItem?.attributes?.artwork?.url ||
      mk?.nowPlayingItem?.artwork?.url ||
      am?.currentArtworkUrl ||
      "";
    if (artUrl) {
      artUrl = artUrl.replace("{w}", "128").replace("{h}", "128").replace("{f}", "webp");
    } else {
      const artImg = document.querySelector("img.artwork, .now-playing-artwork img, [class*='artwork'] img");
      if (artImg?.src) artUrl = artImg.src;
    }
    if (artUrl && (force || artUrl !== this.lastArtworkTrackUrl)) {
      this.lastArtworkTrackUrl = artUrl;
      this.extractAndApplyArtworkUrl(artUrl);
    }
  }

  rgbToHsl(r, g, b) {
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;
    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rn:
          h = (gn - bn) / d + (gn < bn ? 6 : 0);
          break;
        case gn:
          h = (bn - rn) / d + 2;
          break;
        default:
          h = (rn - gn) / d + 4;
          break;
      }
      h *= 60;
    }
    return { h: (h + 360) % 360, s, l };
  }

  hslToHex(h, s, l) {
    const hue = ((h % 360) + 360) % 360;
    const sat = Math.max(0, Math.min(1, s));
    const lig = Math.max(0, Math.min(1, l));
    const c = (1 - Math.abs(2 * lig - 1)) * sat;
    const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
    const m = lig - c / 2;
    let r1 = 0, g1 = 0, b1 = 0;
    if (hue < 60)      { r1 = c; g1 = x; b1 = 0; }
    else if (hue < 120){ r1 = x; g1 = c; b1 = 0; }
    else if (hue < 180){ r1 = 0; g1 = c; b1 = x; }
    else if (hue < 240){ r1 = 0; g1 = x; b1 = c; }
    else if (hue < 300){ r1 = x; g1 = 0; b1 = c; }
    else               { r1 = c; g1 = 0; b1 = x; }
    const toByte = (v) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
    return `#${toByte(r1)}${toByte(g1)}${toByte(b1)}`;
  }

  hslToRgba(h, s, l, alpha) {
    const hue = ((h % 360) + 360) % 360;
    const sat = Math.max(0, Math.min(1, s));
    const lig = Math.max(0, Math.min(1, l));
    const c = (1 - Math.abs(2 * lig - 1)) * sat;
    const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
    const m = lig - c / 2;
    let r1 = 0, g1 = 0, b1 = 0;
    if (hue < 60)      { r1 = c; g1 = x; b1 = 0; }
    else if (hue < 120){ r1 = x; g1 = c; b1 = 0; }
    else if (hue < 180){ r1 = 0; g1 = c; b1 = x; }
    else if (hue < 240){ r1 = 0; g1 = x; b1 = c; }
    else if (hue < 300){ r1 = x; g1 = 0; b1 = c; }
    else               { r1 = c; g1 = 0; b1 = x; }
    const R = Math.round((r1 + m) * 255);
    const G = Math.round((g1 + m) * 255);
    const B = Math.round((b1 + m) * 255);
    return `rgba(${R}, ${G}, ${B}, ${alpha})`;
  }

  extractAndApplyArtworkUrl(url) {
    const reqId = (this._artworkReqId = (this._artworkReqId || 0) + 1);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (this._destroyed || !this.settings.matchSongTheme || reqId !== this._artworkReqId) return;
      try {
        const off = document.createElement("canvas");
        off.width = 64;
        off.height = 64;
        const octx = off.getContext("2d");
        if (!octx) return;
        octx.drawImage(img, 0, 0, 64, 64);
        const data = octx.getImageData(0, 0, 64, 64).data;

        const buckets = [];
        for (let i = 0; i < data.length; i += 16) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          const { h, s, l } = this.rgbToHsl(r, g, b);
          if (s > 0.14 && l > 0.08 && l < 0.92) {
            buckets.push({ h, s, l, score: s * (1 - Math.abs(l - 0.5) * 0.8) });
          }
        }

        let h1 = 28;
        let h2 = 330;
        let baseSat = 0.88;

        if (buckets.length >= 5) {
          buckets.sort((a, b) => b.score - a.score);
          h1 = buckets[Math.floor(buckets.length * 0.05)].h;
          // Find a secondary hue at least 48 deg apart, or offset around the color wheel
          const distinct = buckets.find((b) => {
            const diff = Math.abs(b.h - h1);
            return Math.min(diff, 360 - diff) >= 48;
          });
          h2 = distinct ? distinct.h : (h1 + 305) % 360;
        } else {
          // Monochrome / low-saturation album art fallback
          baseSat = 0.78;
          h1 = 36;
          h2 = 205;
        }

        const h3 = (h1 + 115) % 360;
        const hOp = (h1 + 175) % 360;
        const hArg = (h2 + 190) % 360;

        // Guarantee high-luminance (L = 0.76..0.88) and well-separated hues for crisp IDE contrast on any cover
        this.palette = {
          bgCore: this.hslToHex(h1, 0.38, 0.035),
          keyword: this.hslToHex(h1, Math.min(0.96, baseSat + 0.08), 0.76),
          method: this.hslToHex(h2, Math.min(0.95, baseSat + 0.06), 0.78),
          property: this.hslToHex(h3, Math.min(0.90, baseSat + 0.04), 0.81),
          variable: "#fff8f2",
          arg: this.hslToHex(hArg, Math.min(0.88, baseSat), 0.86),
          bracket: this.hslToHex((h1 + 48) % 360, 0.92, 0.80),
          operator: this.hslToHex(hOp, 0.94, 0.80),
          dot: this.hslToHex(hOp, 0.96, 0.82),
          cursorTop: this.hslToHex(h1, 0.98, 0.76),
          cursorMid: this.hslToHex(h2, 0.95, 0.65),
          cursorBot: this.hslToHex(h3, 0.92, 0.58),
          cursorGlow: this.hslToHex(h1, 0.98, 0.68),
          waves: [
            this.hslToRgba(h1, 0.75, 0.46, 0.24),
            this.hslToRgba(h2, 0.72, 0.44, 0.26),
            this.hslToRgba(hOp, 0.68, 0.45, 0.20),
            this.hslToRgba(h3, 0.70, 0.42, 0.22),
            this.hslToRgba(hArg, 0.65, 0.46, 0.22)
          ]
        };
        this.applyPaletteToCSS(this.palette);
      } catch {}
    };
    img.onerror = () => {};
    img.src = url;
  }

  applyPaletteToCSS(p) {
    const root = document.documentElement;
    root.style.setProperty("--bg-core", p.bgCore);
    root.style.setProperty("--tok-keyword", p.keyword);
    root.style.setProperty("--tok-method", p.method);
    root.style.setProperty("--tok-property", p.property);
    root.style.setProperty("--tok-variable", p.variable);
    root.style.setProperty("--tok-arg", p.arg);
    root.style.setProperty("--tok-bracket", p.bracket);
    root.style.setProperty("--tok-operator", p.operator);
    root.style.setProperty("--tok-dot", p.dot);
    root.style.setProperty("--cursor-top", p.cursorTop);
    root.style.setProperty("--cursor-mid", p.cursorMid);
    root.style.setProperty("--cursor-bot", p.cursorBot);
    root.style.setProperty("--cursor-glow", p.cursorGlow);
    this._lastTypingSig = "";
    this.updateCachedBgGlow();
    this.updateTokenVisuals(this.getSyncAdjustedTime(this.currentTime));
  }

  fallbackToNativeLyrics(err = null) {
    if (err) {
      console.warn("[Cider IDE Lyrics Visualizer] Safeguard triggered fallback to native lyrics:", err);
    }
    try {
      if (this.root) this.root.style.display = "none";
      this.settings.cleanFeed = false;
      this.root?.classList.remove("is-clean-feed");
      this.pill?.classList.remove("is-clean-feed");
      document.body.classList.remove("cider-ide-lyrics-active", "cider-ide-host-active", "cider-ide-clean-feed");
      const lyricHost = this.findLyricHost();
      if (lyricHost) lyricHost.classList.remove("cider-ide-host-active");
      this.compiledLines = [];
      this.cachedLineNodes = [];
      if (this.codePlane) this.codePlane.innerHTML = "";
      if (this.defaultVisualSettings && this.settings) {
        Object.assign(this.settings, this.defaultVisualSettings);
        if (typeof this.syncSettingsPanelInputs === "function") this.syncSettingsPanelInputs();
        if (typeof this.updatePillFocusState === "function") this.updatePillFocusState();
        if (typeof this.applyVisualSettings === "function") this.applyVisualSettings();
      }
    } catch (fallbackErr) {
      console.error("[Cider IDE Lyrics Visualizer] Error during fallback:", fallbackErr);
    }
  }

  cleanIdent(raw, fallback = "_") {
    if (!raw) return fallback;
    const str = String(raw).trim();
    if (!str) return fallback;
    try {
      const stripped = str
        .replace(/^[^\p{L}\p{N}\p{M}\u200c\u200d*]+|[^\p{L}\p{N}\p{M}\u200c\u200d*]+$/gu, "")
        .replace(/['’‘ʻʼ`"“”«»]/gu, "")
        .replace(/[^\p{L}\p{N}\p{M}\u200c\u200d*]/gu, "_");
      if (!stripped) {
        return (fallback && !/^w\d+$/i.test(fallback)) ? fallback : str;
      }
      if (/^\*+$/.test(stripped)) return "_".repeat(Math.min(4, stripped.length));
      return stripped.replace(/\*/g, "_").toLowerCase();
    } catch {
      return (fallback && !/^w\d+$/i.test(fallback)) ? fallback : str;
    }
  }

  extractInlineAdlibs(rawWords, wordTimings, wordTimes, wordEndTimes) {
    const mainWords = [];
    const mainTimings = [];
    const mainWordTimes = [];
    const mainWordEndTimes = [];
    const adlibParts = [];
    let depth = 0;

    for (let i = 0; i < rawWords.length; i++) {
      const w = rawWords[i];
      const str = typeof w === "string" ? w : (w?.text || String(w || ""));
      const opens = (str.match(/[(\uFF08]/g) || []).length;
      const closes = (str.match(/[)\uFF09]/g) || []).length;

      if (depth > 0) {
        const cleaned = str.replace(/[()\uFF08\uFF09]/g, "").trim();
        if (cleaned) adlibParts.push(cleaned);
        depth = Math.max(0, depth + opens - closes);
        continue;
      }

      if (opens > 0) {
        if (/^[(\uFF08]/.test(str.trim())) {
          const cleaned = str.replace(/[()\uFF08\uFF09]/g, "").trim();
          if (cleaned) adlibParts.push(cleaned);
          depth = Math.max(0, opens - closes);
          continue;
        }
        // Inline mixed token e.g. city(yeah)
        let stripped = str;
        const inlineMatches = str.match(/[(\uFF08][^)\uFF09]*[)\uFF09]/g);
        if (inlineMatches) {
          inlineMatches.forEach((m) => {
            const inner = m.replace(/[()\uFF08\uFF09]/g, "").trim();
            if (inner) adlibParts.push(inner);
          });
          stripped = str.replace(/[(\uFF08][^)\uFF09]*[)\uFF09]/g, "").trim();
        }
        const remOpens = (stripped.match(/[(\uFF08]/g) || []).length;
        const remCloses = (stripped.match(/[)\uFF09]/g) || []).length;
        if (remOpens > remCloses) {
          const idxOpen = stripped.search(/[(\uFF08]/);
          const tail = stripped.slice(idxOpen).replace(/[()\uFF08\uFF09]/g, "").trim();
          if (tail) adlibParts.push(tail);
          stripped = stripped.slice(0, idxOpen).trim();
          depth = Math.max(0, remOpens - remCloses);
        }
        if (stripped) {
          mainWords.push(typeof w === "string" ? stripped : { ...w, text: stripped });
          if (Array.isArray(wordTimings)) mainTimings.push(wordTimings[i]);
          if (Array.isArray(wordTimes)) mainWordTimes.push(wordTimes[i]);
          if (Array.isArray(wordEndTimes)) mainWordEndTimes.push(wordEndTimes[i]);
        }
        continue;
      }

      mainWords.push(w);
      if (Array.isArray(wordTimings)) mainTimings.push(wordTimings[i]);
      if (Array.isArray(wordTimes)) mainWordTimes.push(wordTimes[i]);
      if (Array.isArray(wordEndTimes)) mainWordEndTimes.push(wordEndTimes[i]);
    }

    return {
      mainWords,
      mainTimings: Array.isArray(wordTimings) ? mainTimings : undefined,
      mainWordTimes: Array.isArray(wordTimes) ? mainWordTimes : undefined,
      mainWordEndTimes: Array.isArray(wordEndTimes) ? mainWordEndTimes : undefined,
      adlibText: adlibParts.join(" ").trim()
    };
  }

  compileLyricsArray(rawLines) {
    try {
      if (!Array.isArray(rawLines) || rawLines.length === 0) return [];
      this._lastRawLyrics = rawLines;
      const adlibMode = ["separate", "hide", "inline"].includes(this.settings.adlibMode) ? this.settings.adlibMode : "separate";
      const styleMode = this.settings.syntaxStyle || "mixed";
      const RTL_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u0590-\u05FF]/u;
      const anyRtlInSong = rawLines.some((r) => {
        const txt = typeof r === "string" ? r : (r.text || (Array.isArray(r.words) ? r.words.map(w => typeof w === "string" ? w : (w?.text || "")).join(" ") : ""));
        return RTL_REGEX.test(txt);
      });
      if (this.settings.textDirection === "rtl") {
        this.isRtlSong = true;
      } else if (this.settings.textDirection === "ltr") {
        this.isRtlSong = false;
      } else {
        this.isRtlSong = anyRtlInSong;
      }
      return rawLines.map((item, idx) => {
        const lineStart = typeof item.startTime === "number" ? item.startTime : idx * 2.6;
        const nextItem = rawLines[idx + 1];
        const fallbackDur =
          nextItem && typeof nextItem.startTime === "number" && nextItem.startTime > lineStart
            ? Math.min(6.0, Math.max(0.8, nextItem.startTime - lineStart))
            : 2.6;
        const rawDur =
          typeof item.endTime === "number" && item.endTime > lineStart
            ? Math.max(0.4, item.endTime - lineStart)
            : fallbackDur;
        const lineEnd = lineStart + rawDur;

        let rawWords =
          Array.isArray(item.words) && item.words.length > 0
            ? item.words
            : (item.text || "").split(/\s+/).filter(Boolean);
        let itemWordTimings = item.wordTimings;
        let itemWordTimes = item.wordTimes;
        let itemWordEndTimes = item.wordEndTimes;
        let extractedAdlib = "";
        let isAdlibOnlyLine = false;
        let isHiddenAdlibLine = false;

        if (adlibMode !== "inline" && rawWords.length > 0) {
          const splitRes = this.extractInlineAdlibs(rawWords, itemWordTimings, itemWordTimes, itemWordEndTimes);
          if (splitRes.adlibText) {
            extractedAdlib = splitRes.adlibText;
            if (splitRes.mainWords.length === 0) {
              isAdlibOnlyLine = true;
              if (adlibMode === "hide") isHiddenAdlibLine = true;
            } else {
              rawWords = splitRes.mainWords;
              itemWordTimings = splitRes.mainTimings;
              itemWordTimes = splitRes.mainWordTimes;
              itemWordEndTimes = splitRes.mainWordEndTimes;
            }
          }
        }

        // Smart CJK Segmentation: If an unspaced line contains CJK characters, segment into natural words
        const cjkRegex = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/u;
        if (rawWords.length <= 1 && item.text && cjkRegex.test(item.text)) {
          const cjkTokens = item.text.match(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]{1,3}|[^\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\s]+|\s+/gu);
          if (cjkTokens && cjkTokens.length > 1) {
            rawWords = cjkTokens.map(s => s.trim()).filter(Boolean);
          }
        }
        const words =
          rawWords.length > 0
            ? rawWords.map((w, i) => {
                const wordStr = typeof w === "string" ? w : (w?.text || String(w || ""));
                const cleaned = this.cleanIdent(wordStr, wordStr || `w${i}`);
                return cleaned || wordStr || `w${i}`;
              })
            : ["sync"];
        const n = words.length;

      // Compute character-weighted proportional fallback timings (matching Cider's spreadTimings)
      const weights = words.map((w) => Math.max(2, w.length));
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      const vocalSpan = rawDur * 0.92;
      let accWeight = 0;
      const wordTimings = words.map((w, i) => {
        const propStart = lineStart + (vocalSpan * accWeight) / totalWeight;
        accWeight += weights[i];
        const propEnd = lineStart + (vocalSpan * accWeight) / totalWeight;

        const explicitStart =
          typeof itemWordTimings?.[i]?.start === "number"
            ? itemWordTimings[i].start
            : typeof itemWordTimes?.[i] === "number"
              ? itemWordTimes[i]
              : undefined;
        const explicitEnd =
          typeof itemWordTimings?.[i]?.end === "number"
            ? itemWordTimings[i].end
            : typeof itemWordEndTimes?.[i] === "number"
              ? itemWordEndTimes[i]
              : undefined;

        const start = typeof explicitStart === "number" ? explicitStart : propStart;
        const nextExplicitStart =
          i + 1 < n
            ? typeof itemWordTimings?.[i + 1]?.start === "number"
              ? itemWordTimings[i + 1].start
              : typeof itemWordTimes?.[i + 1] === "number"
                ? itemWordTimes[i + 1]
                : undefined
            : undefined;
        const end =
          typeof explicitEnd === "number" && explicitEnd > start
            ? explicitEnd
            : typeof nextExplicitStart === "number" && nextExplicitStart > start
              ? nextExplicitStart
              : Math.max(start + 0.08, propEnd);

        const vocalDur = Math.max(0.06, end - start);
        // Live typing duration: types across the word briskly as the artist pronounces it
        const typeDur = Math.min(
          vocalDur * 0.82,
          Math.max(0.08, w.length * 0.048)
        );

        return {
          wordIndex: i,
          text: w,
          start,
          end,
          typeEnd: start + typeDur,
          syllables: itemWordTimings?.[i]?.syllables
        };
      });

      const wStart = (i) => wordTimings[Math.min(n - 1, Math.max(0, i))].start;
      const wTypeEnd = (i) => wordTimings[Math.min(n - 1, Math.max(0, i))].typeEnd;

      const tokens = [];
      // Alternate colors across consecutive words so adjacent words are always visually distinct
      const argCycle = ["arg", "variable", "property", "keyword"];

      const pushWordTok = (wordIdx, type) => {
        const wt = wordTimings[wordIdx];
        tokens.push({
          text: words[wordIdx],
          type,
          isWord: true,
          wordIndex: wordIdx,
          time: wt.start,
          endTime: wt.typeEnd,
          holdEndTime: wt.end,
          syllables: wt.syllables
        });
      };

      const pushInfixSyntax = (text, type, afterWordIdx) => {
        const prevTypeEnd = wTypeEnd(afterWordIdx);
        const nextStart = afterWordIdx + 1 < n ? wStart(afterWordIdx + 1) : prevTypeEnd + 0.05;
        const sepStart = Math.min(
          nextStart - 0.01,
          Math.max(prevTypeEnd, nextStart - 0.06)
        );
        tokens.push({
          text,
          type,
          isWord: false,
          wordIndex: afterWordIdx,
          time: sepStart,
          endTime: Math.max(sepStart + 0.015, nextStart)
        });
      };

      const pushTrailSyntax = (text, type) => {
        const lastEnd = wTypeEnd(n - 1);
        tokens.push({
          text,
          type,
          isWord: false,
          wordIndex: n - 1,
          time: lastEnd,
          endTime: lastEnd + 0.05
        });
      };

      const pushCommaArgs = (startIdx, endIdx) => {
        pushInfixSyntax("(", "bracket", Math.max(0, startIdx - 1));
        for (let i = startIdx; i < endIdx; i++) {
          if (i > startIdx) {
            pushInfixSyntax(", ", "operator", i - 1);
          }
          const tType = argCycle[(i - startIdx) % argCycle.length];
          pushWordTok(i, tType);
        }
        if (endIdx < n) {
          pushInfixSyntax(")", "bracket", endIdx - 1);
        } else {
          pushTrailSyntax(")", "bracket");
        }
      };

      const patternIndex =
        styleMode === "oop" ? 1 :
        styleMode === "control" ? 2 :
        styleMode === "pattern" ? 3 :
        idx % 4;

      // All 4 IDE patterns write ONLY the actual song lyric words separated by IDE operators (=, ., ,, (), =>)
      // No fake English words (like 'try', 'catch', 'true') are injected into the lyric lines.
      if (patternIndex === 0) {
        // Pattern 0 — IDE Property Assignment & Call: w0.w1 = w2.w3(w4, w5, w6)
        if (n === 1) {
          pushWordTok(0, "method");
          pushTrailSyntax("()", "bracket");
        } else if (n === 2) {
          pushWordTok(0, "variable");
          pushInfixSyntax(" = ", "operator", 0);
          pushWordTok(1, "keyword");
        } else if (n === 3) {
          pushWordTok(0, "variable");
          pushInfixSyntax(".", "dot", 0);
          pushWordTok(1, "property");
          pushInfixSyntax(" = ", "operator", 1);
          pushWordTok(2, "keyword");
        } else if (n === 4) {
          pushWordTok(0, "variable");
          pushInfixSyntax(".", "dot", 0);
          pushWordTok(1, "property");
          pushInfixSyntax(" = ", "operator", 1);
          pushWordTok(2, "method");
          pushCommaArgs(3, 4);
        } else if (n === 5) {
          pushWordTok(0, "variable");
          pushInfixSyntax(".", "dot", 0);
          pushWordTok(1, "property");
          pushInfixSyntax(" = ", "operator", 1);
          pushWordTok(2, "method");
          pushCommaArgs(3, 5);
        } else {
          pushWordTok(0, "variable");
          pushInfixSyntax(".", "dot", 0);
          pushWordTok(1, "property");
          pushInfixSyntax(" = ", "operator", 1);
          pushWordTok(2, "keyword");
          pushInfixSyntax(".", "dot", 2);
          pushWordTok(3, "method");
          pushCommaArgs(4, n);
        }
      } else if (patternIndex === 1) {
        // Pattern 1 — Chained OOP Method Call: w0.w1(w2, w3).w4(w5, w6)
        if (n === 1) {
          pushWordTok(0, "method");
          pushTrailSyntax("()", "bracket");
        } else if (n === 2) {
          pushWordTok(0, "variable");
          pushInfixSyntax(".", "dot", 0);
          pushWordTok(1, "method");
          pushTrailSyntax("()", "bracket");
        } else if (n <= 4) {
          pushWordTok(0, "variable");
          pushInfixSyntax(".", "dot", 0);
          pushWordTok(1, "method");
          pushCommaArgs(2, n);
        } else {
          const midSplit = Math.min(4, Math.max(3, Math.ceil(n / 2)));
          pushWordTok(0, "variable");
          pushInfixSyntax(".", "dot", 0);
          pushWordTok(1, "method");
          pushCommaArgs(2, midSplit);
          pushInfixSyntax(".", "dot", midSplit - 1);
          pushWordTok(midSplit, "method");
          if (midSplit + 1 < n) {
            pushCommaArgs(midSplit + 1, n);
          } else {
            pushTrailSyntax("()", "bracket");
          }
        }
      } else if (patternIndex === 2) {
        // Pattern 2 — Direct Assignment & Member Call: w0 = w1.w2(w3, w4, w5)
        if (n === 1) {
          pushWordTok(0, "method");
          pushTrailSyntax("()", "bracket");
        } else if (n === 2) {
          pushWordTok(0, "variable");
          pushInfixSyntax(" = ", "operator", 0);
          pushWordTok(1, "arg");
        } else if (n === 3) {
          pushWordTok(0, "variable");
          pushInfixSyntax(" = ", "operator", 0);
          pushWordTok(1, "method");
          pushCommaArgs(2, 3);
        } else {
          pushWordTok(0, "variable");
          pushInfixSyntax(" = ", "operator", 0);
          pushWordTok(1, "property");
          pushInfixSyntax(".", "dot", 1);
          pushWordTok(2, "method");
          pushCommaArgs(3, n);
        }
      } else {
        // Pattern 3 — Arrow Pipeline Expression: w0.w1 => w2.w3(w4, w5, w6)
        if (n === 1) {
          pushWordTok(0, "variable");
          pushTrailSyntax("()", "bracket");
        } else if (n === 2) {
          pushWordTok(0, "variable");
          pushInfixSyntax(" => ", "operator", 0);
          pushWordTok(1, "method");
          pushTrailSyntax("()", "bracket");
        } else if (n === 3) {
          pushWordTok(0, "variable");
          pushInfixSyntax(".", "dot", 0);
          pushWordTok(1, "property");
          pushInfixSyntax(" => ", "operator", 1);
          pushWordTok(2, "method");
          pushTrailSyntax("()", "bracket");
        } else if (n === 4) {
          pushWordTok(0, "variable");
          pushInfixSyntax(".", "dot", 0);
          pushWordTok(1, "property");
          pushInfixSyntax(" => ", "operator", 1);
          pushWordTok(2, "method");
          pushCommaArgs(3, 4);
        } else {
          pushWordTok(0, "variable");
          pushInfixSyntax(".", "dot", 0);
          pushWordTok(1, "property");
          pushInfixSyntax(" => ", "operator", 1);
          pushWordTok(2, "keyword");
          pushInfixSyntax(".", "dot", 2);
          pushWordTok(3, "method");
          pushCommaArgs(4, n);
        }
      }

      const RTL_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u0590-\u05FF]/u;
      const fullLineText = item.text || words.join(" ");
      const isLineRtl = RTL_REGEX.test(fullLineText);
      const rawBgText = (item.bgText || "").trim();
      const adlibCombined = isAdlibOnlyLine
        ? rawBgText
        : [rawBgText, extractedAdlib].filter((v, i, arr) => v && arr.indexOf(v) === i).join(" · ").trim();
      return {
        start: lineStart,
        end: lineEnd,
        hasRealTimestamp: !!item.hasRealTimestamp,
        spacerAfter: idx % 3 === 2,
        wordCount: n,
        wordTimings,
        tokens,
        isRtl: isLineRtl,
        afterEmptyMarker: !!item.afterEmptyMarker,
        roman: (item.roman || "").trim(),
        trans: (item.trans || "").trim(),
        bgText: rawBgText,
        adlibText: adlibCombined,
        isAdlibOnlyLine,
        isHiddenAdlibLine,
        text: fullLineText
      };
    });
  } catch (err) {
    this.fallbackToNativeLyrics(err);
    return [];
  }
}

  buildCodeDOM() {
    try {
      if (!this.codePlane) return;
      this.codePlane.innerHTML = "";
      this.cachedLineNodes = [];
      this.codePlane.classList.toggle("is-rtl", !!this.isRtlSong);

      this.compiledLines.forEach((line, lIdx) => {
        const row = document.createElement("div");
        const rowIsRtl = this.settings.textDirection === "ltr"
          ? false
          : (this.settings.textDirection === "rtl" ? true : Boolean(this.isRtlSong || line.isRtl));
        row.className = `cider-ide-line${rowIsRtl ? " is-rtl" : ""}${line.isAdlibOnlyLine ? " is-adlib-only-line" : ""}${line.isHiddenAdlibLine ? " is-adlib-hidden" : ""}${lIdx > 0 ? " is-future-line" : ""}`;
        if (lIdx > 0) {
          row.style.opacity = "0";
          row.style.visibility = "hidden";
          row.style.pointerEvents = "none";
        }
        row.dataset.lineIndex = lIdx;
        row.title = line.hasRealTimestamp
          ? `Jump song to ${this.formatTime(line.start)}`
          : `Click to jump song to line ${lIdx + 1}`;

        row.addEventListener("click", (e) => {
          e.stopPropagation();
          const domNodes = this.getValidLyricLineNodes();
          if (domNodes && domNodes[lIdx] && (domNodes.length === this.compiledLines.length || !line.hasRealTimestamp)) {
            try {
              domNodes[lIdx].click();
              this.lastDomActiveIdx = lIdx;
              this.currentTime = line.start + 0.05;
              this._lastRawAudioTime = this.currentTime;
              this.domSyncedTime = this.currentTime;
              this.audioState.bassPulse = Math.max(this.audioState.bassPulse, 0.85);
              this.syncWordCursor(this.getSyncAdjustedTime(this.currentTime), true);
              return;
            } catch {}
          }
          this.seekToTime(line.start);
        });

        const gutter = document.createElement("span");
        gutter.className = "cider-line-gutter";
        gutter.textContent = String(lIdx + 1).padStart(2, "0");
        row.appendChild(gutter);

        const tokenWrap = document.createElement("span");
        tokenWrap.className = "cider-line-tokens";

        // Group each lyric word and its trailing punctuation (., =, ,, )) into a non-breaking
        // word cluster so commas/dots/brackets never wrap onto the beginning of a new line
        const tokenSpans = [];
        const clustersByWord = new Map();

        line.tokens.forEach((tok, tIdx) => {
          const wIdx = typeof tok.wordIndex === "number" ? tok.wordIndex : 0;
          let cluster = clustersByWord.get(wIdx);
          if (!cluster) {
            cluster = document.createElement("span");
            cluster.className = "cider-word-cluster";
            cluster.dataset.wordIndex = wIdx;
            clustersByWord.set(wIdx, cluster);
            tokenWrap.appendChild(cluster);
          }

          const span = document.createElement("span");
          span.className = `cider-code-token cider-tok-${tok.type}${
            tok.isWord ? " is-lyric-word" : " is-syntax-punct"
          }`;
          span.dataset.tokenIndex = tIdx;

          const typedSpan = document.createElement("span");
          typedSpan.className = "cider-tok-typed";
          typedSpan.textContent = tok.text;

          const untypedSpan = document.createElement("span");
          untypedSpan.className = "cider-tok-untyped";
          untypedSpan.textContent = "";

          span.appendChild(typedSpan);
          span.appendChild(untypedSpan);

          cluster.appendChild(span);
          tokenSpans.push({
            el: span,
            clusterEl: cluster,
            typedSpan,
            untypedSpan,
            tok,
            lastTypedCount: tok.text.length
          });
        });

        if (line.hasRealTimestamp) {
          const timeBadge = document.createElement("span");
          timeBadge.className = "cider-line-time-badge";
          timeBadge.textContent = `▶ ${this.formatTime(line.start)}`;
          tokenWrap.appendChild(timeBadge);
        }

        const annoMode = this.settings.annotationMode || "both";
        const adlibMode = ["separate", "hide", "inline"].includes(this.settings.adlibMode) ? this.settings.adlibMode : "separate";
        const showBg = this.settings.showBackgroundVocals !== false;
        const commentParts = [];
        if ((annoMode === "roman" || annoMode === "both") && line.roman) commentParts.push(line.roman);
        if ((annoMode === "trans" || annoMode === "both") && line.trans) commentParts.push(line.trans);
        const mainComment = commentParts.length ? `// ${commentParts.join(" · ")}` : "";
        const bgComment = (adlibMode === "inline" && showBg && line.bgText) ? `/* bg: ${line.bgText} */` : "";
        const fullComment = [mainComment, bgComment].filter(Boolean).join("  ");
        if (fullComment) {
          const commentEl = document.createElement("div");
          commentEl.className = "cider-ide-line-comment code-comment";
          commentEl.textContent = fullComment;
          tokenWrap.appendChild(commentEl);
        }
        if (adlibMode === "separate" && showBg && line.adlibText) {
          const adlibEl = document.createElement("div");
          adlibEl.className = "cider-ide-line-adlib code-comment";
          adlibEl.textContent = `// ${line.adlibText}`;
          tokenWrap.appendChild(adlibEl);
        }

        row.appendChild(tokenWrap);
        this.codePlane.appendChild(row);
        this.cachedLineNodes.push({
          row,
          tokenSpans,
          clusters: Array.from(clustersByWord.values()),
          lineState: ""
        });

        if (line.spacerAfter) {
          const spacer = document.createElement("div");
          spacer.className = "cider-ide-line spacer-line";
          this.codePlane.appendChild(spacer);
        }
      });

      this.cursor = document.createElement("span");
      this.cursor.className = "cider-ide-cursor";
      this.codePlane.appendChild(this.cursor);

      this.activeLineIndex = -1;
      this.activeTokenIndex = -1;
      this.activeWordIndex = -1;
      this._lastTypingSig = "";
      this.syncWordCursor(this.getSyncAdjustedTime(this.domSyncedTime ?? this.currentTime), true);
    } catch (err) {
      this.fallbackToNativeLyrics(err);
    }
  }

  computeTokenTypedChars(tok, timeSec) {
    const fullLen = tok.text.length;
    if (fullLen <= 0) return 0;
    if (timeSec < tok.time) return 0;
    if (timeSec >= tok.endTime) return fullLen;

    // If syllable timings exist for this word, pace character typing across syllables
    if (Array.isArray(tok.syllables) && tok.syllables.length > 1) {
      let accChars = 0;
      for (let sIdx = 0; sIdx < tok.syllables.length; sIdx++) {
        const syl = tok.syllables[sIdx];
        const sylLen = Math.max(1, (syl.text || "").length);
        const sStart = typeof syl.start === "number" ? syl.start : tok.time;
        const sEnd =
          typeof syl.end === "number" && syl.end > sStart
            ? syl.end
            : sStart + 0.12;
        if (timeSec >= sEnd) {
          accChars += sylLen;
        } else if (timeSec >= sStart) {
          const frac = (timeSec - sStart) / Math.max(0.02, sEnd - sStart);
          accChars += Math.max(1, Math.ceil(frac * sylLen));
          break;
        } else {
          break;
        }
      }
      return Math.max(1, Math.min(fullLen, accChars));
    }

    const dur = Math.max(0.015, tok.endTime - tok.time);
    const ratio = Math.max(0, Math.min(1, (timeSec - tok.time) / dur));
    return Math.max(1, Math.min(fullLen, Math.ceil(ratio * fullLen)));
  }

  setTokenSplitText(tokenEntry, typedCount, keepLayout = false) {
    const fullText = tokenEntry.tok.text;
    const clamped = Math.max(0, Math.min(fullText.length, typedCount));
    if (tokenEntry.lastTypedCount !== clamped || tokenEntry.lastKeepLayout !== keepLayout) {
      tokenEntry.typedSpan.textContent = clamped > 0 ? fullText.slice(0, clamped) : "";
      tokenEntry.untypedSpan.textContent = keepLayout && clamped < fullText.length ? fullText.slice(clamped) : "";
      tokenEntry.lastTypedCount = clamped;
      tokenEntry.lastKeepLayout = keepLayout;
    }
    const isUntyped = clamped === 0;
    const isTyping = clamped > 0 && clamped < fullText.length;
    const isTyped = clamped === fullText.length;
    tokenEntry.el.classList.toggle("is-untyped-token", isUntyped);
    tokenEntry.el.classList.toggle("is-typing-token", isTyping);
    tokenEntry.el.classList.toggle("is-typed-token", isTyped);
    if (keepLayout) {
      tokenEntry.el.style.display = "inline-block";
      tokenEntry.el.style.visibility = isUntyped ? "hidden" : "visible";
    } else {
      tokenEntry.el.style.display = isUntyped ? "none" : "inline-block";
      tokenEntry.el.style.visibility = "";
    }
  }

  updateInterludeIndicator(timeSec, activeL) {
    if (!this.interludeEl || !this.interludeLabelEl || !this.interludeFillEl) return;
    const lines = this.compiledLines;
    if (!lines || !lines.length) {
      this.interludeEl.classList.remove("is-visible");
      return;
    }

    let show = false;
    let remaining = 0;
    let progress = 0;
    const firstLine = lines[0];

    if (activeL === 0 && timeSec < firstLine.start - 0.15) {
      const introDur = firstLine.start;
      if (introDur >= 3.5 || (firstLine.afterEmptyMarker && introDur >= 1.5)) {
        show = true;
        remaining = Math.max(0, firstLine.start - timeSec);
        progress = Math.max(0, Math.min(1, timeSec / Math.max(0.1, introDur)));
      }
    } else if (activeL >= 0 && activeL < lines.length - 1) {
      const curLine = lines[activeL];
      const nextLine = lines[activeL + 1];
      const gapStart = curLine.end;
      const gapEnd = nextLine.start;
      const gapDur = gapEnd - gapStart;
      if ((gapDur >= 3.5 || (nextLine.afterEmptyMarker && gapDur >= 1.5)) && timeSec >= gapStart + 0.15 && timeSec < gapEnd - 0.05) {
        show = true;
        remaining = Math.max(0, gapEnd - timeSec);
        progress = Math.max(0, Math.min(1, (timeSec - gapStart) / Math.max(0.1, gapDur)));
      }
    }

    this.interludeEl.classList.toggle("is-visible", show);
    if (show) {
      this.interludeLabelEl.textContent = `// await vocals(${remaining.toFixed(1)}s)`;
      this.interludeFillEl.style.width = `${(progress * 100).toFixed(1)}%`;
    }
  }

  syncWordCursor(timeSec, forceUpdate = false) {
    try {
      if (!this.compiledLines.length) return;
      let activeL = 0;

      for (let i = 0; i < this.compiledLines.length; i++) {
        if (timeSec >= this.compiledLines[i].start) activeL = i;
      }

      this.updateInterludeIndicator(timeSec, activeL);

      const lineObj = this.compiledLines[activeL];
      let activeWordIdx = -1;
      let cursorTokIdx = 0;
      const typedCounts = [];

      if (lineObj) {
        const beforeLineStart = timeSec < lineObj.start - 0.04;
        if (!beforeLineStart) {
          // Determine which lyric word the artist is currently saying
          activeWordIdx = 0;
          for (let w = 0; w < lineObj.wordTimings.length; w++) {
            if (timeSec >= lineObj.wordTimings[w].start) {
              activeWordIdx = w;
            }
          }
        }

        lineObj.tokens.forEach((tok, tIdx) => {
          let count = 0;
          if (beforeLineStart) {
            count = 0;
          } else if (tok.isWord) {
            if (tok.wordIndex < activeWordIdx) {
              count = tok.text.length;
            } else if (tok.wordIndex === activeWordIdx) {
              count = Math.max(1, this.computeTokenTypedChars(tok, timeSec));
            } else {
              count = 0;
            }
          } else {
            // Syntax punctuation token: type if its attached word has been reached
            if (tok.wordIndex < activeWordIdx) {
              count = tok.text.length;
            } else if (tok.wordIndex === activeWordIdx) {
              count = this.computeTokenTypedChars(tok, timeSec);
            } else {
              count = 0;
            }
          }
          typedCounts.push(count);
          if (count > 0) cursorTokIdx = tIdx;
        });
      }

      const activeNode = this.cachedLineNodes[activeL];
      if (activeNode && activeNode.row && this.codePlane) {
        const planeCenterY = this.codePlane.offsetHeight / 2;
        const activeLineCenterY = activeNode.row.offsetTop + activeNode.row.offsetHeight / 2;
        this.targetScrollRem = planeCenterY - activeLineCenterY;
      } else {
        const focalOffsetLines = Math.max(0, activeL - 1.75);
        this.targetScrollRem = -focalOffsetLines * 42;
      }

      const revealMode = normalizeRevealMode(this.settings.lyricRevealMode);
      const lineDoneFlag = lineObj && timeSec > lineObj.end + 0.35 ? 1 : 0;
      const am = this.getAppleMusicStore();
      const mk = window.MusicKit?.getInstance?.();
      const pausedFlag = ((am && am.isPlaying === false) || (mk && mk.isPlaying === false)) ? 1 : 0;
      const typingSig = `${revealMode}:${activeL}:${activeWordIdx}:${cursorTokIdx}:${lineDoneFlag}:${pausedFlag}:${typedCounts.join(",")}`;
      if (!forceUpdate && typingSig === this._lastTypingSig) {
        this.updateWordTrackingPan(timeSec);
        return;
      }

      if (activeL !== this.activeLineIndex || activeWordIdx !== this.activeWordIndex) {
        this.audioState.bassPulse = Math.max(this.audioState.bassPulse, 0.55);
      } else {
        this.audioState.bassPulse = Math.max(this.audioState.bassPulse, 0.22);
      }

      this._lastTypingSig = typingSig;
      this.activeLineIndex = activeL;
      this.activeTokenIndex = cursorTokIdx;
      this.activeWordIndex = activeWordIdx;
      this.activeTypedCounts = typedCounts;
      this.updateTokenVisuals(timeSec);
    } catch (err) {
      this.fallbackToNativeLyrics(err);
    }
  }

  updateTokenVisuals(timeSec = this.getSyncAdjustedTime(this.currentTime)) {
    try {
      if (!this.cachedLineNodes.length) return;
    const activeL = Math.max(0, this.activeLineIndex);
    const cursorT = Math.max(0, this.activeTokenIndex);
    const activeW = this.activeWordIndex ?? 0;
    const typedCounts = this.activeTypedCounts || [];
    const dofMult = this.settings.linuxLowSpecMode
      ? this.settings.dofStrength * 0.35
      : this.settings.dofStrength;

    const activeLineObj = this.compiledLines[activeL];
    const lineFinishedHolding =
      activeLineObj && timeSec > activeLineObj.end + 0.35;
    const isTypewriter = normalizeRevealMode(this.settings.lyricRevealMode) === "typewriter";
    if (this.root) this.root.classList.toggle("is-typewriter", isTypewriter);
    if (this.codePlane) this.codePlane.classList.toggle("is-typewriter", isTypewriter);

    const am = this.getAppleMusicStore();
    const mk = window.MusicKit?.getInstance?.();
    const explicitlyPaused = Boolean((am && am.isPlaying === false) || (mk && mk.isPlaying === false));

    // Detect if singing/vocals are actively occurring right now (for dynamic zoom in/out)
    let isSpeakingNow = false;
    if (activeLineObj && activeL >= 0) {
      const inLineVocalWindow = (timeSec >= activeLineObj.start - 0.08 && timeSec <= activeLineObj.end + 0.35);
      if (inLineVocalWindow && !lineFinishedHolding) {
        if (this.activeTokenIndex >= 0 && activeLineObj.tokens[this.activeTokenIndex]) {
          const curTok = activeLineObj.tokens[this.activeTokenIndex];
          const wordEnd = curTok.holdEndTime ?? curTok.endTime ?? (curTok.time + 0.35);
          if (timeSec >= curTok.time - 0.08 && timeSec <= wordEnd + 0.22) {
            isSpeakingNow = true;
          }
        } else {
          isSpeakingNow = true;
        }
      }
    }
    this.isCurrentlySpeaking = isSpeakingNow;
    this.activeVocalWordEl = null;
    if (!this.isCurrentlySpeaking) {
      if (this.settings.wordTrackingMode === "stable" || this.settings.wordTracking === false) {
        this.targetPanX = 0;
        this.sustainedPanX = 0;
      }
    }

    const bounceTokensToRestart = [];
    this.cachedLineNodes.forEach((lineNode, lIdx) => {
      const { row, tokenSpans, clusters } = lineNode;
      const lineDist = Math.abs(lIdx - activeL);
      const isPastLine = lIdx < activeL;
      const isActiveLine = lIdx === activeL;
      const isFutureLine = lIdx > activeL;
      const isNear1 = !isActiveLine && lineDist === 1;
      const isNear2 = !isActiveLine && lineDist === 2;
      const isFarLine = !isActiveLine && lineDist >= 3;

      row.classList.toggle("is-past-line", isPastLine);
      row.classList.toggle("is-active-line", isActiveLine);
      row.classList.toggle("is-future-line", isFutureLine);
      row.classList.toggle("is-near-1", isNear1);
      row.classList.toggle("is-near-2", isNear2);
      row.classList.toggle("is-far-line", isFarLine);

      const hideLine = isFutureLine || (Boolean(this.settings.activeLineOnly) && !isActiveLine);
      if (hideLine) {
        row.style.opacity = "0";
        row.style.visibility = "hidden";
        row.style.pointerEvents = "none";
      } else {
        row.style.visibility = "visible";
        row.style.pointerEvents = "auto";
        row.style.opacity = "1";
      }

      const isCompact = this._isCompact ?? this.root?.classList?.contains("is-compact");
      const isChroma = isChromaBackdrop(this.settings.backdropMode);

      // Tiered depth-of-field blur cascade: flat & unblurred in compact, chroma-key, or active line
      let rawBlur = 0;
      if (!hideLine && !isCompact && !isChroma && isPastLine && dofMult > 0) {
        if (isNear1) rawBlur = Math.min(2.5, 0.75 * dofMult);
        else if (isNear2) rawBlur = Math.min(4.5, 1.85 * dofMult);
        else rawBlur = Math.min(8.0, (2.4 + (lineDist - 2) * 0.85) * dofMult);
      }
      const lineBlur = Math.min(8.0, rawBlur);
      row.style.filter = lineBlur > 0.15 ? `blur(${lineBlur.toFixed(2)}px)` : "none";

      const chromaOffset = (isCompact || isChroma)
        ? 0
        : (lineDist > 1 ? (lineDist - 1) * 0.55 : 0) * this.settings.chromaStrength;

      const tokenWrap = row.querySelector(".cider-line-tokens");
      let twCaretEl = tokenWrap ? tokenWrap.querySelector(".cider-tw-caret") : null;
      let caretAnchorTok = null;
      let caretPct = 100;

      tokenSpans.forEach((tokenEntry, tIdx) => {
        const { el: tokEl, tok } = tokenEntry;

        if (isPastLine) {
          this.setTokenSplitText(tokenEntry, tok.text.length);
          tokEl.classList.remove("active-word", "spoken-word", "is-sung", "is-upcoming", "is-typing", "is-untyped");
          tokEl.style.removeProperty("--type-pct");
          tokEl.style.opacity = "0.95";
          if (isChroma) {
            tokEl.style.textShadow = `0 1px 2px rgba(0, 0, 0, 0.85)`;
          } else if (chromaOffset > 0.35) {
            tokEl.style.textShadow = `
              ${chromaOffset.toFixed(1)}px 0px 1px ${this.palette.method},
              -${chromaOffset.toFixed(1)}px 0px 1px rgba(0, 230, 255, 0.65)
            `;
          } else {
            tokEl.style.textShadow = `0 1px 4px rgba(0, 0, 0, 0.85)`;
          }
        } else if (isFutureLine) {
          // Future lines are completely hidden until reached so they do not pre-render and re-type
          this.setTokenSplitText(tokenEntry, 0);
          tokEl.classList.remove("active-word", "spoken-word", "is-sung", "is-upcoming", "is-typing");
          tokEl.classList.toggle("is-untyped", isTypewriter);
          tokEl.style.removeProperty("--type-pct");
          tokEl.style.opacity = "0";
          tokEl.style.display = "none";
        } else {
          // Active line: Highlight mode or Live Typewriter mode
          const count =
            typeof typedCounts[tIdx] === "number"
              ? typedCounts[tIdx]
              : tIdx <= cursorT
                ? tok.text.length
                : 0;
          const isCurrentVocalWord =
            tok.isWord && tok.wordIndex === activeW && !lineFinishedHolding;
          const isSpokenWord =
            tok.isWord &&
            (tok.wordIndex < activeW || (tok.wordIndex === activeW && lineFinishedHolding));
          const isSungToken =
            !isCurrentVocalWord &&
            (isSpokenWord || (!tok.isWord && activeW >= 0 && (tok.wordIndex < activeW || lineFinishedHolding)));
          const isUpcomingToken =
            !isCurrentVocalWord &&
            !isSungToken &&
            (activeW < 0 || tok.wordIndex > activeW || count === 0);

          if (isTypewriter) {
            // Keep full word text intact so RTL cursive ligatures stay joined and width never jumps
            if (tokenEntry.typedSpan.textContent !== tok.text || tokenEntry.untypedSpan.textContent !== "") {
              tokenEntry.typedSpan.textContent = tok.text;
              tokenEntry.untypedSpan.textContent = "";
            }
            tokenEntry.lastTypedCount = tok.text.length;
            tokenEntry.lastKeepLayout = false;

            tokEl.classList.remove("is-sung", "is-upcoming");
            tokEl.style.display = "inline-block";

            const fullLen = Math.max(1, tok.text.length);
            if (count <= 0) {
              tokEl.classList.add("is-untyped", "is-untyped-token");
              tokEl.classList.remove("is-typing", "is-typing-token", "is-typed-token");
              tokEl.style.removeProperty("--type-pct");
              tokEl.style.visibility = "hidden";
              tokEl.style.opacity = "0";
            } else if (count < fullLen || (isCurrentVocalWord && timeSec < (tok.endTime ?? tok.time))) {
              const pct = Math.min(100, Math.max(0, (count / fullLen) * 100));
              tokEl.classList.remove("is-untyped", "is-untyped-token", "is-typed-token");
              tokEl.classList.add("is-typing", "is-typing-token");
              tokEl.style.setProperty("--type-pct", `${pct.toFixed(1)}%`);
              tokEl.style.visibility = "visible";
              tokEl.style.opacity = "1.0";
              caretAnchorTok = tokEl;
              caretPct = pct;
            } else {
              tokEl.classList.remove("is-untyped", "is-untyped-token", "is-typing", "is-typing-token");
              tokEl.classList.add("is-typed-token");
              tokEl.style.removeProperty("--type-pct");
              tokEl.style.visibility = "visible";
              tokEl.style.opacity = "1.0";
              caretAnchorTok = tokEl;
              caretPct = 100;
            }
          } else {
            tokEl.classList.remove("is-typing", "is-untyped");
            tokEl.style.removeProperty("--type-pct");
            this.setTokenSplitText(tokenEntry, count, true);
            tokEl.style.opacity = "1.0";
            tokEl.classList.toggle("is-sung", isSungToken);
            tokEl.classList.toggle("is-upcoming", isUpcomingToken);
          }

          const wasActive = tokEl.classList.contains("active-word");
          tokEl.classList.toggle("active-word", isCurrentVocalWord);
          tokEl.classList.toggle("spoken-word", isSpokenWord);

          if (isCurrentVocalWord) {
            this.activeVocalWordEl = tokEl;
            if (!wasActive && this.settings.beatBounce) {
              tokEl.classList.remove("is-word-bounce");
              bounceTokensToRestart.push(tokEl);
              this.audioState.bassPulse = Math.max(this.audioState.bassPulse, 0.75);
            }
          } else {
            tokEl.classList.remove("is-word-bounce");
          }

          const glow = typeof this.settings.glowIntensity === "number" ? this.settings.glowIntensity : 1.0;
          const actBlur = (14 * glow).toFixed(1);
          const spkBlur = (8 * glow).toFixed(1);

          if (isChroma) {
            tokEl.style.textShadow = `0 1px 2px rgba(0, 0, 0, 0.85)`;
          } else if (isCurrentVocalWord) {
            tokEl.style.textShadow = `0 0 ${actBlur}px ${this.palette.method}, 0 1px 4px rgba(0, 0, 0, 0.95)`;
          } else if (isSpokenWord) {
            tokEl.style.textShadow = `0 0 ${spkBlur}px ${this.palette.method}55, 0 1px 3px rgba(0, 0, 0, 0.9)`;
          } else {
            tokEl.style.textShadow = `0 1px 3px rgba(0, 0, 0, 0.9)`;
          }

          if (!isTypewriter && tIdx === cursorT && this.cursor && count > 0) {
            tokEl.after(this.cursor);
          }
        }
      });

      // Ensure word clusters on past lines are visible, keep untyped clusters on active line laid out with visibility: hidden, hide future lines completely
      if (Array.isArray(clusters)) {
        clusters.forEach((clusterEl) => {
          if (isFutureLine) {
            clusterEl.classList.add("is-untyped-cluster");
            clusterEl.style.display = "none";
            clusterEl.style.visibility = "hidden";
          } else if (isPastLine) {
            clusterEl.classList.remove("is-untyped-cluster");
            clusterEl.style.display = "inline-flex";
            clusterEl.style.visibility = "visible";
          } else {
            const wIdx = Number(clusterEl.dataset.wordIndex || 0);
            const isClusterVisible = wIdx <= activeW && activeW >= 0;
            clusterEl.classList.toggle("is-untyped-cluster", !isClusterVisible);
            clusterEl.style.display = "inline-flex";
            clusterEl.style.visibility = isClusterVisible ? "visible" : "hidden";
          }
        });
      }

      // Position smooth-gliding GPU IDE caret in Typewriter mode (or hide in Highlight mode / non-active lines)
      if (tokenWrap) {
        if (isTypewriter && isActiveLine) {
          const anchor = caretAnchorTok || tokenSpans[0]?.el || null;
          const pctForCaret = caretAnchorTok ? caretPct : 0;
          if (anchor) {
            if (!twCaretEl) {
              twCaretEl = document.createElement("span");
              twCaretEl.className = "cider-tw-caret tw-caret";
              twCaretEl.setAttribute("aria-hidden", "true");
              tokenWrap.appendChild(twCaretEl);
            }
            const isRtlLine = row.classList.contains("is-rtl");
            const pos = this.getOffsetInContainer(anchor, tokenWrap);
            const anchorW = anchor.offsetWidth || 0;
            const anchorH = anchor.offsetHeight || 24;
            const frac = Math.max(0, Math.min(1, pctForCaret / 100));
            const cx = isRtlLine
              ? pos.left + anchorW * (1 - frac) - 2
              : pos.left + anchorW * frac + 2;
            const cy = pos.top + 2;
            const ch = Math.max(16, anchorH - 4);
            twCaretEl.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
            twCaretEl.style.height = `${ch.toFixed(1)}px`;
            twCaretEl.classList.add("is-visible");
            const isCaretSolid = Boolean(
              this.isCurrentlySpeaking && activeW >= 0 && !lineFinishedHolding && !explicitlyPaused
            );
            twCaretEl.classList.toggle("is-typing-solid", isCaretSolid);
          } else if (twCaretEl) {
            twCaretEl.classList.remove("is-visible", "is-typing-solid");
          }
        } else if (twCaretEl) {
          twCaretEl.classList.remove("is-visible", "is-typing-solid");
        }
      }

      if (!isTypewriter && isActiveLine && this.cursor) {
        const totalTyped = typedCounts.reduce((a, b) => a + b, 0);
        if (totalTyped === 0 && tokenWrap) {
          tokenWrap.prepend(this.cursor);
        }
      }
    });

    if (bounceTokensToRestart.length > 0) {
      void this.codePlane?.offsetWidth; // Single batched reflow after all line updates
      bounceTokensToRestart.forEach((el) => el.classList.add("is-word-bounce"));
    }

    this.updateWordTrackingPan(timeSec);
  } catch (err) {
    this.fallbackToNativeLyrics(err);
  }
}

  getOffsetLeftInPlane(el) {
    let left = 0;
    let cur = el;
    while (cur && cur !== this.codePlane) {
      left += cur.offsetLeft || 0;
      cur = cur.offsetParent;
    }
    return left;
  }

  getOffsetTopInPlane(el) {
    let top = 0;
    let cur = el;
    while (cur && cur !== this.codePlane) {
      top += cur.offsetTop || 0;
      cur = cur.offsetParent;
    }
    return top;
  }

  getOffsetInContainer(el, container) {
    let left = 0;
    let top = 0;
    let cur = el;
    while (cur && cur !== container) {
      left += cur.offsetLeft || 0;
      top += cur.offsetTop || 0;
      cur = cur.offsetParent;
      if (!cur || cur === document.body) break;
    }
    return { left, top };
  }

  updateWordTrackingPan(timeSec) {
    const activeL = Math.max(0, this.activeLineIndex);
    const activeW = this.activeWordIndex ?? -1;
    const activeLineObj = this.compiledLines[activeL];
    const activeNode = this.cachedLineNodes[activeL];
    const row = activeNode?.row;
    const tokenWrap = row?.querySelector(".cider-line-tokens");
    const wordEl = this.activeVocalWordEl;

    // Vertically center the active word's wrapped visual sub-line when a bar wraps onto multiple lines
    if (row && this.codePlane && this.codePlane.offsetHeight > 0 && wordEl && wordEl.offsetHeight > 0) {
      const subTarget = wordEl.closest(".cider-word-cluster") || wordEl;
      const subH = subTarget.offsetHeight || wordEl.offsetHeight || 0;
      if (subH > 0) {
        const subTop = this.getOffsetTopInPlane(subTarget);
        this.targetScrollRem = (this.codePlane.offsetHeight / 2) - (subTop + subH / 2);
      }
    }

    if (!this.settings.dynamicWordZoom || this.settings.wordTracking === false || this.settings.wordTrackingMode === "stable") {
      this.targetPanX = 0;
      return;
    }

    if (!this.isCurrentlySpeaking || !activeLineObj || !row || !tokenWrap || !wordEl || !this.codePlane || activeW < 0) {
      this.targetPanX = 0;
      return;
    }

    const planeWidth = this.codePlane.clientWidth || this.codePlane.offsetWidth || window.innerWidth || 1200;
    if (planeWidth <= 0) {
      this.targetPanX = 0;
      return;
    }

    const clusterEl = wordEl.closest(".cider-word-cluster") || wordEl;
    const wordLeft = this.getOffsetLeftInPlane(clusterEl);
    const wordTop = this.getOffsetTopInPlane(clusterEl);
    const wordW = clusterEl.offsetWidth || wordEl.offsetWidth || 0;

    let wordProgress = 0;
    const wt = activeLineObj.wordTimings?.[activeW];
    if (wt && typeof wt.start === "number") {
      const wEnd = wt.end || wt.typeEnd || (wt.start + 0.4);
      wordProgress = Math.max(0, Math.min(1, (timeSec - wt.start) / Math.max(0.12, wEnd - wt.start)));
    } else {
      const lineDur = Math.max(0.5, (activeLineObj.end ?? 1) - (activeLineObj.start ?? 0));
      const lineProg = Math.max(0, Math.min(1, (timeSec - (activeLineObj.start ?? 0)) / lineDur));
      const numWords = Math.max(1, activeLineObj.wordTimings?.length || 1);
      wordProgress = Math.max(0, Math.min(1, (lineProg * numWords) - activeW));
    }

    const edgeX = this.isRtlSong
      ? (wordLeft + (1 - wordProgress) * wordW)
      : (wordLeft + wordProgress * wordW);
    let focusX = edgeX;

    if (this.settings.wordTrackingMode === "anticipate") {
      const clusterElements = Array.prototype.slice.call(
        tokenWrap.querySelectorAll(".cider-word-cluster")
      );
      const clusters = clusterElements.length > 0
        ? clusterElements
        : Array.prototype.slice.call(tokenWrap.querySelectorAll(".cider-code-token"));
      const curIdx = clusters.indexOf(clusterEl);
      if (curIdx >= 0 && curIdx + 1 < clusters.length) {
        const nextEl = clusters[curIdx + 1];
        const nextTop = this.getOffsetTopInPlane(nextEl);
        if (Math.abs(nextTop - wordTop) <= 10) {
          const nextLeft = this.getOffsetLeftInPlane(nextEl);
          const nextW = nextEl.offsetWidth || 0;
          const nextWordCenterX = nextLeft + (nextW / 2);
          const t = Math.max(0, Math.min(1, (wordProgress - 0.35) / (0.95 - 0.35)));
          const lookahead = t * t * (3 - 2 * t);
          focusX = edgeX + (nextWordCenterX - edgeX) * lookahead;
        }
      }
    }

    const planeCenterX = planeWidth / 2;
    const deltaX = focusX - planeCenterX;
    const zoomScale = typeof this.settings.wordZoomScale === "number" ? this.settings.wordZoomScale : 1.25;
    const zoomDelta = Math.max(0.05, zoomScale - 1.0);
    const panGain = Math.min(0.85, 0.35 + zoomDelta * 1.2);
    const maxPan = Math.min(380, (window.innerWidth || 1200) * 0.28);
    const rawPan = -deltaX * panGain;
    let clampedPan = Math.max(-maxPan, Math.min(maxPan, rawPan));

    // Monotonic progression: within a single visual sub-line, camera pan glides in the
    // reading direction (decreasing X for LTR, increasing X for RTL), resetting when the
    // same bar wraps onto a new visual sub-line.
    const wrappedToNewSubLine = this._trackedVisualTop !== undefined && Math.abs(wordTop - this._trackedVisualTop) > 10;
    if (this._trackedLineIdx !== activeL || wrappedToNewSubLine || Math.abs(timeSec - (this._lastTrackTimeSec ?? timeSec)) > 2.0) {
      this._trackedLineIdx = activeL;
      this._trackedVisualTop = wordTop;
      this._lineMinPanX = Infinity;
      this._lineMaxPanX = -Infinity;
    }
    this._lastTrackTimeSec = timeSec;

    if (this.isRtlSong) {
      if (clampedPan < (this._lineMaxPanX ?? -Infinity)) {
        clampedPan = this._lineMaxPanX;
      } else {
        this._lineMaxPanX = clampedPan;
      }
    } else {
      if (clampedPan > (this._lineMinPanX ?? Infinity)) {
        clampedPan = this._lineMinPanX;
      } else {
        this._lineMinPanX = clampedPan;
      }
    }
    this.targetPanX = clampedPan;
    this.lastSpokenTimestamp = performance.now();
    this.sustainedPanX = this.targetPanX;
  }

  isRenderActive() {
    if (this._destroyed) return false;
    if (typeof document !== "undefined" && document.hidden) return false;
    return Boolean((this.enabled || this.isLockActive) && this.canvas && this.ctx && this.root && this.root.style.display !== "none");
  }

  pauseRenderLoop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  resumeRenderLoop() {
    if (this._destroyed || this.rafId || !this._renderCallback) return;
    if (!this.isRenderActive()) return;
    this._lastRenderTime = performance.now();
    this.rafId = requestAnimationFrame(this._renderCallback);
  }

  destroy() {
    this._destroyed = true;
    this.pauseRenderLoop();
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
    if (this.domObserver) {
      this.domObserver.disconnect();
      this.domObserver = null;
    }
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    if (this._idleCheckTimer) {
      clearInterval(this._idleCheckTimer);
      this._idleCheckTimer = null;
    }
    if (this._lockClockTimer) {
      clearInterval(this._lockClockTimer);
      this._lockClockTimer = null;
    }
    if (this._screensaverClockTimer) {
      clearInterval(this._screensaverClockTimer);
      this._screensaverClockTimer = null;
    }
    if (this._checkRafId) {
      cancelAnimationFrame(this._checkRafId);
      this._checkRafId = null;
    }
    if (Array.isArray(this._trackPollTimers)) {
      this._trackPollTimers.forEach((id) => clearTimeout(id));
      this._trackPollTimers = [];
    }
    if (this._mkScrapeTimer) {
      clearTimeout(this._mkScrapeTimer);
      this._mkScrapeTimer = null;
    }
    if (this._attachMkTimeout) {
      clearTimeout(this._attachMkTimeout);
      this._attachMkTimeout = null;
    }
    if (this._syncHudTimer) {
      clearTimeout(this._syncHudTimer);
      this._syncHudTimer = null;
    }
    if (this._settingsToastTimer) {
      clearTimeout(this._settingsToastTimer);
      this._settingsToastTimer = null;
    }
    this.clearCursorIdleState();
    if (this._mkInstance) {
      try {
        if (this._mkNowPlayingHandler) this._mkInstance.removeEventListener?.("nowPlayingItemDidChange", this._mkNowPlayingHandler);
        if (this._mkPlaybackTimeHandler) this._mkInstance.removeEventListener?.("playbackTimeDidChange", this._mkPlaybackTimeHandler);
      } catch {}
      this._mkInstance = null;
      this._mkNowPlayingHandler = null;
      this._mkPlaybackTimeHandler = null;
      this._mkBound = false;
    }
    if (this.resizeHandler) {
      window.removeEventListener("resize", this.resizeHandler);
      this.resizeHandler = null;
    }
    if (this._keydownHandler) {
      window.removeEventListener("keydown", this._keydownHandler);
      this._keydownHandler = null;
    }
    if (this._nowPlayingHandler) {
      window.removeEventListener("cider:NowPlayingItemDidChange", this._nowPlayingHandler);
      this._nowPlayingHandler = null;
    }
    if (this._idleActivityHandler) {
      ["mousemove", "mousedown", "pointerdown", "touchstart", "wheel", "keydown"].forEach((evt) => {
        window.removeEventListener(evt, this._idleActivityHandler);
      });
      this._idleActivityHandler = null;
    }
    if (this._visibilityChangeHandler && typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", this._visibilityChangeHandler);
      this._visibilityChangeHandler = null;
    }
    if (this.root?.parentElement && this.root.parentElement !== document.body) {
      this.root.parentElement.classList.remove("cider-ide-host-active");
    }
    if (typeof document !== "undefined") {
      document.body.classList.remove("cider-ide-host-active", "cider-ide-lyrics-active", "cider-ide-screensaver-active", "cider-ide-clean-feed");
      document.getElementById("cider-ide-bg-lyric-feeder")?.remove();
    }
    this.root?.remove();
    this.pill?.remove();
    this.settingsBackdrop?.remove();
    this.settingsPanel?.remove();
    this.lockOverlay?.remove();
    this.screensaverClock?.remove();
    if (typeof window !== "undefined" && window.__CIDER_IDE_LYRICS_ACTIVE__ === this) {
      delete window.__CIDER_IDE_LYRICS_ACTIVE__;
    }
  }

  startRenderLoop() {
    this._lastRenderTime = performance.now();
    let frameCount = 0;
    const render = (now) => {
      if (!this.isRenderActive()) {
        this.rafId = null;
        return;
      }
      const dt = Math.min(0.1, (now - this._lastRenderTime) / 1000);
      this._lastRenderTime = now;
      frameCount++;

      {
        const am = this.getAppleMusicStore();
        const mk = window.MusicKit?.getInstance?.();

        const np = this.getNowPlayingTrack();
        const trackId = this.getTrackUniqueKey(np);
        if (trackId && trackId !== this.currentTrackId) {
          this.handleTrackChange(trackId, np);
        }

        if (frameCount % 3 === 0) {
          this.syncActiveLineFromCiderDOM();
        }

        // High-precision 60fps audio clock interpolation for smooth character-by-character typing
        let rawAudioTime = null;
        const audioEl = am?.player?.audio;
        if (audioEl && typeof audioEl.currentTime === "number" && audioEl.currentTime > 0) {
          rawAudioTime = audioEl.currentTime;
        } else if (am && typeof am.currentTime === "number") {
          rawAudioTime = am.currentTime;
        } else if (mk && typeof mk.currentPlaybackTime === "number") {
          rawAudioTime = mk.currentPlaybackTime;
        }

        const playingNow = am ? !!am.isPlaying : mk ? !!mk.isPlaying : true;
        this.isPlaying = playingNow;

        if (typeof rawAudioTime === "number") {
          const rawChanged = rawAudioTime !== this._lastRawAudioTime;
          this._lastRawAudioTime = rawAudioTime;

          if (!playingNow) {
            this.currentTime = rawAudioTime;
          } else {
            this.currentTime += dt;
            const drift = rawAudioTime - this.currentTime;
            if (Math.abs(drift) > 0.35) {
              this.currentTime = rawAudioTime;
            } else if (rawChanged) {
              this.currentTime += drift * 0.45;
            }
          }
        } else if (!am && !mk) {
          this.currentTime += dt * 0.85;
        }

        const hasRealTimes = this.compiledLines[0]?.hasRealTimestamp;
        if (!hasRealTimes && typeof this.domSyncedTime === "number") {
          if (this.isPlaying && typeof this.lastDomActiveIdx === "number") {
            const activeCL = this.compiledLines[this.lastDomActiveIdx];
            if (activeCL) {
              this.domSyncedTime = Math.min(activeCL.end - 0.02, this.domSyncedTime + dt * 0.85);
            }
          }
          this.syncWordCursor(this.getSyncAdjustedTime(this.domSyncedTime));
        } else {
          this.syncWordCursor(this.getSyncAdjustedTime(this.currentTime));
        }

        if (frameCount % 6 === 0) {
          this.updatePlayerDockUI();
        }

        const scrollAlpha = 1 - Math.exp(-10.5 * dt);
        this.currentScrollRem += (this.targetScrollRem - this.currentScrollRem) * scrollAlpha;

        // Paced rhythmic beat pulse during active playback
        if (this.settings.beatBounce && this.isPlaying && this.isCurrentlySpeaking) {
          const beatPeriod = 0.5; // ~120bpm sync pulses
          const beatPhase = (this.currentTime % beatPeriod) / beatPeriod;
          if (beatPhase < 0.08 && (!this._lastBeatFired || Math.abs(this.currentTime - this._lastBeatFired) > 0.25)) {
            this._lastBeatFired = this.currentTime;
            this.audioState.bassPulse = Math.max(this.audioState.bassPulse, 0.42);
          }
        }

        if (this.codePlane) {
          const isCompact = this._isCompact ?? this.root.classList.contains("is-compact");

          if (isCompact) {
            // Small screen / Compact drawer mode: absolutely zero fancy 3D / zooms / bounces / pans!
            // Clean, flat 2D layout that glides vertically without distractions.
            this.currentCameraZoom = 1.0;
            this.currentPanX = 0;
            this.targetPanX = 0;
            this.codePlane.style.transform = `translateY(${this.currentScrollRem.toFixed(1)}px)`;
          } else {
            const rotX = this.settings.rotX ?? 14;
            const rotY = this.settings.rotY ?? -12;
            const rotZ = this.settings.rotZ ?? -4;

            // Camera dynamic zoom physics: zoom in on active word, zoom out on pauses/silence
            let targetZoom = 1.0;
            if (this.settings.dynamicWordZoom) {
              targetZoom = this.isCurrentlySpeaking
                ? (typeof this.settings.wordZoomScale === "number" ? this.settings.wordZoomScale : 1.25)
                : 1.0;
            }
            const zoomRate = this.isCurrentlySpeaking ? 5.3 : 2.8;
            const zoomAlpha = 1 - Math.exp(-zoomRate * dt);
            this.currentCameraZoom = (this.currentCameraZoom ?? 1.0) + (targetZoom - (this.currentCameraZoom ?? 1.0)) * zoomAlpha;
            this.root.classList.toggle("is-vocal-zoomed", this.currentCameraZoom > 1.05);

            // Word-tracking camera physics: smoothly glide horizontally with active spoken word
            // When 'stable' mode is active or wordTracking is OFF: Camera stays 100% ROCK-SOLID centered horizontally!
            const now = performance.now();
            let targetX = 0;
            if (this.settings.dynamicWordZoom && this.settings.wordTracking !== false && this.settings.wordTrackingMode !== "stable") {
              if (this.isCurrentlySpeaking) {
                targetX = this.targetPanX ?? 0;
              } else if (now - (this.lastSpokenTimestamp || 0) < 1000) {
                targetX = this.sustainedPanX ?? 0;
              } else {
                targetX = 0;
              }
            } else {
              targetX = 0;
              this.sustainedPanX = 0;
              this.currentPanX = 0;
            }
            const panRate = (!this.isCurrentlySpeaking && targetX === 0) ? 1.5 : 4.5;
            const panAlpha = 1 - Math.exp(-panRate * dt);
            this.currentPanX = (this.currentPanX ?? 0) + (targetX - (this.currentPanX ?? 0)) * panAlpha;
            if (this.settings.wordTrackingMode === "stable" || this.settings.wordTracking === false) {
              this.currentPanX = 0;
            }
            const maxPan = Math.min(380, (window.innerWidth || 1200) * 0.28);
            this.currentPanX = Math.max(-maxPan, Math.min(maxPan, this.currentPanX));

            // Rhythmic beat bounce
            const bounceMult = typeof this.settings.bounceIntensity === "number" ? this.settings.bounceIntensity : 1.2;
            const bounceZ = this.settings.beatBounce ? (this.audioState.bassPulse * 16 * bounceMult) : 0;
            const bounceScale = this.settings.beatBounce ? (this.audioState.bassPulse * 0.024 * bounceMult) : 0;
            const totalScale = (this.currentCameraZoom + bounceScale);

            // In RTL mode, perspective yaw mirrors natural reading path
            const effectiveRotY = this.isRtlSong ? -rotY : rotY;

            this.codePlane.style.transform = `
              translate3d(${this.currentPanX.toFixed(1)}px, ${this.currentScrollRem.toFixed(1)}px, 0px)
              rotateX(${rotX.toFixed(1)}deg)
              rotateY(${effectiveRotY.toFixed(1)}deg)
              rotateZ(${rotZ.toFixed(1)}deg)
              translateZ(${bounceZ.toFixed(1)}px)
              scale(${totalScale.toFixed(3)})
            `;
          }
        }

        const isCompactCanvas = this._isCompact ?? this.root?.classList.contains("is-compact");
        if (isCompactCanvas) {
          this.audioState.bassPulse *= 0.92;
        } else {
          this.drawVisualizerCanvas(now, dt);
        }
      }

      if (this.isRenderActive()) {
        this.rafId = requestAnimationFrame(render);
      } else {
        this.rafId = null;
      }
    };
    this._renderCallback = render;
    if (!this._visibilityChangeHandler && typeof document !== "undefined") {
      this._visibilityChangeHandler = () => {
        if (document.hidden) this.pauseRenderLoop();
        else this.resumeRenderLoop();
      };
      document.addEventListener("visibilitychange", this._visibilityChangeHandler);
    }
    this.resumeRenderLoop();
  }

  drawVisualizerCanvas(timestamp, dt = 0.016) {
    const w = this._cachedW || window.innerWidth;
    const h = this._cachedH || window.innerHeight;
    const ctx = this.ctx;
    const phase = timestamp * 0.0012;

    this.audioState.bassPulse *= 0.92;
    const bass = this.audioState.bassPulse;
    this.updateCinematicVignette(bass);

    if (isSolidBackdrop(this.settings.backdropMode) || this.settings.backdropMode === "simple" || this.settings.backdropMode === "custom") {
      if (ctx) ctx.clearRect(0, 0, w, h);
      return;
    }

    ctx.fillStyle = this.palette.bgCore || "#06030a";
    ctx.fillRect(0, 0, w, h);

    if (!this._cachedBgGlow) {
      this.updateCachedBgGlow();
    }
    if (this._cachedBgGlow) {
      ctx.fillStyle = this._cachedBgGlow;
      ctx.fillRect(0, 0, w, h);
    }

    const spacing = this.settings.linuxLowSpecMode ? 11.0 : 8.5;
    const numLines = Math.ceil(h / spacing) + 8;
    const xStep = this.settings.linuxLowSpecMode ? 20 : 14;
    const waveColors = this.palette.waves;
    const widths = [1.3, 1.6, 1.2, 1.5, 1.3];
    const amp = (this.settings.waveAmplitude ?? 1.25) * (1 + bass * 0.65);

    for (let i = -4; i < numLines; i++) {
      const baseY = i * spacing;
      const pIdx = ((i % waveColors.length) + waveColors.length) % waveColors.length;

      ctx.beginPath();
      ctx.strokeStyle = waveColors[pIdx];
      ctx.lineWidth = widths[pIdx] + bass * 0.45;

      for (let x = 0; x <= w + xStep; x += xStep) {
        const n1 = Math.sin(x * 0.014 + i * 0.21 + phase * 1.35) * 3.1;
        const n2 = Math.cos(x * 0.036 - i * 0.32 + phase * 0.88) * 1.9;
        const n3 = Math.sin(x * 0.075 + i * 0.55 - phase * 0.6) * 1.1;
        const y = baseY + (n1 + n2 + n3) * amp;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    if (this.isCinematicActive()) {
      this.drawAmbientMotes(ctx, w, h, dt, bass);
    }

    if (this.settings.grainAmount > 0 && !this.settings.linuxLowSpecMode && this.cachedGrainPattern) {
      ctx.save();
      const ox = (Math.random() * 180) | 0;
      const oy = (Math.random() * 180) | 0;
      ctx.translate(ox, oy);
      ctx.globalAlpha = this.settings.grainAmount / 250;
      ctx.globalCompositeOperation = "overlay";
      ctx.fillStyle = this.cachedGrainPattern;
      ctx.fillRect(-ox, -oy, w + 180, h + 180);
      ctx.restore();
    }
  }
}

// Export format matching @ciderapp/pluginkit `definePluginContext` AND auto-boot fallback
let _pluginSetupInvoked = false;
let _autoBootTimerId = null;
const pluginContext = {
  name: "Cider IDE Lyrics",
  identifier: "sh.cider.ide-lyric-visualizer",
  description: "Synchronized lyrics visualizer styled as code syntax with 3D perspective, background waves, and screensaver mode.",
  version: "2.3.0",
  pluginKitVersion: "1.0.0",
  author: "ciderapp",
  repo: "https://github.com/ciderapp/cider-ide-lyrics-visualizer",
  setup() {
    _pluginSetupInvoked = true;
    if (_autoBootTimerId !== null) {
      clearTimeout(_autoBootTimerId);
      _autoBootTimerId = null;
    }
    const engine = new CiderIDELyricsEngine();
    engine.onReady();
    return engine;
  }
};

// If executed directly or via legacy loader that doesn't call setup(), auto-boot safely after DOM ready
_autoBootTimerId = setTimeout(() => {
  _autoBootTimerId = null;
  if (!_pluginSetupInvoked && !window.__CIDER_IDE_LYRICS_ACTIVE__ && typeof document !== "undefined") {
    pluginContext.setup();
  }
}, 500);

export default pluginContext;
