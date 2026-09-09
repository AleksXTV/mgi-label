import { access, cp, mkdir, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = process.cwd()
const output = resolve(root, '.output')
try { await access(output) } catch { throw new Error('Run npm run build before npm run package:deploy') }
const target = resolve(root, '.deploy', 'mgi-records')
await rm(resolve(root, '.deploy'), { recursive: true, force: true })
await mkdir(target, { recursive: true })
await cp(output, resolve(target, '.output'), { recursive: true })
await cp(resolve(root, 'data'), resolve(target, 'data'), { recursive: true })
await writeFile(resolve(target, 'DEPLOY.txt'), `M.G.I. Records\n\nRun from this directory with a supported Node.js version:\nNODE_ENV=production node .output/server/index.mjs\n\nOptional:\nMGI_DATA_DIR=/absolute/path/to/data NODE_ENV=production node .output/server/index.mjs\n\nDo not overwrite an existing production data directory during application upgrades.\n`)
console.log(`Deployment directory created: ${target}`)
