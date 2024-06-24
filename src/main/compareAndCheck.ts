import { findInDir } from './hasher'
const { Worker } = require('worker_threads')
import * as fs from 'fs'
const csv = require('csv-parser')
import createWorker from './sha256Worker?nodeWorker'
import { compareDataType } from '@renderer/pages/HashingProcess'

export async function runWorker(filepath: string) {
  return new Promise((resolve, reject) => {
    const worker = createWorker({ workerData: { filePath: filepath } })
    worker.on('message', resolve)
    worker.on('error', reject)
    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`))
      }
    })
  })
}

export async function compareHashCodes(dir) {
  let files = await findInDir(dir)
  files = files.filter((file: string) => !file.includes('output.csv'))
  const results = []

  const workerPromises = files.map((filePath) => runWorker(filePath))
  // Wait for all worker promises to resolve before processing the CSV
  const shaResult = await Promise.all(workerPromises)

  return new Promise((resolve, reject) => {
    fs.createReadStream(`${dir}\\output.csv`)
      .pipe(csv(['path', 'sha256']))
      .on('data', async (row) => {
        const { path: filePath, sha256: oldSha } = row
        results.push({ path: filePath, oldSha })
      })
      .on('end', async () => {
        const filteredResults = []
        results.shift()
        // Loop through results and try to find corresponding newSha from shaResult
        for (let i = 0; i < results.length; i++) {
          const workerResult = results[i]
          const correspondingSha = shaResult[i] // Potentially undefined

          if (correspondingSha && correspondingSha.newSha !== workerResult.oldSha) {
            const stats = await fs.promises.stat(workerResult.path)
            filteredResults.push({
              ...workerResult,
              newSha: correspondingSha.newSha,
              lastModified: stats.mtime
            })
          }
        }
        resolve(filteredResults)
      })
      .on('error', reject)
  })
}
