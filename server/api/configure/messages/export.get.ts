import { setHeader } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { getMessages } from '../../../utils/messages'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const messages = await getMessages()
  setHeader(event, 'Content-Type', 'application/json; charset=utf-8')
  setHeader(event, 'Content-Disposition', 'attachment; filename="messages.json"')
  return `${JSON.stringify(messages, null, 2)}\n`
})
