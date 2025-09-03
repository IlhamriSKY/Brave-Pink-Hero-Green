/**
 * Image conversion utilities (Duotone-only)
 *
 * Two presets with exact colors:
 * - Pink→Green (default): #f784c5 → #1b602f
 * - Green→Pink: #1b602f → #f784c5
 */

export const CONVERSION_MODES = {
  DUOTONE_PG: 'duotone-pg',
  DUOTONE_GP: 'duotone-gp',
} as const

export type ConversionMode = typeof CONVERSION_MODES[keyof typeof CONVERSION_MODES]

type RGB = [number, number, number]

// Exact reference colors
export const DUOTONE_COLORS: { PINK: RGB; GREEN: RGB } = {
  PINK: [247, 132, 197], // #f784c5
  GREEN: [27, 96, 47],   // #1b602f
}

// sRGB ⇄ Linear helpers
// Precomputed LUT for faster sRGB -> Linear conversion
const SRGB_TO_LINEAR = new Float32Array(256)
for (let i = 0; i < 256; i++) {
  const c = i / 255
  SRGB_TO_LINEAR[i] = c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}
function srgbToLinear(c8: number): number {
  return SRGB_TO_LINEAR[c8 & 255]
}

function linearToSrgb(c: number): number {
  const v = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055
  return Math.max(0, Math.min(255, Math.round(v * 255)))
}

function clamp(x: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, x))
}

// Linear luminance (Rec.709 coefficients)
function luminanceLinear(r: number, g: number, b: number): number {
  const R = srgbToLinear(r)
  const G = srgbToLinear(g)
  const B = srgbToLinear(b)
  return 0.2126 * R + 0.7152 * G + 0.0722 * B
}

type DuotoneOptions = {
  contrast?: number // around 1.0–1.3
  bias?: number // shift midtones
  desat?: number // 0..1 mix toward grayscale (color-blind aid)
}

function applyDuotoneData(imageData: ImageData, dark: RGB, light: RGB, opts: DuotoneOptions = {}): ImageData {
  const data = imageData.data
  const dLin: [number, number, number] = [
    srgbToLinear(dark[0]),
    srgbToLinear(dark[1]),
    srgbToLinear(dark[2]),
  ]
  const lLin: [number, number, number] = [
    srgbToLinear(light[0]),
    srgbToLinear(light[1]),
    srgbToLinear(light[2]),
  ]

  const contrast = opts.contrast ?? 1.15
  const bias = opts.bias ?? 0
  const desat = Math.max(0, Math.min(1, opts.desat ?? 0))

  for (let i = 0; i < data.length; i += 4) {
    let L = luminanceLinear(data[i], data[i + 1], data[i + 2])
    L = clamp((L - 0.5) * contrast + 0.5 + bias, 0, 1)

    let rLin = dLin[0] * (1 - L) + lLin[0] * L
    let gLin = dLin[1] * (1 - L) + lLin[1] * L
    let bLin = dLin[2] * (1 - L) + lLin[2] * L

    if (desat > 0) {
      // Mix toward grayscale using resulting luminance to improve accessibility
      const Y = 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin
      rLin = rLin * (1 - desat) + Y * desat
      gLin = gLin * (1 - desat) + Y * desat
      bLin = bLin * (1 - desat) + Y * desat
    }

    data[i] = linearToSrgb(rLin)
    data[i + 1] = linearToSrgb(gLin)
    data[i + 2] = linearToSrgb(bLin)
  }
  return imageData
}

export type ConversionOptions = {
  circleCrop?: boolean
  circle?: { cx: number; cy: number; r: number; unit?: 'relative' | 'pixel' }
  colorBlind?: boolean
}

export async function applyConversion(image: HTMLImageElement, mode: ConversionMode, options?: ConversionOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d', { willReadFrequently: true } as any)
      if (!ctx) return reject(new Error('Canvas context not available'))

      canvas.width = image.naturalWidth || image.width
      canvas.height = image.naturalHeight || image.height
      ctx.drawImage(image, 0, 0)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

      const PINK: RGB = DUOTONE_COLORS.PINK
      const GREEN: RGB = DUOTONE_COLORS.GREEN

      let processed = imageData
      switch (mode) {
        case CONVERSION_MODES.DUOTONE_PG:
          // shadows → first, highlights → second
          processed = applyDuotoneData(
            imageData,
            PINK,
            GREEN,
            options?.colorBlind ? { contrast: 1.25, desat: 0.35 } : { contrast: 1.15 }
          )
          break
        case CONVERSION_MODES.DUOTONE_GP:
          processed = applyDuotoneData(
            imageData,
            GREEN,
            PINK,
            options?.colorBlind ? { contrast: 1.25, desat: 0.35 } : { contrast: 1.15 }
          )
          break
        default:
          processed = imageData
      }

      ctx.putImageData(processed, 0, 0)

      if (options?.circleCrop || options?.circle) {
        const minDim = Math.min(canvas.width, canvas.height)
        let cx = canvas.width / 2
        let cy = canvas.height / 2
        let r = minDim / 2
        if (options.circle) {
          const unit = options.circle.unit || 'relative'
          if (unit === 'relative') {
            cx = options.circle.cx * canvas.width
            cy = options.circle.cy * canvas.height
            r = Math.max(1, Math.min(minDim / 2, options.circle.r * minDim))
          } else {
            cx = options.circle.cx
            cy = options.circle.cy
            r = Math.max(1, Math.min(minDim / 2, options.circle.r))
          }
        }
        // Ensure the square selection fits within canvas
        const size = Math.round(Math.min(2 * r, minDim))
        let sx = Math.round(cx - size / 2)
        let sy = Math.round(cy - size / 2)
        sx = Math.max(0, Math.min(canvas.width - size, sx))
        sy = Math.max(0, Math.min(canvas.height - size, sy))
        const out = document.createElement('canvas')
        out.width = size
        out.height = size
        const octx = out.getContext('2d')!
        octx.clearRect(0, 0, size, size)
        octx.save()
        octx.beginPath()
        octx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
        octx.closePath()
        octx.clip()
        octx.drawImage(canvas, sx, sy, size, size, 0, 0, size, size)
        octx.restore()
        resolve(out.toDataURL('image/png'))
        return
      }

      // Always return PNG as requested
      resolve(canvas.toDataURL('image/png'))
    } catch (err) {
      reject(err)
    }
  })
}

export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    // Use object URL for faster load and lower memory overhead
    let url = ''
    try {
      url = URL.createObjectURL(file)
      img.src = url
    } catch (e) {
      // Fallback to FileReader if object URL fails
      const reader = new FileReader()
      reader.onload = (e) => {
        img.src = String(e.target?.result)
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    }

    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load image'))
  })
}

export function cropCircle(
  image: HTMLImageElement,
  circle: { cx: number; cy: number; r: number; unit?: 'relative' | 'pixel' }
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Canvas context not available'))

      const W = image.naturalWidth || image.width
      const H = image.naturalHeight || image.height

      let cx = circle.cx
      let cy = circle.cy
      let r = circle.r
      const minDim = Math.min(W, H)
      const unit = circle.unit || 'relative'
      if (unit === 'relative') {
        cx = cx * W
        cy = cy * H
        r = Math.max(1, Math.min(minDim / 2, r * minDim))
      } else {
        r = Math.max(1, Math.min(minDim / 2, r))
      }

      const size = Math.round(Math.min(2 * r, minDim))
      let sx = Math.round(cx - size / 2)
      let sy = Math.round(cy - size / 2)
      sx = Math.max(0, Math.min(W - size, sx))
      sy = Math.max(0, Math.min(H - size, sy))

      canvas.width = size
      canvas.height = size
      const octx = ctx
      octx.clearRect(0, 0, size, size)
      octx.save()
      octx.beginPath()
      octx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
      octx.closePath()
      octx.clip()
      octx.drawImage(image, sx, sy, size, size, 0, 0, size, size)
      octx.restore()
      resolve(canvas.toDataURL('image/png'))
    } catch (e) {
      reject(e)
    }
  })
}

export function cropCircleFromRect(
  image: HTMLImageElement,
  rect: { x: number; y: number; width: number; height: number }
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const W = image.naturalWidth || image.width
      const H = image.naturalHeight || image.height
      const size = Math.round(Math.max(1, Math.min(rect.width, rect.height)))
      const sx = Math.max(0, Math.min(W - size, Math.round(rect.x)))
      const sy = Math.max(0, Math.min(H - size, Math.round(rect.y)))

      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')!
      ctx.clearRect(0, 0, size, size)
      ctx.save()
      ctx.beginPath()
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
      ctx.closePath()
      ctx.clip()
      ctx.drawImage(image, sx, sy, size, size, 0, 0, size, size)
      ctx.restore()
      resolve(canvas.toDataURL('image/png'))
    } catch (e) {
      reject(e)
    }
  })
}

export default {
  CONVERSION_MODES,
  applyConversion,
  loadImageFromFile,
  cropCircle,
  cropCircleFromRect,
}
