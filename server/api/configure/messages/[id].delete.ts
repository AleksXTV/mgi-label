import { createError, getRouterParam } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { updateMessages } from '../../../utils/messages'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = getRouterParam(event, 'id') || ''
  await updateMessages((items) => {
    const index = items.findIndex((x) => x.id === id)
    if (index < 0) throw createError({ statusCode: 404, statusMessage: 'Message not found' })
    items.splice(index, 1)
  })
  return { ok: true }
})
