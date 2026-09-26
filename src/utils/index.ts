export async function verifyPermission(fileHandle: any, withWrite = false) {
  const opts = {} as any;
  if (withWrite) opts.mode = "readwrite";

  // Check if we already have permission, if so, return true.
  if ((await fileHandle.queryPermission(opts)) === "granted") return true;

  // Request permission to the file, if the user grants permission, return true.
  if ((await fileHandle.requestPermission(opts)) === "granted") return true;

  // The user did not grant permission, return false.
  return false;
}

export async function readDirectory(directory: FileSystemDirectoryEntry) {
  const dirReader = directory.createReader();
  const entries = [];

  while (true) {
    const results = await new Promise<FileSystemEntry[]>((resolve, reject) => {
      dirReader.readEntries(resolve, reject);
    });

    if (!results.length) {
      break;
    }

    for (const entry of results) {
      entries.push(entry);
    }
  }

  return entries;
}

export function fileAsPromise(entry: FileSystemFileEntry) {
  return new Promise<File>((resolve, reject) => {
    entry.file(resolve, reject);
  });
}
