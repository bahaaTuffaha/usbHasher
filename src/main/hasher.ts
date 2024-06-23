import * as fs from 'fs'
import * as crypto from 'crypto'
import * as path from 'path'
import { createObjectCsvWriter } from 'csv-writer'
const stream = require('stream/promises')

function findInDir(dir, fileList = []) {
  const files = fs.readdirSync(dir)

  files.forEach((file) => {
    const filePath = path.join(dir, file)
    try {
      const fileStat = fs.lstatSync(filePath)

      if (fileStat.isDirectory()) {
        findInDir(filePath, fileList)
      } else {
        fileList.push(filePath)
      }
    } catch (e) {
      console.log(e)
    }
  })

  return fileList
}

// Function to calculate SHA256 hash
async function calculateSHA256(filepath) {
  const input = fs.createReadStream(filepath)
  const hash = crypto.createHash('sha256')

  // Connect the output of the `input` stream to the input of `hash`
  // and let Node.js do the streaming
  await stream.pipeline(input, hash)

  return hash.digest('hex')
}

// Function to write data to CSV
async function writeDataToCSV(data, outputPath) {
  console.log('data:' + data)
  const csvWriter = createObjectCsvWriter({
    path: outputPath,
    header: [
      { id: 'path', title: 'Path' },
      { id: 'sha256', title: 'SHA-256' }
    ]
  })

  await csvWriter.writeRecords(data)
  console.log('CSV file written successfully.')
}

// Main function to process directory
export async function processDirectory(dir, outputPath) {
  const files = await findInDir(dir)
  console.log(files)
  const data = await Promise.all(
    files.map(async (filePath) => ({
      path: filePath,
      sha256: await calculateSHA256(filePath)
    }))
  )
  await writeDataToCSV(data, outputPath)
}
