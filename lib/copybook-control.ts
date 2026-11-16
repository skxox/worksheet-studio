export const CONTROL_PATTERN_CODES = [
  ..."123456789",
  ..."ABCDEFGHIJKLMNOPQRSTUVW",
] as const;

export type ControlPatternCode = (typeof CONTROL_PATTERN_CODES)[number];

const CONTROL_PATTERN_SET = new Set<string>(CONTROL_PATTERN_CODES);

export function parseControlPatternCodes(
  content: string,
): ControlPatternCode[] {
  return Array.from(content.toUpperCase()).filter(
    (value): value is ControlPatternCode => CONTROL_PATTERN_SET.has(value),
  );
}

function strokePolyline(
  ctx: CanvasRenderingContext2D,
  points: Array<[number, number]>,
  close = false,
) {
  if (points.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let index = 1; index < points.length; index++) {
    ctx.lineTo(points[index][0], points[index][1]);
  }
  if (close) ctx.closePath();
  ctx.stroke();
}

function drawSpiral(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  turns: number,
  direction: number,
) {
  ctx.beginPath();
  for (let step = 0; step <= 100; step++) {
    const progress = step / 100;
    const angle = direction * progress * Math.PI * 2 * turns;
    const radius = 0.035 + progress * 0.39;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    if (step === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function drawWave(
  ctx: CanvasRenderingContext2D,
  axis: "horizontal" | "vertical",
  waves: number,
  amplitude: number,
  phase = 0,
) {
  ctx.beginPath();
  for (let step = 0; step <= 48; step++) {
    const position = step / 48;
    const cross =
      0.5 + Math.sin(position * Math.PI * 2 * waves + phase) * amplitude;
    const x = axis === "horizontal" ? position : cross;
    const y = axis === "horizontal" ? cross : position;
    if (step === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function drawPatternGeometry(ctx: CanvasRenderingContext2D, index: number) {
  const inset = 0.12;
  const left = inset;
  const top = inset;
  const right = 1 - inset;
  const bottom = 1 - inset;
  const middle = 0.5;

  switch (index) {
    case 0:
      for (let line = 0; line < 5; line++) {
        const y = 0.18 + line * 0.16;
        strokePolyline(ctx, [
          [left, y],
          [right, y],
        ]);
      }
      break;
    case 1:
      for (let line = 0; line < 5; line++) {
        const x = 0.18 + line * 0.16;
        strokePolyline(ctx, [
          [x, top],
          [x, bottom],
        ]);
      }
      break;
    case 2:
    case 3: {
      const points: Array<[number, number]> = [[left, middle]];
      const segments = index === 2 ? 6 : 4;
      for (let line = 1; line <= segments; line++) {
        points.push([
          left + ((right - left) * line) / segments,
          line % 2 === (index === 2 ? 0 : 1) ? top : bottom,
        ]);
      }
      strokePolyline(ctx, points);
      break;
    }
    case 4:
      drawSpiral(ctx, middle, middle, 2.2, 1);
      break;
    case 5:
      drawSpiral(ctx, middle, middle, 2.8, -1);
      break;
    case 6:
      for (let line = 0; line < 4; line++) {
        const x = 0.2 + line * 0.2;
        strokePolyline(ctx, [
          [x, top],
          [right, bottom - line * 0.2],
        ]);
      }
      break;
    case 7:
      strokePolyline(
        ctx,
        [
          [left, middle],
          [middle, top],
          [right, middle],
          [middle, bottom],
        ],
        true,
      );
      break;
    case 8:
      for (let line = 0; line < 4; line++) {
        const offset = 0.18 + line * 0.2;
        strokePolyline(ctx, [
          [left, offset],
          [right, offset],
        ]);
        strokePolyline(ctx, [
          [offset, top],
          [offset, bottom],
        ]);
      }
      break;
    case 9:
      strokePolyline(ctx, [
        [left, top],
        [right, top],
        [right, bottom],
        [left, bottom],
        [left, top],
      ]);
      strokePolyline(ctx, [
        [0.3, 0.3],
        [0.7, 0.3],
        [0.7, 0.7],
        [0.3, 0.7],
        [0.3, 0.3],
      ]);
      break;
    case 10:
      for (let loop = 0; loop < 3; loop++) {
        const offset = 0.16 + loop * 0.22;
        ctx.beginPath();
        ctx.arc(middle, middle, offset, 0, Math.PI * 2);
        ctx.stroke();
      }
      break;
    case 11:
      strokePolyline(ctx, [
        [left, bottom],
        [left, top],
        [0.38, top],
        [0.38, 0.38],
        [0.62, 0.38],
        [0.62, 0.62],
        [right, 0.62],
        [right, bottom],
      ]);
      break;
    case 12:
      drawWave(ctx, "horizontal", 2, 0.28);
      break;
    case 13:
      drawWave(ctx, "horizontal", 4, 0.28);
      break;
    case 14:
      drawWave(ctx, "vertical", 2, 0.28);
      break;
    case 15:
      drawWave(ctx, "vertical", 4, 0.28);
      break;
    case 16:
    case 17:
      for (let loop = 0; loop < 3; loop++) {
        const x = left + (loop * (right - left)) / 2;
        const direction = (loop + index) % 2 === 0 ? 1 : -1;
        ctx.beginPath();
        ctx.ellipse(x, middle, 0.12, 0.34, direction * 0.3, 0, Math.PI * 2);
        ctx.stroke();
      }
      break;
    case 18:
    case 19:
      for (let arch = 0; arch < 3; arch++) {
        const x = left + arch * 0.25;
        ctx.beginPath();
        ctx.arc(x + 0.12, bottom, 0.12, Math.PI, 0);
        ctx.stroke();
      }
      break;
    case 20:
      strokePolyline(ctx, [
        [left, top],
        [right, top],
        [right, 0.34],
        [0.34, 0.34],
        [0.34, 0.66],
        [right, 0.66],
        [right, bottom],
        [left, bottom],
      ]);
      break;
    case 21:
      for (let line = 0; line < 4; line++) {
        const offset = 0.18 + line * 0.2;
        strokePolyline(ctx, [
          [left, offset],
          [right, 1 - offset],
        ]);
      }
      break;
    case 22:
      for (let line = 0; line < 4; line++) {
        const offset = 0.18 + line * 0.2;
        strokePolyline(ctx, [
          [left, 1 - offset],
          [right, offset],
        ]);
      }
      break;
    case 23:
      strokePolyline(ctx, [
        [left, middle],
        [0.3, top],
        [0.5, middle],
        [0.7, top],
        [right, middle],
        [0.7, bottom],
        [0.5, middle],
        [0.3, bottom],
        [left, middle],
      ]);
      break;
    case 24:
      for (let loop = 0; loop < 3; loop++) {
        const x = left + loop * 0.25;
        ctx.beginPath();
        ctx.moveTo(x, top);
        ctx.bezierCurveTo(x + 0.3, top, x + 0.3, bottom, x, bottom);
        ctx.bezierCurveTo(x - 0.1, bottom, x - 0.1, top, x, top);
        ctx.stroke();
      }
      break;
    case 25:
      drawWave(ctx, "horizontal", 3, 0.22, Math.PI / 2);
      drawWave(ctx, "horizontal", 3, 0.22, -Math.PI / 2);
      break;
    case 26:
      strokePolyline(ctx, [
        [left, bottom],
        [0.32, top],
        [0.5, bottom],
        [0.68, top],
        [right, bottom],
      ]);
      break;
    case 27:
      strokePolyline(ctx, [
        [left, top],
        [0.32, bottom],
        [0.5, top],
        [0.68, bottom],
        [right, top],
      ]);
      break;
    case 28:
      strokePolyline(ctx, [
        [left, top],
        [right, bottom],
      ]);
      strokePolyline(ctx, [
        [left, bottom],
        [right, top],
      ]);
      strokePolyline(ctx, [
        [middle, top],
        [middle, bottom],
      ]);
      strokePolyline(ctx, [
        [left, middle],
        [right, middle],
      ]);
      break;
    case 29:
      for (let row = 0; row < 3; row++) {
        const y = 0.25 + row * 0.25;
        strokePolyline(ctx, [
          [left, y],
          [0.35, y],
          [0.35, y + 0.12],
          [0.65, y + 0.12],
          [0.65, y],
          [right, y],
        ]);
      }
      break;
    case 30:
      for (let loop = 0; loop < 3; loop++) {
        const y = 0.25 + loop * 0.25;
        ctx.beginPath();
        ctx.moveTo(left, y);
        ctx.bezierCurveTo(0.3, y - 0.18, 0.7, y + 0.18, right, y);
        ctx.stroke();
      }
      break;
    case 31:
      for (let line = 0; line < 3; line++) {
        const offset = 0.22 + line * 0.28;
        ctx.beginPath();
        ctx.ellipse(
          middle,
          middle,
          offset,
          0.38,
          (line * Math.PI) / 3,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
      }
      break;
    case 32:
      strokePolyline(
        ctx,
        [
          [middle, top],
          [0.58, 0.4],
          [right, 0.42],
          [0.66, 0.58],
          [0.72, bottom],
          [middle, 0.72],
          [0.28, bottom],
          [0.34, 0.58],
          [left, 0.42],
          [0.42, 0.4],
          [middle, top],
        ],
        true,
      );
      break;
    default:
      break;
  }
}

export function drawControlPattern(
  ctx: CanvasRenderingContext2D,
  code: ControlPatternCode,
  x: number,
  y: number,
  size: number,
  color: string,
  lineWidth: number,
) {
  const index = CONTROL_PATTERN_CODES.indexOf(code);
  if (index < 0) return;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, size, size);
  ctx.clip();
  ctx.translate(x, y);
  ctx.scale(size, size);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth / size;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  drawPatternGeometry(ctx, index);
  ctx.restore();
}
