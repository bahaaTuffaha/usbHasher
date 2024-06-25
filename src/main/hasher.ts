import * as fs from 'fs'
import * as path from 'path'
import { createObjectCsvWriter } from 'csv-writer'
import { onComplete, runWorker } from './compareAndCheck'

export function findInDir(dir, fileList = []) {
  const files = fs.readdirSync(dir)

  files.forEach((file) => {
    const filePath = path.join(dir, file)
    try {
      const fileStat = fs.lstatSync(filePath)

      // Exclude "System Volume Information" directory
      if (fileStat.isDirectory() && file !== 'System Volume Information') {
        findInDir(filePath, fileList)
      } else {
        fileList.push(filePath)
      }
    } catch (e) {
      if (e.code !== 'EPERM') {
        console.log(e)
      }
    }
  })

  return fileList
}

// Function to calculate SHA256 hash

// Function to write data to CSV
async function writeDataToCSV(data, outputPath) {
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

export async function checkIfFileExists(filePath: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, function (err, stat) {
      if (err == null) {
        resolve(true)
      } else if (err.code === 'ENOENT') {
        // file does not exist
        resolve(false)
      } else {
        console.log('Some other error: ', err.code)
        resolve(false)
      }
    })
  })
}

// Main function to process directory
export async function processDirectory(dir, outputPath) {
  let files = await findInDir(dir)
  files = files.filter((file: string) => !file.includes('output.csv'))
  console.log(files)
  const workerPromises = files.map((filePath) => runWorker(filePath, files.length, onComplete))
  const shaResult = await Promise.all(workerPromises)

  const data = await Promise.all(
    files.map(async (filePath, index) => ({
      path: filePath,
      sha256: shaResult[index].newSha
    }))
  )
  await writeDataToCSV(data, outputPath)
}
