export interface Point {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

export function getAngle(A: Point, B: Point, C: Point): number {
  const radians = Math.atan2(C.y - B.y, C.x - B.x) - Math.atan2(A.y - B.y, A.x - B.x);
  let angle = Math.abs((radians * 180) / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return angle;
}

export function isVisible(point: Point, threshold = 0.5): boolean {
  return (point.visibility ?? 1) >= threshold;
}
