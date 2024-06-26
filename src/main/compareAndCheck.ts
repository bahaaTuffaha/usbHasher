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
    worker.on('message', (newSha) => {
      resolve({ newSha, path: filepath }), onComplete(totalFiles, filepath)
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
  global.sharedData['percentage'] = Math.trunc(
    ((global.sharedData['index']++ / totalFiles) * 100) / 2
  )
}

async function detectChanges(files1, files2) {
  const map2 = new Map(files2.map((file) => [file.path, file]))
  const changes = []

  // Detect removals and modifications
  for (const file1 of files1) {
    const file2 = map2.get(file1.path)
    if (!file2) {
      changes.push({ ...file1, state: 'removed' })
    } else if (file1.oldSha !== file2.newSha) {
      const stats = await fs.promises.stat(file1.path)
      changes.push({
        ...file1,
        state: 'modified',
        newSha: file2.newSha,
        lastModified: stats.mtime
      })
    }
  }

  // Detect additions
  const map1 = new Map(files1.map((file) => [file.path, file]))
  for (const file2 of files2) {
    if (!map1.has(file2.path)) {
      const stats = await fs.promises.stat(file2.path)
      changes.push({
        ...file2,
        state: 'added',
        newSha: file2.newSha,
        lastModified: stats.mtime
      })
    }
  }

  return changes
}

export async function compareHashCodes(dir) {
  let files = await findInDir(dir)
  files = files.filter((file: string) => !file.includes('output.csv'))
  let results = []
  global.sharedData['percentage'] = 0
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
        //remove csv header
        results.shift()

        const changes = detectChanges(results, shaResult)
        resolve(changes)
      })
      .on('error', reject)
  })
}
