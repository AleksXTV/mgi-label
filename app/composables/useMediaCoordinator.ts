export function useMediaCoordinator() {
  const activeId = useState<string | null>('mgi-active-media', () => null)
  const activate = (id: string) => { activeId.value = id }
  const deactivate = (id: string) => { if (activeId.value === id) activeId.value = null }
  return { activeId, activate, deactivate }
}
