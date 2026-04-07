import { logger } from '@/lib/logger'

const STORAGE_KEY = 'rithmic_sync_data'
const CREDENTIAL_KEY_NAME = 'rithmic_credential_encryption_key'
const CREDENTIAL_KEY_ALGORITHM = 'AES-GCM'
const CREDENTIAL_KEY_LENGTH = 256

let cachedKey: CryptoKey | null = null

export function invalidateEncryptionKeyCache() {
  cachedKey = null
}

export interface RithmicCredentialSet {
  id: string
  credentials: {
    username: string
    password: string
    server_type: string
    location: string
  }
  selectedAccounts: string[]
  lastSyncTime: string
  name?: string
  allAccounts?: boolean
}

interface EncryptedPayload {
  ciphertext: string
  iv: string
  version: number
}

async function getOrCreateEncryptionKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey

  // Try to get session-derived key from API
  try {
    const response = await fetch('/api/rithmic/encryption-key')
    if (response.ok) {
      const data = await response.json()
      if (data.key) {
        const keyBytes = Uint8Array.from(atob(data.key), (c) => c.charCodeAt(0))
        cachedKey = await crypto.subtle.importKey(
          'raw',
          keyBytes,
          { name: CREDENTIAL_KEY_ALGORITHM, length: CREDENTIAL_KEY_LENGTH },
          false,
          ['encrypt', 'decrypt']
        )
        return cachedKey
      }
    }
  } catch {
    logger.warn('[Rithmic] Failed to get session-derived key, falling back to localStorage')
  }

  // Fallback: try existing localStorage key (migration path)
  const existingKeyBase64 = localStorage.getItem(CREDENTIAL_KEY_NAME)
  if (existingKeyBase64) {
    try {
      const keyBytes = Uint8Array.from(atob(existingKeyBase64), (c) => c.charCodeAt(0))
      cachedKey = await crypto.subtle.importKey(
        'raw',
        keyBytes,
        { name: CREDENTIAL_KEY_ALGORITHM, length: CREDENTIAL_KEY_LENGTH },
        false,
        ['encrypt', 'decrypt']
      )
      return cachedKey
    } catch {
      logger.warn('[Rithmic] Existing localStorage key is invalid, generating new one')
    }
  }

  // Last resort: generate a new key
  const key = await crypto.subtle.generateKey(
    { name: CREDENTIAL_KEY_ALGORITHM, length: CREDENTIAL_KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  )

  const exported = await crypto.subtle.exportKey('raw', key)
  const keyBase64 = btoa(Array.from(new Uint8Array(exported), (b) => String.fromCharCode(b)).join(''))
  localStorage.setItem(CREDENTIAL_KEY_NAME, keyBase64)

  cachedKey = key
  return key
}

async function encryptField(plaintext: string, key: CryptoKey): Promise<EncryptedPayload> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(plaintext)

  const ciphertext = await crypto.subtle.encrypt(
    { name: CREDENTIAL_KEY_ALGORITHM, iv },
    key,
    encoded
  )

  return {
    ciphertext: btoa(Array.from(new Uint8Array(ciphertext), b => String.fromCharCode(b)).join('')),
    iv: btoa(Array.from(iv, b => String.fromCharCode(b)).join('')),
    version: 1,
  }
}

async function decryptField(payload: EncryptedPayload, key: CryptoKey): Promise<string> {
  const iv = Uint8Array.from(atob(payload.iv), c => c.charCodeAt(0))
  const ciphertext = Uint8Array.from(atob(payload.ciphertext), c => c.charCodeAt(0))

  const decrypted = await crypto.subtle.decrypt(
    { name: CREDENTIAL_KEY_ALGORITHM, iv },
    key,
    ciphertext
  )

  return new TextDecoder().decode(decrypted)
}

function isEncryptedPayload(value: unknown): value is EncryptedPayload {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as EncryptedPayload).ciphertext === 'string' &&
    typeof (value as EncryptedPayload).iv === 'string' &&
    typeof (value as EncryptedPayload).version === 'number'
  )
}

async function encryptCredentials(
  credentials: RithmicCredentialSet['credentials']
): Promise<Record<string, unknown>> {
  const key = await getOrCreateEncryptionKey()
  const [username, password] = await Promise.all([
    encryptField(credentials.username, key),
    encryptField(credentials.password, key),
  ])
  return { username, password }
}

async function decryptCredentials(
  encrypted: Record<string, unknown>
): Promise<RithmicCredentialSet['credentials'] | null> {
  try {
    const key = await getOrCreateEncryptionKey()

    if (isEncryptedPayload(encrypted.username) && isEncryptedPayload(encrypted.password)) {
      const [username, password] = await Promise.all([
        decryptField(encrypted.username as EncryptedPayload, key),
        decryptField(encrypted.password as EncryptedPayload, key),
      ])
      return { username, password, server_type: '', location: '' }
    }

    return null
  } catch {
    logger.warn('Failed to decrypt Rithmic credentials, key may have changed')
    return null
  }
}

export async function saveRithmicData(data: RithmicCredentialSet): Promise<void> {
  try {
    const existingData = await getAllRithmicData()
    const encryptedCredentials = await encryptCredentials(data.credentials)
    const updatedData = {
      ...existingData,
      [data.id]: {
        ...data,
        credentials: {
          ...data.credentials,
          username: encryptedCredentials.username,
          password: encryptedCredentials.password,
        },
        lastSyncTime: data.lastSyncTime || new Date().toISOString(),
      },
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData))
  } catch (error) {
    logger.error('Failed to save Rithmic data:', { error })
  }
}

export async function getRithmicData(id: string): Promise<RithmicCredentialSet | null> {
  try {
    const allData = await getAllRithmicData()
    const stored = allData[id]
    if (!stored) return null

    const decrypted = await decryptCredentials(stored.credentials as unknown as Record<string, unknown>)
    if (decrypted) {
      return {
        ...stored,
        credentials: { ...decrypted, server_type: stored.credentials.server_type, location: stored.credentials.location },
      }
    }

    return stored
  } catch (error) {
    logger.error('Failed to retrieve Rithmic data:', { error })
    return null
  }
}

export function isValidCredentialSet(data: unknown): data is RithmicCredentialSet {
  const d = data as Record<string, unknown>
  return (
    d != null &&
    typeof d.id === 'string' &&
    typeof d.credentials === 'object' &&
    d.credentials !== null &&
    typeof (d.credentials as Record<string, unknown>).username === 'string' &&
    typeof (d.credentials as Record<string, unknown>).password === 'string' &&
    typeof (d.credentials as Record<string, unknown>).server_type === 'string' &&
    typeof (d.credentials as Record<string, unknown>).location === 'string' &&
    Array.isArray(d.selectedAccounts) &&
    typeof d.lastSyncTime === 'string'
  )
}

export async function getAllRithmicData(): Promise<Record<string, RithmicCredentialSet>> {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return {}

    const parsedData = JSON.parse(data)
    const validatedData: Record<string, RithmicCredentialSet> = {}

    Object.entries(parsedData).forEach(([id, cred]) => {
      if (isValidCredentialSet(cred)) {
        validatedData[id] = cred
      }
    })

    return validatedData
  } catch (error) {
    logger.error('Failed to retrieve all Rithmic data:', { error })
    localStorage.removeItem(STORAGE_KEY)
    return {}
  }
}

export async function clearRithmicData(id?: string): Promise<void> {
  try {
    if (id) {
      const allData = await getAllRithmicData()
      delete allData[id]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allData))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch (error) {
    logger.error('Failed to clear Rithmic data:', { error })
  }
}

export async function updateLastSyncTime(id: string): Promise<void> {
  try {
    const data = await getRithmicData(id)
    if (data) {
      await saveRithmicData({
        ...data,
        lastSyncTime: new Date().toISOString(),
      })
    }
  } catch (error) {
    logger.error('Failed to update last sync time:', { error })
  }
}

export function generateCredentialId(username: string): string {
  if (!username) {
    return `cred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  return username
}
