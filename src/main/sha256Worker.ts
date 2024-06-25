const { parentPort, workerData } = require('worker_threads')
const fs = require('fs')
const crypto = require('crypto')
const stream = require('stream/promises')

export async function calculateSHA256(filepath) {
  const input = fs.createReadStream(filepath)
  const hash = crypto.createHash('sha256')

  // Connect the output of the `input` stream to the input of `hash`
  // and let Node.js do the streaming
  await stream.pipeline(input, hash)

  return hash.digest('hex')
}

// console.log('Worker starting for:', workerData.filePath) // Log when the worker starts

;(async () => {
  const newSha = await calculateSHA256(workerData.filePath)
  parentPort.postMessage({ newSha })

  // console.log('Worker finished for:', workerData.filePath) // Log when the worker finishes
})()
