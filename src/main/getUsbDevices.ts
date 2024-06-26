const { exec } = require('child_process')
const os = require('os')

export function getUSBDevices(): Promise<any[]> {
  return new Promise((resolve, reject) => {
    if (os.platform() !== 'win32') {
      const command = `df -Th | grep media`
      exec(command, (error, stdout) => {
        if (error) {
          reject(`exec error: ${error}`)
          return
        }

        const lines = stdout
          .trim()
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line.length > 0)

        const devices = lines.map((line) => {
          const values = line.split(/\s+/)
          return {
            deviceid: values[6],
            volumename: values[6].split('/').at(-1)
          }
        })
        resolve(devices)
      })
    } else {
      exec(
        'wmic logicaldisk where drivetype=2 get deviceid, volumename, description',
        (error, stdout) => {
          if (error) {
            reject(`exec error: ${error}`)
            return
          }
          // Split output into lines and filter out empty lines
          const lines = stdout
            .trim()
            ?.split('\n')
            .map((line) => line.trim())
            .filter((line) => line.length > 0)

          // Extract header line
          const header = lines
            .shift()
            ?.split(/\s{2,}/)
            .map((h) => h.trim().toLowerCase())

          // Parse each line into an object
          const devices = lines.map((line) => {
            const values = line.split(/\s{2,}/).map((value) => value.trim())
            const device = {}
            header.forEach((key, index) => {
              device[key] = values[index] || ''
            })
            return device
          })
          resolve(devices)
        }
      )
    }
  })
}
