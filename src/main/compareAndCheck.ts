import { findInDir } from './hasher'
const { Worker } = require('worker_threads')
import * as fs from 'fs'
const csv = require('csv-parser')
import createWorker from './sha256Worker?nodeWorker'

export async function runWorker(
  filepath: string,
  totalFiles: number,
  onComplete: (result: any, filepath: any) => void
) {
  return new Promise((resolve, reject) => {
    const worker = createWorker({
      workerData: { filePath: filepath, totalFiles: totalFiles }
    })
    worker.on('message', (value) => {
      resolve(value), onComplete(totalFiles, filepath)
    })
    worker.on('error', reject)
    worker.on('exit', (code) => {
      // console.log(global.sharedData['percentage'])
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`))
      }
    })
  })
}
export function onComplete(totalFiles, filepath) {
  global.sharedData['percentage'] = (global.sharedData['index']++ / totalFiles) * 100
}
export async function compareHashCodes(dir) {
  let files = await findInDir(dir)
  files = files.filter((file: string) => !file.includes('output.csv'))
  const results = []
  console.log(files.length)
  const workerPromises = files.map((filePath) => runWorker(filePath, files.length, onComplete))
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
