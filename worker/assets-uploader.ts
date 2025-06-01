/**
 * Asset uploader script for Cloudflare Workers KV
 * Uploads built assets to KV storage for edge serving
 */

import { promises as fs } from 'fs'
import path from 'path'

interface UploadOptions {
  kvNamespaceId: string
  apiToken: string
  accountId: string
  distDir: string
}

/**
 * Get all files recursively from a directory
 */
async function getAllFiles(
  dir: string,
  baseDir: string = dir
): Promise<string[]> {
  const files: string[] = []
  const entries = await fs.readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      const subFiles = await getAllFiles(fullPath, baseDir)
      files.push(...subFiles)
    } else {
      // Convert to URL path (use forward slashes)
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/')
      files.push(relativePath)
    }
  }

  return files
}

/**
 * Upload a file to Cloudflare KV
 */
async function uploadFile(
  filePath: string,
  content: Buffer,
  options: UploadOptions
): Promise<void> {
  const key = `asset:/${filePath}`
  const url = `https://api.cloudflare.com/client/v4/accounts/${options.accountId}/storage/kv/namespaces/${options.kvNamespaceId}/values/${encodeURIComponent(key)}`

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${options.apiToken}`,
      'Content-Type': 'application/octet-stream',
    },
    body: content,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Failed to upload ${filePath}: ${response.status} ${errorText}`
    )
  }

  console.log(`✓ Uploaded: ${filePath}`)
}

/**
 * Main upload function
 */
export async function uploadAssets(options: UploadOptions): Promise<void> {
  console.log('🚀 Starting asset upload to Cloudflare KV...')
  console.log(`📁 Source directory: ${options.distDir}`)

  try {
    // Check if dist directory exists
    await fs.access(options.distDir)
  } catch {
    throw new Error(`Distribution directory not found: ${options.distDir}`)
  }

  // Get all files
  const files = await getAllFiles(options.distDir)
  console.log(`📦 Found ${files.length} files to upload`)

  let uploaded = 0
  let failed = 0

  // Upload files with concurrency limit
  const concurrency = 5
  for (let i = 0; i < files.length; i += concurrency) {
    const batch = files.slice(i, i + concurrency)

    const batchPromises = batch.map(async (file) => {
      try {
        const fullPath = path.join(options.distDir, file)
        const content = await fs.readFile(fullPath)
        await uploadFile(file, content, options)
        uploaded++
      } catch (uploadError) {
        console.error(
          `❌ Failed to upload ${file}:`,
          (uploadError as Error).message
        )
        failed++
      }
    })

    await Promise.all(batchPromises)
  }

  console.log('\n📊 Upload Summary:')
  console.log(`✅ Successfully uploaded: ${uploaded} files`)
  console.log(`❌ Failed uploads: ${failed} files`)

  if (failed > 0) {
    throw new Error(`Upload completed with ${failed} failures`)
  }

  console.log('🎉 All assets uploaded successfully!')
}

// CLI runner
if (import.meta.url === `file://${process.argv[1]}`) {
  const options: UploadOptions = {
    kvNamespaceId: process.env.CLOUDFLARE_KV_NAMESPACE_ID || '',
    apiToken: process.env.CLOUDFLARE_API_TOKEN || '',
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID || '',
    distDir: process.env.DIST_DIR || './dist',
  }

  // Validate required environment variables
  if (!options.kvNamespaceId) {
    console.error(
      '❌ CLOUDFLARE_KV_NAMESPACE_ID environment variable is required'
    )
    process.exit(1)
  }

  if (!options.apiToken) {
    console.error('❌ CLOUDFLARE_API_TOKEN environment variable is required')
    process.exit(1)
  }

  if (!options.accountId) {
    console.error('❌ CLOUDFLARE_ACCOUNT_ID environment variable is required')
    process.exit(1)
  }

  uploadAssets(options)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('💥 Upload failed:', error.message)
      process.exit(1)
    })
}
