import { del, get, list, put } from '@vercel/blob'
import type { UploadSession, UploadedFile } from './types'

// The phone and kiosk call separate Vercel Functions. Blob is their shared
// mailbox; local memory is used only when running outside Vercel without a store.
const PREFIX = 'smart-print/qr/'
const SESSION_TTL_MS = 30 * 60 * 1000
const localSessions = new Map<string, UploadSession>()
const localFiles = new Map<string, UploadedFile>()

export class UploadStoreUnavailable extends Error {
  constructor() {
    super('Connect a private Vercel Blob store to enable QR uploads.')
  }
}

function useBlob(): boolean {
  if (process.env.BLOB_READ_WRITE_TOKEN || (process.env.VERCEL_OIDC_TOKEN && process.env.BLOB_STORE_ID)) return true
  if (process.env.VERCEL) throw new UploadStoreUnavailable()
  return false
}

function paths(sessionId: string) {
  const base = `${PREFIX}${sessionId}`
  return { session: `${base}/session.json`, file: `${base}/file.json` }
}

async function readBlob<T>(pathname: string): Promise<T | null> {
  const result = await get(pathname, { access: 'private', useCache: false })
  if (result?.statusCode !== 200 || !result.stream) return null
  return new Response(result.stream).json() as Promise<T>
}

async function writeBlob(pathname: string, value: unknown): Promise<void> {
  await put(pathname, JSON.stringify(value), {
    access: 'private',
    allowOverwrite: true,
    contentType: 'application/json',
  })
}

export async function registerUploadSession(input: {
  sessionId: string
  kioskName: string
  prefs: UploadSession['prefs']
}): Promise<UploadSession> {
  const existing = await getUploadSession(input.sessionId)
  const session: UploadSession = {
    ...input,
    status: 'waiting',
    createdAt: existing?.createdAt ?? Date.now(),
    expiresAt: Date.now() + SESSION_TTL_MS,
  }
  if (useBlob()) {
    await writeBlob(paths(input.sessionId).session, session)
  } else {
    localSessions.set(input.sessionId, session)
  }
  return session
}

export async function getUploadSession(sessionId: string): Promise<UploadSession | null> {
  const session = useBlob()
    ? await readBlob<UploadSession>(paths(sessionId).session)
    : localSessions.get(sessionId) ?? null
  if (!session) return null
  if (Date.now() >= session.expiresAt) {
    if (useBlob()) await del([paths(sessionId).session, paths(sessionId).file])
    else {
      localSessions.delete(sessionId)
      localFiles.delete(sessionId)
    }
    return null
  }
  return session
}

export async function setUploadedFile(sessionId: string, file: UploadedFile): Promise<boolean> {
  if (!await getUploadSession(sessionId)) return false
  if (useBlob()) await writeBlob(paths(sessionId).file, file)
  else localFiles.set(sessionId, file)
  return true
}

export async function getUploadedFile(sessionId: string): Promise<UploadedFile | null> {
  if (!await getUploadSession(sessionId)) return null
  return useBlob()
    ? readBlob<UploadedFile>(paths(sessionId).file)
    : localFiles.get(sessionId) ?? null
}

export async function clearUploadedFile(sessionId: string): Promise<void> {
  if (useBlob()) await del([paths(sessionId).session, paths(sessionId).file])
  else {
    localSessions.delete(sessionId)
    localFiles.delete(sessionId)
  }
}

// Removes abandoned demo sessions. Vercel runs this once a day.
export async function removeExpiredUploadBlobs(): Promise<number> {
  if (!useBlob()) return 0
  let cursor: string | undefined
  const expired: string[] = []
  do {
    const page = await list({ prefix: PREFIX, cursor, limit: 1000 })
    expired.push(...page.blobs
      .filter((blob) => Date.now() - blob.uploadedAt.getTime() >= SESSION_TTL_MS)
      .map((blob) => blob.pathname))
    cursor = page.hasMore ? page.cursor : undefined
  } while (cursor)
  for (let i = 0; i < expired.length; i += 100) {
    await del(expired.slice(i, i + 100))
  }
  return expired.length
}
