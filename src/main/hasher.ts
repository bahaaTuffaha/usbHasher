import * as fs from 'fs'
import * as path from 'path'
const { format } = require('@fast-csv/format')
import { onComplete, runWorker } from './compareAndCheck'
const child_process = require('child_process')

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

async function hideFile(filePath) {
  return new Promise((resolve, reject) => {
    if (process.platform === 'win32') {
      // Windows specific command to hide the file
      child_process.exec(`attrib +H "${filePath}"`, (err) => {
        if (err) {
          console.error('Error hiding file:', err)
          return reject(err)
        }
        console.log('File is hidden')
        resolve()
      })
    } else if (process.platform === 'darwin' || process.platform === 'linux') {
      // MacOS/Linux specific command to hide the file (dot prefix)
      const hiddenFilePath = path.join(path.dirname(filePath), `.${path.basename(filePath)}`)
      fs.rename(filePath, hiddenFilePath, (err) => {
        if (err) {
          console.error('Error hiding file:', err)
          return reject(err)
        }
        console.log('File is hidden')
        resolve()
      })
    } else {
      resolve()
    }
  })
}

// Function to write data to CSV
async function writeDataToCSV(data, outputPath) {
  return new Promise((resolve, reject) => {
    const writableStream = fs.createWriteStream(outputPath)

    writableStream.on('finish', async () => {
      console.log('CSV file written successfully.')

      // Hide the file
      await hideFile(outputPath)
      resolve()
    })

    writableStream.on('error', (e) => {
      reject(), console.log(e)
    })

    const csvStream = format({ headers: ['Path', 'SHA-256'] })
    csvStream
      .pipe(writableStream)
      .on('error', (e) => console.log(e))
      .on('finish', () => console.log(' csvStream done'))

    data.forEach((row) => {
      csvStream.write({
        Path: row.path,
        'SHA-256': row.newSha
      })
    })

    csvStream.end()
  })
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
  files = files.filter(
    (file: string) =>
      !file.includes('usbHasher.csv') &&
      !file.includes('.usbHasher.csv') &&
      !file.includes('System Volume Information')
  )
  global.sharedData['percentage'] = 0
  const workerPromises = files.map((filePath) => runWorker(dir, filePath, files.length, onComplete))
  const shaResult = await Promise.all(workerPromises)

  await writeDataToCSV(shaResult, outputPath)
}
