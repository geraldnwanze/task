import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { deflateSync } from 'node:zlib'

const root = dirname(dirname(fileURLToPath(import.meta.url)))

const colors = {
  amber: [250, 204, 21, 255],
  amberDark: [113, 63, 18, 255],
  mint: [204, 251, 241, 255],
  paper: [248, 250, 252, 255],
  slate: [15, 23, 42, 255],
  teal: [15, 118, 110, 255],
  tealLight: [94, 234, 212, 255],
  tealMid: [20, 184, 166, 255],
}

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let value = index

  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1
  }

  return value >>> 0
})

const crc32 = (buffer) => {
  let crc = 0xffffffff

  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  }

  return (crc ^ 0xffffffff) >>> 0
}

const chunk = (type, data) => {
  const typeBuffer = Buffer.from(type)
  const length = Buffer.alloc(4)
  const crc = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])))
  return Buffer.concat([length, typeBuffer, data, crc])
}

const createImage = (size) => {
  const data = new Uint8ClampedArray(size * size * 4)

  const setPixel = (x, y, color) => {
    if (x < 0 || y < 0 || x >= size || y >= size) {
      return
    }

    const index = (Math.floor(y) * size + Math.floor(x)) * 4
    data[index] = color[0]
    data[index + 1] = color[1]
    data[index + 2] = color[2]
    data[index + 3] = color[3]
  }

  const rect = (x, y, width, height, color) => {
    const startX = Math.max(0, Math.floor(x * size))
    const startY = Math.max(0, Math.floor(y * size))
    const endX = Math.min(size, Math.ceil((x + width) * size))
    const endY = Math.min(size, Math.ceil((y + height) * size))

    for (let py = startY; py < endY; py += 1) {
      for (let px = startX; px < endX; px += 1) {
        setPixel(px, py, color)
      }
    }
  }

  const circle = (cx, cy, radius, color) => {
    const centerX = cx * size
    const centerY = cy * size
    const scaledRadius = radius * size
    const minX = Math.max(0, Math.floor(centerX - scaledRadius))
    const maxX = Math.min(size, Math.ceil(centerX + scaledRadius))
    const minY = Math.max(0, Math.floor(centerY - scaledRadius))
    const maxY = Math.min(size, Math.ceil(centerY + scaledRadius))

    for (let py = minY; py < maxY; py += 1) {
      for (let px = minX; px < maxX; px += 1) {
        const dx = px + 0.5 - centerX
        const dy = py + 0.5 - centerY

        if (dx * dx + dy * dy <= scaledRadius * scaledRadius) {
          setPixel(px, py, color)
        }
      }
    }
  }

  const roundedRect = (x, y, width, height, radius, color) => {
    const left = x * size
    const top = y * size
    const right = (x + width) * size
    const bottom = (y + height) * size
    const scaledRadius = radius * size
    const startX = Math.max(0, Math.floor(left))
    const startY = Math.max(0, Math.floor(top))
    const endX = Math.min(size, Math.ceil(right))
    const endY = Math.min(size, Math.ceil(bottom))

    for (let py = startY; py < endY; py += 1) {
      for (let px = startX; px < endX; px += 1) {
        const nearestX = Math.max(left + scaledRadius, Math.min(px + 0.5, right - scaledRadius))
        const nearestY = Math.max(top + scaledRadius, Math.min(py + 0.5, bottom - scaledRadius))
        const dx = px + 0.5 - nearestX
        const dy = py + 0.5 - nearestY

        if (dx * dx + dy * dy <= scaledRadius * scaledRadius) {
          setPixel(px, py, color)
        }
      }
    }
  }

  const line = (x1, y1, x2, y2, thickness, color) => {
    const startX = x1 * size
    const startY = y1 * size
    const endX = x2 * size
    const endY = y2 * size
    const radius = (thickness * size) / 2
    const minX = Math.max(0, Math.floor(Math.min(startX, endX) - radius))
    const maxX = Math.min(size, Math.ceil(Math.max(startX, endX) + radius))
    const minY = Math.max(0, Math.floor(Math.min(startY, endY) - radius))
    const maxY = Math.min(size, Math.ceil(Math.max(startY, endY) + radius))
    const dx = endX - startX
    const dy = endY - startY
    const lengthSquared = dx * dx + dy * dy

    for (let py = minY; py < maxY; py += 1) {
      for (let px = minX; px < maxX; px += 1) {
        const progress = Math.max(
          0,
          Math.min(1, (((px + 0.5 - startX) * dx) + ((py + 0.5 - startY) * dy)) / lengthSquared),
        )
        const nearestX = startX + progress * dx
        const nearestY = startY + progress * dy
        const distanceX = px + 0.5 - nearestX
        const distanceY = py + 0.5 - nearestY

        if (distanceX * distanceX + distanceY * distanceY <= radius * radius) {
          setPixel(px, py, color)
        }
      }
    }
  }

  roundedRect(0, 0, 1, 1, 0.22, colors.slate)
  circle(0.5, 0.5, 0.37, colors.teal)
  roundedRect(0.23, 0.25, 0.46, 0.55, 0.06, colors.paper)
  roundedRect(0.31, 0.2, 0.3, 0.12, 0.04, colors.mint)
  rect(0.38, 0.37, 0.24, 0.055, colors.slate)
  rect(0.38, 0.5, 0.2, 0.055, colors.slate)
  rect(0.38, 0.63, 0.16, 0.055, colors.slate)
  line(0.3, 0.39, 0.34, 0.43, 0.035, colors.tealMid)
  line(0.34, 0.43, 0.43, 0.33, 0.035, colors.tealMid)
  line(0.3, 0.52, 0.34, 0.56, 0.035, colors.tealMid)
  line(0.34, 0.56, 0.43, 0.46, 0.035, colors.tealMid)
  circle(0.68, 0.67, 0.16, colors.slate)
  circle(0.68, 0.67, 0.115, colors.tealLight)
  line(0.68, 0.59, 0.68, 0.68, 0.035, colors.slate)
  line(0.68, 0.68, 0.76, 0.73, 0.035, colors.slate)
  circle(0.34, 0.68, 0.075, colors.amber)
  rect(0.318, 0.62, 0.035, 0.13, colors.amberDark)
  rect(0.285, 0.648, 0.095, 0.03, colors.amberDark)
  rect(0.285, 0.704, 0.095, 0.03, colors.amberDark)

  return data
}

const encodePng = (width, height, rgbaData) => {
  const stride = width * 4
  const raw = Buffer.alloc((stride + 1) * height)

  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0
    Buffer.from(rgbaData.buffer, y * stride, stride).copy(raw, y * (stride + 1) + 1)
  }

  const header = Buffer.alloc(13)
  header.writeUInt32BE(width, 0)
  header.writeUInt32BE(height, 4)
  header[8] = 8
  header[9] = 6

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

for (const size of [180, 192, 512]) {
  const png = encodePng(size, size, createImage(size))
  writeFileSync(resolve(root, `public/pwa-icon-${size}.png`), png)
}
