import { destroyAdminSession } from '../../utils/auth'
export default defineEventHandler((event) => {
  destroyAdminSession(event)
  return { ok: true }
})
