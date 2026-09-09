<script setup lang="ts">
import type { ContactFormLabels } from '#shared/types'
import { localize } from '~/utils/content'

const props = defineProps<{ labels: ContactFormLabels, language: string, fallback: string }>()
const subject = ref('')
const contacts = ref('')
const message = ref('')
const website = ref('')
const startedAt = ref(Date.now())
const sending = ref(false)
const success = ref('')
const error = ref('')

async function submit() {
  success.value = ''
  error.value = ''
  sending.value = true
  try {
    await $fetch('/api/contact', {
      method: 'POST',
      body: {
        subject: subject.value,
        contacts: contacts.value,
        message: message.value,
        language: props.language,
        website: website.value,
        startedAt: startedAt.value
      }
    })
    success.value = localize(props.labels.success, props.language, props.fallback)
    subject.value = ''
    contacts.value = ''
    message.value = ''
    website.value = ''
    startedAt.value = Date.now()
  } catch (e: any) {
    error.value = localize(props.labels.error, props.language, props.fallback) || e?.data?.statusMessage || e?.message || 'Unable to send message.'
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <form class="contact-form" @submit.prevent="submit">
    <div class="honeypot" aria-hidden="true">
      <label>Website<input v-model="website" type="text" tabindex="-1" autocomplete="off" /></label>
    </div>
    <label>
      <span>{{ localize(labels.subject, language, fallback) }}</span>
      <input v-model="subject" required maxlength="200" autocomplete="off" />
    </label>
    <label>
      <span>{{ localize(labels.contacts, language, fallback) }}</span>
      <textarea v-model="contacts" required maxlength="1000" rows="3"></textarea>
    </label>
    <label>
      <span>{{ localize(labels.message, language, fallback) }}</span>
      <textarea v-model="message" required maxlength="10000" rows="7"></textarea>
    </label>
    <div class="contact-form-foot">
      <p v-if="success" class="form-success" role="status">{{ success }}</p>
      <p v-else-if="error" class="form-error" role="alert">{{ error }}</p>
      <button type="submit" class="send-button" :disabled="sending">{{ sending ? '…' : localize(labels.submit, language, fallback) }} <span>→</span></button>
    </div>
  </form>
</template>
