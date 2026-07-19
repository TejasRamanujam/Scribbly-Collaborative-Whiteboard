import type { Point, Stroke } from './types'

function smoothPoints(points: Point[]): Point[] {
  if (points.length < 3) return points
  const smoothed: Point[] = [points[0]]
  for (let i = 1; i < points.length - 1; i++) {
    smoothed.push({
      x: (points[i - 1].x + points[i].x + points[i + 1].x) / 3,
      y: (points[i - 1].y + points[i].y + points[i + 1].y) / 3,
      pressure: points[i].pressure,
    })
  }
  smoothed.push(points[points.length - 1])
  return smoothed
}

export function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke) {
  const pts = smoothPoints(stroke.points || [])
  if (stroke.tool === 'text' && stroke.text) {
    const point = pts[0] ?? { x: stroke.x ?? 0, y: stroke.y ?? 0 }
    ctx.save()
    ctx.fillStyle = stroke.color
    ctx.font = `${stroke.font_size ?? 18}px Georgia, serif`
    ctx.textBaseline = 'top'
    for (const [lineIndex, line] of stroke.text.split('\n').entries()) {
      ctx.fillText(line, point.x, point.y + lineIndex * (stroke.font_size ?? 18) * 1.2)
    }
    ctx.restore()
    return
  }
  if (pts.length === 0) return

  ctx.save()
  ctx.strokeStyle = stroke.tool === 'eraser' ? '#0f1117' : stroke.color
  ctx.lineWidth = stroke.width
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  if (stroke.tool === 'highlighter') {
    ctx.globalAlpha = 0.3
    ctx.lineWidth = stroke.width * 3
  } else if (stroke.tool === 'rectangle' && pts.length >= 2) {
    const start = pts[0]
    const end = pts[pts.length - 1]
    ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y)
    ctx.restore()
    return
  } else if (stroke.tool === 'circle' && pts.length >= 2) {
    const start = pts[0]
    const end = pts[pts.length - 1]
    ctx.beginPath()
    ctx.ellipse(
      (start.x + end.x) / 2,
      (start.y + end.y) / 2,
      Math.abs(end.x - start.x) / 2,
      Math.abs(end.y - start.y) / 2,
      0,
      0,
      Math.PI * 2
    )
    ctx.stroke()
    ctx.restore()
    return
  }

  ctx.beginPath()
  if (pts.length === 1) {
    ctx.arc(pts[0].x, pts[0].y, stroke.width / 4, 0, Math.PI * 2)
    ctx.fillStyle = stroke.tool === 'eraser' ? '#0f1117' : stroke.color
    ctx.fill()
  } else {
    ctx.moveTo(pts[0].x, pts[0].y)
    for (let i = 1; i < pts.length; i++) {
      const midX = (pts[i - 1].x + pts[i].x) / 2
      const midY = (pts[i - 1].y + pts[i].y) / 2
      if (i === 1) ctx.lineTo(midX, midY)
      ctx.quadraticCurveTo(pts[i - 1].x, pts[i - 1].y, midX, midY)
    }
    ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y)
    ctx.stroke()
  }
  ctx.restore()
}

export function drawingBounds(strokes: Stroke[]) {
  const points = strokes.flatMap((stroke) => {
    const strokePoints = [...(stroke.points || [])]
    if (stroke.tool === 'text' && stroke.text && strokePoints[0]) {
      const size = stroke.font_size ?? 18
      const lines = stroke.text.split('\n')
      strokePoints.push({
        x: strokePoints[0].x + Math.max(...lines.map((line) => line.length)) * size * 0.62,
        y: strokePoints[0].y + lines.length * size * 1.2,
        pressure: 0.5,
      })
    }
    return strokePoints
  })
  if (!points.length) return { minX: 0, minY: 0, maxX: 800, maxY: 600 }
  return {
    minX: Math.min(...points.map((point) => point.x)),
    minY: Math.min(...points.map((point) => point.y)),
    maxX: Math.max(...points.map((point) => point.x)),
    maxY: Math.max(...points.map((point) => point.y)),
  }
}
