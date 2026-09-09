import { createError, getRouterParam } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { updateMessages } from '../../../utils/messages'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = getRouterParam(event, 'id') || ''
  let found: any = null
  await updateMessages((items) => {
    found = items.find((x) => x.id === id)
    if (!found) throw createError({ statusCode: 404, statusMessage: 'Message not found' })
    found.status = 'read'
  })
  return found
})
