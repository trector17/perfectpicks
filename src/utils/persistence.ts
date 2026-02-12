const STORAGE_PREFIX = 'perfectpicks:'

export function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data))
  } catch {
    console.warn(`Failed to save ${key} to localStorage`)
  }
}

export function loadFromStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key)
    if (raw === null) return null
    return JSON.parse(raw) as T
  } catch {
    console.warn(`Failed to load ${key} from localStorage`)
    return null
  }
}

export function removeFromStorage(key: string): void {
  localStorage.removeItem(STORAGE_PREFIX + key)
}
