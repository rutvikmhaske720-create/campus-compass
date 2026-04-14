import { cp, rm, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '..')
const src = resolve(projectRoot, 'node_modules/cesium/Build/Cesium')
const dest = resolve(projectRoot, 'public/cesium')

if (!existsSync(src)) {
  console.error('[copy-cesium] source not found:', src)
  console.error('[copy-cesium] run `npm install cesium` first')
  process.exit(1)
}

if (existsSync(dest)) {
  await rm(dest, { recursive: true, force: true })
}
await mkdir(dest, { recursive: true })

for (const dir of ['Assets', 'Widgets', 'Workers', 'ThirdParty']) {
  const from = resolve(src, dir)
  const to = resolve(dest, dir)
  if (existsSync(from)) {
    await cp(from, to, { recursive: true })
    console.log('[copy-cesium] copied', dir)
  }
}

console.log('[copy-cesium] done ->', dest)
