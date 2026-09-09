import type { ContactMessage } from '../../shared/types'
import { dataPath } from './paths'
import { atomicWriteJson, readJson, withFileLock } from './files'

const file = () => dataPath('messages.json')

export async function getMessages(): Promise<ContactMessage[]> {
  try { return await readJson<ContactMessage[]>(file()) } catch { return [] }
}

export async function updateMessages<T>(action: (messages: ContactMessage[]) => T | Promise<T>): Promise<T> {
  return withFileLock(file(), async () => {
    const messages = await getMessages()
    const result = await action(messages)
    await atomicWriteJson(file(), messages)
    return result
  })
}
