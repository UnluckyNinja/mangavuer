export async function verifyPermission(fileHandle: any, withWrite = false) {
  const opts = {} as any
  if (withWrite)
    opts.mode = 'readwrite'

  // Check if we already have permission, if so, return true.
  if (await fileHandle.queryPermission(opts) === 'granted')
    return true

  // Request permission to the file, if the user grants permission, return true.
  if (await fileHandle.requestPermission(opts) === 'granted')
    return true

  // The user did not grant permission, return false.
  return false
}
