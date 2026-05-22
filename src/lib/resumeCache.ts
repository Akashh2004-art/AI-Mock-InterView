const DB_NAME = "InterviewAI_DB"
const STORE_NAME = "resumeCache"
const CACHE_KEY = "cachedResume"
const EXPIRY_DAYS = 30

interface CachedResume {
  key: string
  blob: Blob
  fileName: string
  timestamp: number
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "key" })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function saveResumeToCache(file: File): Promise<void> {
  try {
    const db = await openDB()
    const data: CachedResume = {
      key: CACHE_KEY,
      blob: file,
      fileName: file.name,
      timestamp: Date.now(),
    }
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite")
      const store = tx.objectStore(STORE_NAME)
      const req = store.put(data)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  } catch (err) {
    console.error("Failed to save resume to cache:", err)
  }
}

export async function loadResumeFromCache(): Promise<{ fileName: string; timestamp: number } | null> {
  try {
    const db = await openDB()
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly")
      const store = tx.objectStore(STORE_NAME)
      const req = store.get(CACHE_KEY)
      req.onsuccess = () => {
        const data: CachedResume | undefined = req.result
        if (!data) return resolve(null)

        // Expiry check
        const expiryMs = EXPIRY_DAYS * 24 * 60 * 60 * 1000
        if (Date.now() - data.timestamp > expiryMs) {
          clearResumeCache()
          return resolve(null)
        }

        resolve({ fileName: data.fileName, timestamp: data.timestamp })
      }
      req.onerror = () => resolve(null)
    })
  } catch {
    return null
  }
}

export async function getCachedResumeAsFile(): Promise<File | null> {
  try {
    const db = await openDB()
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly")
      const store = tx.objectStore(STORE_NAME)
      const req = store.get(CACHE_KEY)
      req.onsuccess = () => {
        const data: CachedResume | undefined = req.result
        if (!data) return resolve(null)

        // Expiry check
        const expiryMs = EXPIRY_DAYS * 24 * 60 * 60 * 1000
        if (Date.now() - data.timestamp > expiryMs) {
          clearResumeCache()
          return resolve(null)
        }

        const file = new File([data.blob], data.fileName, { type: "application/pdf" })
        resolve(file)
      }
      req.onerror = () => resolve(null)
    })
  } catch {
    return null
  }
}

export async function clearResumeCache(): Promise<void> {
  try {
    const db = await openDB()
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readwrite")
      const store = tx.objectStore(STORE_NAME)
      store.delete(CACHE_KEY)
      tx.oncomplete = () => resolve()
    })
  } catch {
    // ignore
  }
}