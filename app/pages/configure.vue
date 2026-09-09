<script setup lang="ts">
import type { ContactMessage, ValidationIssue } from '#shared/types'

definePageMeta({ layout: 'configure' })
useHead({ title: 'M.G.I. Records — Configure', meta: [{ name: 'robots', content: 'noindex,nofollow' }] })

const { data: me } = await useFetch<{ authenticated: boolean }>('/api/configure/me')
const authenticated = ref(Boolean(me.value?.authenticated))
const username = ref('')
const password = ref('')
const loginError = ref('')
const tab = ref<'json'|'images'|'messages'>('json')

const jsonFiles = ref<string[]>([])
const selectedFile = ref('site.json')
const jsonContent = ref('')
const jsonEditor = ref<HTMLTextAreaElement | null>(null)
const validation = ref<{ valid: boolean, issues: ValidationIssue[] } | null>(null)
const adminNotice = ref('')
const adminError = ref('')

const pasteLanguage = ref('en')
const pasteLanguages = ref<Array<{ code: string, label: string }>>([{ code: 'en', label: 'ENG' }, { code: 'ru', label: 'RUS' }])
const pasteText = ref('')

const images = ref<Array<{ name: string, size: number, usages: Array<{ file: string, block?: string }> }>>([])
const imageInput = ref<HTMLInputElement | null>(null)

const messages = ref<ContactMessage[]>([])
const selectedMessage = ref<ContactMessage | null>(null)

function clearStatus() { adminNotice.value = ''; adminError.value = '' }
function readableSize(bytes: number) { return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB` }
function formatDate(value: string) { return new Date(value).toLocaleString() }

async function login() {
  loginError.value = ''
  try {
    await $fetch('/api/configure/login', { method: 'POST', body: { username: username.value, password: password.value } })
    authenticated.value = true
    password.value = ''
    await loadAdmin()
  } catch (error: any) { loginError.value = error?.data?.statusMessage || error?.data?.message || 'Login failed' }
}

async function logout() {
  await $fetch('/api/configure/logout', { method: 'POST' }).catch(() => {})
  authenticated.value = false
  username.value = ''
  password.value = ''
}

async function loadAdmin() {
  if (!authenticated.value) return
  const sitePromise = $fetch<any>('/api/content/site').then((site) => {
    pasteLanguages.value = (site.languages || []).filter((x: any) => x.enabled).sort((a: any,b: any) => a.order - b.order).map((x: any) => ({ code: x.code, label: x.label }))
    if (!pasteLanguages.value.some(x => x.code === pasteLanguage.value)) pasteLanguage.value = site.defaultLanguage || pasteLanguages.value[0]?.code || 'en'
  }).catch(() => {})
  await Promise.all([loadJsonFiles(), loadImages(), loadMessages(), sitePromise])
}

async function loadJsonFiles() {
  jsonFiles.value = await $fetch<string[]>('/api/configure/json-files')
  if (!jsonFiles.value.includes(selectedFile.value)) selectedFile.value = jsonFiles.value[0] || 'site.json'
  await loadJson()
}

async function loadJson() {
  clearStatus(); validation.value = null
  try {
    const result = await $fetch<{ content: string }>('/api/configure/json', { query: { file: selectedFile.value } })
    jsonContent.value = result.content
  } catch (error: any) { adminError.value = error?.data?.statusMessage || 'Unable to load JSON' }
}

function formatJson() {
  clearStatus()
  try { jsonContent.value = `${JSON.stringify(JSON.parse(jsonContent.value), null, 2)}\n` }
  catch (error: any) { adminError.value = error?.message || 'Invalid JSON' }
}

async function validateJson() {
  clearStatus()
  validation.value = await $fetch('/api/configure/validate', { method: 'POST', body: { file: selectedFile.value, content: jsonContent.value } })
  if (validation.value?.valid) adminNotice.value = 'JSON is valid.'
}

async function saveJson() {
  clearStatus(); validation.value = null
  try {
    await $fetch('/api/configure/json', { method: 'PUT', body: { file: selectedFile.value, content: jsonContent.value } })
    adminNotice.value = 'Saved successfully.'
    await loadJson()
  } catch (error: any) {
    const issues = error?.data?.data?.issues || error?.data?.issues
    if (issues) validation.value = { valid: false, issues }
    adminError.value = error?.data?.statusMessage || 'Save failed.'
  }
}

function insertPastedText() {
  clearStatus()
  const paragraphs = pasteText.value.split(/\r?\n\s*\r?\n/).map(x => x.replace(/\s*\r?\n\s*/g, ' ').trim()).filter(Boolean)
  if (!paragraphs.length) return
  const value: string | string[] = paragraphs.length === 1 ? paragraphs[0]! : paragraphs
  const fragment = `${JSON.stringify(pasteLanguage.value)}: ${JSON.stringify(value, null, 2)}`
  const el = jsonEditor.value
  if (!el) { jsonContent.value += fragment; return }
  const start = el.selectionStart ?? jsonContent.value.length
  const end = el.selectionEnd ?? start
  jsonContent.value = jsonContent.value.slice(0, start) + fragment + jsonContent.value.slice(end)
  pasteText.value = ''
  nextTick(() => { el.focus(); el.selectionStart = el.selectionEnd = start + fragment.length })
}

async function loadImages() {
  if (!authenticated.value) return
  images.value = await $fetch('/api/configure/images')
}

async function uploadImage() {
  clearStatus()
  const file = imageInput.value?.files?.[0]
  if (!file) return
  const form = new FormData(); form.append('file', file)
  try {
    const result = await $fetch<{ name: string }>('/api/configure/images', { method: 'POST', body: form })
    adminNotice.value = `Uploaded as ${result.name}.`
    if (imageInput.value) imageInput.value.value = ''
    await loadImages()
  } catch (error: any) { adminError.value = error?.data?.statusMessage || 'Upload failed.' }
}

async function deleteImage(item: typeof images.value[number]) {
  clearStatus()
  if (!confirm(`Delete ${item.name}?`)) return
  try {
    let result = await $fetch<any>(`/api/configure/images/${encodeURIComponent(item.name)}`, { method: 'DELETE' })
    if (result.requiresConfirmation) {
      const usage = result.usages.map((x: any) => `${x.file}${x.block ? ` / ${x.block}` : ''}`).join('\n')
      if (!confirm(`This image is referenced by:\n\n${usage}\n\nDelete anyway?`)) return
      result = await $fetch<any>(`/api/configure/images/${encodeURIComponent(item.name)}`, { method: 'DELETE', query: { force: 1 } })
    }
    adminNotice.value = `Deleted ${item.name}.`
    await loadImages()
  } catch (error: any) { adminError.value = error?.data?.statusMessage || 'Delete failed.' }
}

async function loadMessages() {
  if (!authenticated.value) return
  messages.value = await $fetch('/api/configure/messages')
}

async function openMessage(item: ContactMessage) {
  selectedMessage.value = await $fetch(`/api/configure/messages/${item.id}`)
  await loadMessages()
}

async function deleteMessage(item: ContactMessage) {
  if (!confirm(`Delete message "${item.subject}"?`)) return
  await $fetch(`/api/configure/messages/${item.id}`, { method: 'DELETE' })
  if (selectedMessage.value?.id === item.id) selectedMessage.value = null
  await loadMessages()
}

function exportMessages() { window.location.assign('/api/configure/messages/export') }

watch(selectedFile, () => { if (authenticated.value) void loadJson() })
watch(tab, (value) => {
  clearStatus()
  if (value === 'images') void loadImages()
  if (value === 'messages') void loadMessages()
})

onMounted(() => { if (authenticated.value) void loadAdmin() })
</script>

<template>
  <div class="configure-page">
    <section v-if="!authenticated" class="admin-login">
      <h1>M.G.I. Records</h1>
      <p>Configuration</p>
      <form @submit.prevent="login">
        <label>Username<input v-model="username" autocomplete="username" autofocus /></label>
        <label>Password<input v-model="password" type="password" autocomplete="current-password" /></label>
        <p v-if="loginError" class="admin-error">{{ loginError }}</p>
        <button type="submit">Login</button>
      </form>
    </section>

    <template v-else>
      <header class="admin-header">
        <div><strong>M.G.I. Records</strong><span>/configure</span></div>
        <button type="button" @click="logout">Logout</button>
      </header>

      <nav class="admin-tabs">
        <button :class="{active: tab === 'json'}" @click="tab = 'json'">JSON</button>
        <button :class="{active: tab === 'images'}" @click="tab = 'images'">Images</button>
        <button :class="{active: tab === 'messages'}" @click="tab = 'messages'">Messages <span v-if="messages.some(x => x.status === 'new')">({{ messages.filter(x => x.status === 'new').length }})</span></button>
      </nav>

      <p v-if="adminNotice" class="admin-notice">{{ adminNotice }}</p>
      <p v-if="adminError" class="admin-error">{{ adminError }}</p>

      <section v-if="tab === 'json'" class="admin-section">
        <div class="admin-toolbar">
          <select v-model="selectedFile"><option v-for="file in jsonFiles" :key="file">{{ file }}</option></select>
          <button @click="formatJson">Format JSON</button>
          <button @click="validateJson">Validate</button>
          <button class="primary" @click="saveJson">Save</button>
        </div>
        <textarea ref="jsonEditor" v-model="jsonContent" class="json-editor" spellcheck="false"></textarea>
        <div v-if="validation && !validation.valid" class="validation-list">
          <strong>Validation errors</strong>
          <ul><li v-for="(item, i) in validation.issues" :key="i"><code>{{ item.path }}</code> — {{ item.message }}</li></ul>
        </div>
        <details class="paste-tool">
          <summary>Paste Text utility</summary>
          <p>Paste normal paragraphs below. The utility creates a JSON string or paragraph array and inserts the language fragment at the current editor cursor.</p>
          <label>Language <select v-model="pasteLanguage"><option v-for="item in pasteLanguages" :key="item.code" :value="item.code">{{ item.code }} / {{ item.label }}</option></select></label>
          <textarea v-model="pasteText" rows="8" placeholder="Paste paragraphs here..."></textarea>
          <button @click="insertPastedText">Insert fragment at cursor</button>
        </details>
      </section>

      <section v-else-if="tab === 'images'" class="admin-section">
        <div class="image-upload">
          <input ref="imageInput" type="file" accept="image/avif,image/webp,image/jpeg,image/png,image/apng,image/gif,image/svg+xml" />
          <button class="primary" @click="uploadImage">Upload image</button>
          <small>Maximum 10 MB. File names are normalized to lowercase and spaces become underscores.</small>
        </div>
        <table class="admin-table">
          <thead><tr><th>Preview</th><th>Filename</th><th>Size</th><th>References</th><th></th></tr></thead>
          <tbody>
            <tr v-for="item in images" :key="item.name">
              <td><img :src="`/media/${encodeURIComponent(item.name)}`" alt="" /></td>
              <td><code>{{ item.name }}</code></td><td>{{ readableSize(item.size) }}</td>
              <td><span v-if="!item.usages.length">—</span><span v-else>{{ item.usages.map(x => `${x.file}${x.block ? ` / ${x.block}` : ''}`).join(', ') }}</span></td>
              <td><button class="danger" @click="deleteImage(item)">Delete</button></td>
            </tr>
          </tbody>
        </table>
      </section>

      <section v-else class="admin-section messages-layout">
        <div class="messages-list">
          <div class="messages-head"><strong>Incoming messages</strong><button @click="exportMessages">Download messages.json</button></div>
          <button v-for="item in messages" :key="item.id" class="message-row" :class="{unread: item.status === 'new'}" @click="openMessage(item)">
            <span class="message-status">{{ item.status === 'new' ? '● NEW' : '○ READ' }}</span>
            <strong>{{ item.subject }}</strong><small>{{ formatDate(item.createdAt) }}</small><span>{{ item.contacts }}</span>
          </button>
          <p v-if="!messages.length">No messages yet.</p>
        </div>
        <article v-if="selectedMessage" class="message-detail">
          <div class="messages-head"><strong>Message</strong><button class="danger" @click="deleteMessage(selectedMessage)">Delete</button></div>
          <dl>
            <dt>Created</dt><dd>{{ formatDate(selectedMessage.createdAt) }}</dd>
            <dt>Language</dt><dd>{{ selectedMessage.language }}</dd>
            <dt>Subject</dt><dd>{{ selectedMessage.subject }}</dd>
            <dt>Contacts</dt><dd class="prewrap">{{ selectedMessage.contacts }}</dd>
            <dt>Message</dt><dd class="prewrap">{{ selectedMessage.message }}</dd>
          </dl>
          <h3>Telegram delivery</h3>
          <p v-if="!selectedMessage.telegram.length">No recipients configured.</p>
          <ul v-else><li v-for="item in selectedMessage.telegram" :key="item.chatId">{{ item.status === 'sent' ? '✓' : item.status === 'failed' ? '✕' : '–' }} {{ item.chatId }} — {{ item.status }}<span v-if="item.error">: {{ item.error }}</span></li></ul>
        </article>
      </section>
    </template>
  </div>
</template>
