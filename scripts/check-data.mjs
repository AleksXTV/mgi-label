import { readFile, readdir } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = resolve(process.cwd(), 'data')
let failed = false
const errors = []

async function readJson(file) {
  try { return JSON.parse(await readFile(file, 'utf8')) }
  catch (error) { failed = true; errors.push(`${file}: ${error.message}`); return null }
}

const site = await readJson(resolve(root, 'site.json'))
if (site) {
  if (site.schemaVersion !== 1) errors.push('site.json: schemaVersion must be 1')
  for (const key of ['logo', 'favicon']) {
    const name = site.branding?.[key]
    if (!name) continue
    try { await readFile(resolve(root, 'images', name)) } catch { errors.push(`site.json: missing branding ${key} image ${name}`) }
  }
  const orders = new Set()
  const routes = new Set()
  for (const item of site.menu || []) {
    if (orders.has(item.order)) errors.push(`site.json: duplicate menu order ${item.order}`)
    orders.add(item.order)
    if (routes.has(item.route)) errors.push(`site.json: duplicate route ${item.route}`)
    routes.add(item.route)
  }
}

for (const name of await readdir(resolve(root, 'pages'))) {
  if (!name.endsWith('.json')) continue
  const page = await readJson(resolve(root, 'pages', name))
  if (!page) continue
  if (page.schemaVersion !== 1) errors.push(`${name}: schemaVersion must be 1`)
  if (!Array.isArray(page.blocks)) errors.push(`${name}: blocks must be an array`)
  const ids = new Set()
  for (const block of page.blocks || []) {
    if (ids.has(block.id)) errors.push(`${name}: duplicate block id ${block.id}`)
    ids.add(block.id)
    for (const media of block.media || []) {
      if (media.type === 'image') {
        const target = resolve(root, 'images', media.source)
        try { await readFile(target) } catch { errors.push(`${name}/${block.id}: missing image ${media.source}`) }
      }
    }
  }
  if (page.seo?.image) {
    try { await readFile(resolve(root, 'images', page.seo.image)) } catch { errors.push(`${name}: missing SEO image ${page.seo.image}`) }
  }
}

for (const name of ['messages.json', 'config/admin.json', 'config/telegram.json']) await readJson(resolve(root, name))

if (errors.length) {
  console.error(errors.join('\n'))
  process.exitCode = 1
} else {
  console.log('Runtime data check passed.')
}
