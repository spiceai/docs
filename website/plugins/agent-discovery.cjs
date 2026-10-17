// Publishes agent discovery documents with the site build:
//
// - /.well-known/agent-skills/: the official Spice skills at a pinned commit of
//   https://github.com/spiceai/skills and an index.json, per the Agent Skills Discovery RFC v0.2.0
//   (https://github.com/cloudflare/agent-skills-discovery-rfc). A skill that consists of only a
//   SKILL.md is published as that file. A skill with supporting files is published as a .tar.gz
//   archive.
// - /.well-known/ard.json and /.well-known/ai-catalog.json: an Agentic Resource Discovery manifest
//   (https://agenticresourcediscovery.org/) of the runtime HTTP API and the skills. ard.json is the
//   current well-known path; ai-catalog.json is the predecessor path.
// - /openapi.json: the runtime HTTP API description that the API catalog and manifest link to.

const crypto = require('crypto')
const fs = require('fs/promises')
const path = require('path')
const zlib = require('zlib')

const SKILLS_INDEX_SCHEMA = 'https://schemas.agentskills.io/discovery/0.2.0/schema.json'
const SKILL_NAME = /^[a-z0-9]+(-[a-z0-9]+)*$/

// The per-skill contents of the official plugin package (scripts/package_plugin.sh in
// spiceai/skills). Evals and local configuration stay in that repository.
const SKILL_RESOURCE_DIRS = new Set(['scripts', 'references', 'config', 'examples'])
const EXCLUDED_NAMES = new Set([
  '.private',
  '.git',
  '.DS_Store',
  '__pycache__',
  '.audit',
  'evals',
  '.env'
])
const EXCLUDED_SKILLS = new Set(['improve-skills'])

// 1980-01-01, the timestamp the official package uses, so that unchanged skills produce
// identical archives and digests.
const ARCHIVE_MTIME = 315532800

module.exports = function agentDiscoveryPlugin(context, options) {
  return {
    name: 'agent-discovery',
    async postBuild({ outDir }) {
      const siteUrl = context.siteConfig.url
      await fs.copyFile(
        path.join(context.siteDir, options.openApiSpec),
        path.join(outDir, 'openapi.json')
      )
      const skills = await publishSkills(outDir, options.skillsRepository, options.skillsCommit)
      await publishArdManifest(outDir, siteUrl, skills)
    }
  }
}

// Downloads the skills at a commit rather than a tag. A tag can be moved to different content, and
// the index digests describe only the bytes that were downloaded.
async function publishSkills(outDir, repository, commit) {
  if (!/^[0-9a-f]{40}$/.test(commit ?? '')) {
    throw new Error(`agent-discovery: skillsCommit must be a full commit SHA, not ${commit}`)
  }
  const url = `https://github.com/${repository}/archive/${commit}.tar.gz`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`agent-discovery: downloading ${url} failed with HTTP ${response.status}`)
  }
  const archive = readTar(zlib.gunzipSync(Buffer.from(await response.arrayBuffer())))
  if (archive.commit !== commit) {
    throw new Error(
      `agent-discovery: ${url} is an archive of commit ${archive.commit}, not ${commit}`
    )
  }
  const collected = [...collectSkills(archive.files)].sort(([a], [b]) => a.localeCompare(b))
  if (collected.length === 0) {
    throw new Error(`agent-discovery: no skills found in ${repository}@${commit}`)
  }

  const skillsDir = path.join(outDir, '.well-known', 'agent-skills')
  await fs.mkdir(skillsDir, { recursive: true })
  const skills = []
  for (const [name, skill] of collected) {
    const markdown = skill.files.get('SKILL.md')?.data.toString('utf8')
    if (!markdown) {
      throw new Error(`agent-discovery: skill ${name} in ${repository}@${commit} has no SKILL.md`)
    }
    const { fields, body } = readFrontMatter(name, markdown)
    const { description } = validateFrontMatter(name, fields)

    const isArchive = skill.files.size > 1
    const artifact = isArchive ? `${name}.tar.gz` : `${name}/SKILL.md`
    const bytes = isArchive ? createTarGz(skill.files) : skill.files.get('SKILL.md').data
    await fs.mkdir(path.dirname(path.join(skillsDir, artifact)), { recursive: true })
    await fs.writeFile(path.join(skillsDir, artifact), bytes)

    skills.push({
      name,
      type: isArchive ? 'archive' : 'skill-md',
      description,
      url: `/.well-known/agent-skills/${artifact}`,
      digest: `sha256:${crypto.createHash('sha256').update(bytes).digest('hex')}`,
      displayName: /^#\s+(.+)$/m.exec(body)?.[1].trim() ?? name,
      representativeQueries: representativeQueries(skill.evals)
    })
  }

  const index = {
    $schema: SKILLS_INDEX_SCHEMA,
    skills: skills.map(({ name, type, description, url, digest }) => ({
      name,
      type,
      description,
      url,
      digest
    }))
  }
  await fs.writeFile(path.join(skillsDir, 'index.json'), `${JSON.stringify(index, null, 2)}\n`)
  return skills
}

async function publishArdManifest(outDir, siteUrl, skills) {
  const publisher = new URL(siteUrl).hostname
  const manifest = {
    specVersion: '1.0',
    host: {
      displayName: 'Spice AI, Inc.',
      identifier: publisher,
      documentationUrl: `${siteUrl}/docs`
    },
    entries: [
      {
        identifier: `urn:air:${publisher}:api:runtime-http`,
        displayName: 'Spice Runtime HTTP API',
        type: 'application/vnd.oai.openapi+json',
        url: `${siteUrl}/openapi.json`,
        description:
          'OpenAPI description of the HTTP API that a Spice runtime serves, by default at http://localhost:8090: SQL queries, search, OpenAI-compatible chat completions and embeddings, MCP, dataset acceleration, and readiness.',
        representativeQueries: [
          'run a SQL query against a Spice runtime over HTTP',
          'call the OpenAI-compatible chat completions API in Spice',
          'search a Spice dataset over HTTP',
          'check whether the Spice runtime is ready'
        ]
      },
      ...skills.map((skill) => ({
        identifier: `urn:air:${publisher}:skill:${skill.name}`,
        displayName: skill.displayName,
        // The ARD media types of a skill archive and of a single SKILL.md.
        type:
          skill.type === 'archive'
            ? 'application/agent-skills+gzip'
            : 'text/markdown; profile="urn:air:agent-skills"',
        url: new URL(skill.url, siteUrl).href,
        description: skill.description,
        ...(skill.representativeQueries.length >= 2 && {
          representativeQueries: skill.representativeQueries
        })
      }))
    ]
  }

  const json = `${JSON.stringify(manifest, null, 2)}\n`
  for (const file of ['ard.json', 'ai-catalog.json']) {
    await fs.writeFile(path.join(outDir, '.well-known', file), json)
  }
}

// Groups the files under skills/<name>/ by skill, keeping the files the official package ships.
function collectSkills(files) {
  const skills = new Map()
  for (const file of files) {
    const match = /^skills\/([^/]+)\/(.+)$/.exec(file.path)
    if (!match || EXCLUDED_SKILLS.has(match[1])) {
      continue
    }
    const [, name, relativePath] = match
    if (!skills.has(name)) {
      skills.set(name, { files: new Map(), evals: null })
    }
    const skill = skills.get(name)
    if (relativePath === 'evals/evals.json') {
      skill.evals = parseJson(file.data.toString('utf8'))
    } else if (isPackagedSkillFile(relativePath)) {
      skill.files.set(relativePath, file)
    }
  }
  return skills
}

function isPackagedSkillFile(relativePath) {
  const segments = relativePath.split('/')
  const excluded = segments.some(
    (segment) =>
      EXCLUDED_NAMES.has(segment) ||
      segment.startsWith('.env.') ||
      segment.includes('.local.') ||
      /(\.pyc|\.pyo|-workspace)$/.test(segment)
  )
  if (excluded) {
    return false
  }
  if (relativePath === 'SKILL.md') {
    return true
  }
  // The package copies only the top-level files of config/.
  if (segments[0] === 'config') {
    return segments.length === 2
  }
  return SKILL_RESOURCE_DIRS.has(segments[0]) && segments.length > 1
}

// Representative queries are optional, so an unreadable evals file only omits them.
function parseJson(text) {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

// Eval prompts are the requests each skill is tested against. The shortest ones serve as ARD
// representative queries.
function representativeQueries(evals) {
  return (evals?.evals ?? [])
    .map((entry) => String(entry.prompt ?? '').replace(/\s+/g, ' ').trim())
    .filter((prompt) => prompt.length > 0 && prompt.length <= 160)
    .sort((a, b) => a.length - b.length)
    .slice(0, 3)
}

// Parses SKILL.md front matter. Only single-line `key: value` fields are supported, which is the
// format the Agent Skills specification uses for name and description.
function readFrontMatter(skillName, markdown) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(markdown)
  if (!match) {
    throw new Error(`agent-discovery: SKILL.md of skill ${skillName} has no front matter`)
  }
  const fields = {}
  for (const line of match[1].split(/\r?\n/)) {
    if (line.trim() === '') {
      continue
    }
    const field = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(line)
    if (!field || /^[>|]/.test(field[2])) {
      throw new Error(
        `agent-discovery: unsupported front matter in skill ${skillName}: ${JSON.stringify(line)}`
      )
    }
    fields[field[1]] = unquote(field[2].trim())
  }
  return { fields, body: markdown.slice(match[0].length) }
}

function unquote(value) {
  if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
    return JSON.parse(value)
  }
  if (value.length >= 2 && value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1).replace(/''/g, "'")
  }
  return value
}

function validateFrontMatter(skillName, { name, description }) {
  if (name !== skillName || name.length > 64 || !SKILL_NAME.test(name)) {
    throw new Error(`agent-discovery: skill directory ${skillName} has invalid name ${name}`)
  }
  if (!description || description.length > 1024) {
    throw new Error(`agent-discovery: skill ${skillName} needs a description of 1-1024 characters`)
  }
  return { name, description }
}

// Reads the regular files of an uncompressed tar archive, without its top-level directory, and the
// commit that GitHub records in the archive's global header.
function readTar(buffer) {
  const files = []
  let commit
  let paxPath
  for (let offset = 0; offset + 512 <= buffer.length; ) {
    const header = buffer.subarray(offset, offset + 512)
    if (header.every((byte) => byte === 0)) {
      break
    }
    const size = parseInt(readField(header, 124, 12), 8) || 0
    const type = String.fromCharCode(header[156])
    const data = buffer.subarray(offset + 512, offset + 512 + size)
    offset += 512 + Math.ceil(size / 512) * 512

    if (type === 'g') {
      commit = /(?:^|\n)\d+ comment=([0-9a-f]{40})\n/.exec(data.toString('utf8'))?.[1]
      continue
    }
    if (type === 'x') {
      paxPath = /(?:^|\n)\d+ path=([^\n]*)\n/.exec(data.toString('utf8'))?.[1]
      continue
    }
    const name = readField(header, 0, 100)
    const prefix = readField(header, 345, 155)
    const entryPath = paxPath ?? (prefix ? `${prefix}/${name}` : name)
    paxPath = undefined
    if (type === '0' || type === '\0') {
      files.push({
        path: entryPath.split('/').slice(1).join('/'),
        mode: parseInt(readField(header, 100, 8), 8),
        data
      })
    }
  }
  return { commit, files }
}

function readField(header, start, length) {
  const field = header.subarray(start, start + length)
  const end = field.indexOf(0)
  return field
    .subarray(0, end === -1 ? length : end)
    .toString('utf8')
    .trim()
}

// Creates a gzip-compressed ustar archive with the files at its root and normalized metadata.
function createTarGz(files) {
  const blocks = []
  for (const [name, file] of [...files].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) {
    if (Buffer.byteLength(name) >= 100) {
      throw new Error(`agent-discovery: archive path is too long: ${name}`)
    }
    const header = Buffer.alloc(512)
    header.write(name, 0, 'utf8')
    header.write(octal(file.mode & 0o111 ? 0o755 : 0o644, 8), 100)
    header.write(octal(0, 8), 108)
    header.write(octal(0, 8), 116)
    header.write(octal(file.data.length, 12), 124)
    header.write(octal(ARCHIVE_MTIME, 12), 136)
    header.write(' '.repeat(8), 148)
    header.write('0', 156)
    header.write('ustar\u000000', 257)
    header.write(octal(header.reduce((sum, byte) => sum + byte, 0), 7), 148)
    blocks.push(header, file.data, Buffer.alloc((512 - (file.data.length % 512)) % 512))
  }
  blocks.push(Buffer.alloc(1024))
  return zlib.gzipSync(Buffer.concat(blocks), { level: 9 })
}

function octal(value, length) {
  return `${value.toString(8).padStart(length - 1, '0')}\0`
}
