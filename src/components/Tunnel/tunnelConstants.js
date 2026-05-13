/** Depth markers in world −Z aligned with synced HTML zones (approximate). */
export const ZONE_ANCHORS_Z = [0, -20, -40, -60, -80];

/** Deterministic pseudo-random in [0,1). */
export function tunnelHash01(n) {
  const x = Math.sin(n + 991) * 43758.5453;
  return x - Math.floor(x);
}
