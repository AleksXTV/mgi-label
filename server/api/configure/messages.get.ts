import { requireAdmin } from '../../utils/auth'
import { getMessages } from '../../utils/messages'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  return getMessages()
})
