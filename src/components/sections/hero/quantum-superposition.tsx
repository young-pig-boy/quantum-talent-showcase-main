/**
 * QuantumSuperposition — the abstract Hero centerpiece.
 *
 * 3~4 translucent, irregular volumes (blue / vermilion / amber in light,
 * blue / cyan / violet / magenta in dark) overlap via blend modes to form
 * an interference field — a color-abstracted "superposition" rather than
 * any literal physics photo. Pure CSS: radial gradients + blur + blend +
 * grain. Breathing motion and pointer response live in globals.css and are
 * driven by --qv-mx / --qv-my custom properties set by the Hero section.
 *
 * No 3D engine, no images — cheap to render, themeable via CSS variables.
 */
export function QuantumSuperposition() {
  return (
    <div className="qv-stage" aria-hidden="true">
      {/* Volume 1 — deep blue body */}
      <div className="qv-layer qv-depth-1">
        <div className="qv-breathe qv-breathe-1">
          <div className="qv-blob qv-blob-1" />
        </div>
      </div>

      {/* Volume 2 — vermilion body overlapping volume 1 */}
      <div className="qv-layer qv-depth-2">
        <div className="qv-breathe qv-breathe-2">
          <div className="qv-blob qv-blob-2" />
        </div>
      </div>

      {/* Volume 3 — amber probability accent */}
      <div className="qv-layer qv-depth-3">
        <div className="qv-breathe qv-breathe-3">
          <div className="qv-blob qv-blob-3" />
        </div>
      </div>

      {/* Volume 4 — small offset accent */}
      <div className="qv-layer qv-depth-4">
        <div className="qv-breathe qv-breathe-4">
          <div className="qv-blob qv-blob-4" />
        </div>
      </div>

      {/* Orbital traces — static ellipses, opacity breathing only */}
      <svg
        className="qv-rings"
        viewBox="0 0 1000 900"
        preserveAspectRatio="xMidYMid meet"
      >
        <ellipse
          className="qv-ring qv-ring-a"
          cx="470"
          cy="430"
          rx="350"
          ry="215"
          transform="rotate(-14 470 430)"
        />
        <ellipse
          className="qv-ring qv-ring-b"
          cx="480"
          cy="440"
          rx="270"
          ry="330"
          transform="rotate(22 480 440)"
        />
      </svg>

      {/* Fine grain texture */}
      <div className="qv-noise" />
    </div>
  );
}
