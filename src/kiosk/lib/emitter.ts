export type Unsubscribe = () => void

/**
 * Minimal typed event emitter used by the hardware services.
 * Real driver implementations can keep the same event surface.
 */
export class TypedEmitter<Events extends Record<string, unknown>> {
  private listeners = new Map<keyof Events, Set<(payload: unknown) => void>>()

  on<K extends keyof Events>(event: K, handler: (payload: Events[K]) => void): Unsubscribe {
    let set = this.listeners.get(event)
    if (!set) {
      set = new Set()
      this.listeners.set(event, set)
    }
    set.add(handler as (payload: unknown) => void)
    return () => {
      set?.delete(handler as (payload: unknown) => void)
    }
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    const set = this.listeners.get(event)
    if (!set) return
    for (const handler of [...set]) {
      handler(payload)
    }
  }

  removeAll(): void {
    this.listeners.clear()
  }
}
