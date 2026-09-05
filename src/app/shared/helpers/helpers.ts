import { CanvasElement } from "pdfmake/interfaces";

export const generateDotsCanvas = (value: number, color = "black", bgColor = "white"): CanvasElement[] => {
  const clamped = Math.max(0.5, Math.min(5, Math.round(value * 2) / 2));
  const radius = 3;
  const gap = 1.5;
  const diameter = radius * 2;
  const shapes: CanvasElement[] = [];
  for (let i = 0; i < 5; i++) {
    const fillLevel = clamped - i;
    const cx = radius + i * (diameter + gap);
    const cy = radius;
    shapes.push({
      type: "ellipse",
      x: cx,
      y: cy,
      r1: radius,
      r2: radius,
      color: fillLevel >= 1 ? color : bgColor,
    });
    if (fillLevel >= 0.5 && fillLevel < 1) {
      const points: { x: number; y: number }[] = [];
      for (let a = 90; a <= 270; a += 9) {
        const rad = (a * Math.PI) / 180;
        points.push({ x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) });
      }
      shapes.push({ type: "polyline", closePath: true, color, points });
    }
  }
  return shapes;
};
// export const handleError = (error, override?) => {
//   console.error(error);
//   if (error.code) console.error(error.code);
//   if (error.message) console.error(error.message);
//   return override ?? false;
// };
