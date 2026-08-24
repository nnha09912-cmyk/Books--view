// Local-folder filter/copy engine — runs entirely in the browser via the
// File System Access API (Chromium only; check isFileSystemAccessSupported()
// before use). Matching algorithm (basename match ignoring extension,
// case-insensitive; RAW/JPG extension sets) is ported 1:1 from the Books
// Filter desktop app's engine (src-tauri/src/filter.rs) per explicit request
// to reuse it directly inside Books View, keyed off each customer's real
// photo selection instead of a manually typed name list.

export type ExtMode = "all" | "jpg" | "raw" | "raw_jpg" | "custom";
export type ConflictMode = "skip" | "rename" | "overwrite";

const RAW_EXTS = new Set([
  "nef", "cr2", "cr3", "arw", "raf", "orf", "rw2", "dng", "pef", "srw",
  "x3f", "raw", "rwl", "nrw", "kdc", "dcr", "mrw", "3fr", "mef", "iiq", "gpr",
]);
const JPG_EXTS = new Set(["jpg", "jpeg", "jpe", "jfif"]);

export function isFileSystemAccessSupported(): boolean {
  return typeof window !== "undefined" && "showDirectoryPicker" in window;
}

function stemAndExt(name: string): { stem: string; ext: string } {
  const lower = name.toLowerCase();
  const dot = lower.lastIndexOf(".");
  if (dot <= 0) return { stem: lower, ext: "" };
  return { stem: lower.slice(0, dot), ext: lower.slice(dot + 1) };
}

/** Basename of a user/customer-supplied filename, extension stripped — the
 * same key used to index source files, so a name can be given with or
 * without its extension and still match. */
export function stemOnly(name: string): string {
  return stemAndExt(name).stem;
}

function allowedExts(mode: ExtMode, customExts: string[]): Set<string> | null {
  switch (mode) {
    case "all":
      return null;
    case "jpg":
      return JPG_EXTS;
    case "raw":
      return RAW_EXTS;
    case "raw_jpg":
      return new Set([...JPG_EXTS, ...RAW_EXTS]);
    case "custom":
      return new Set(
        customExts
          .map((e) => e.trim().replace(/^\./, "").toLowerCase())
          .filter(Boolean)
      );
  }
}

export interface FileEntry {
  handle: FileSystemFileHandle;
  name: string;
  relPath: string;
}

async function* walkDirectory(
  dir: FileSystemDirectoryHandle,
  recursive: boolean,
  prefix = ""
): AsyncGenerator<FileEntry> {
  for await (const handle of dir.values()) {
    if (handle.kind === "file") {
      const fh = handle as FileSystemFileHandle;
      yield { handle: fh, name: fh.name, relPath: prefix + fh.name };
    } else if (recursive) {
      const dh = handle as FileSystemDirectoryHandle;
      yield* walkDirectory(dh, recursive, `${prefix}${dh.name}/`);
    }
  }
}

/** Scans a directory once and groups files by lowercase basename (extension
 * stripped). Used both by the Sync feature (upload) and the Filter feature
 * (local copy) to gather image files. */
export async function buildSourceIndex(
  source: FileSystemDirectoryHandle,
  recursive: boolean,
  extMode: ExtMode,
  customExts: string[] = [],
  onProgress?: (scanned: number) => void
): Promise<{ index: Map<string, FileEntry[]>; errors: string[] }> {
  const allowed = allowedExts(extMode, customExts);
  const extOk = (ext: string) => (allowed === null ? true : allowed.has(ext));
  const index = new Map<string, FileEntry[]>();
  const errors: string[] = [];
  let scanned = 0;
  try {
    for await (const entry of walkDirectory(source, recursive)) {
      const { stem, ext } = stemAndExt(entry.name);
      if (extOk(ext)) {
        const list = index.get(stem);
        if (list) list.push(entry);
        else index.set(stem, [entry]);
      }
      scanned++;
      if (scanned % 25 === 0) onProgress?.(scanned);
    }
  } catch (e) {
    errors.push(`Lỗi đọc thư mục nguồn: ${String(e)}`);
  }
  onProgress?.(scanned);
  return { index, errors };
}

export function sanitizeFolderName(name: string): string {
  return name.trim().replace(/[\\/:*?"<>|]+/g, "_").replace(/\s+/g, " ") || "khach";
}

async function dirHasFile(dir: FileSystemDirectoryHandle, name: string): Promise<boolean> {
  try {
    await dir.getFileHandle(name);
    return true;
  } catch {
    return false;
  }
}

async function uniqueDestName(dir: FileSystemDirectoryHandle, fileName: string): Promise<string> {
  if (!(await dirHasFile(dir, fileName))) return fileName;
  const dot = fileName.lastIndexOf(".");
  const stem = dot > 0 ? fileName.slice(0, dot) : fileName;
  const ext = dot > 0 ? fileName.slice(dot) : "";
  let i = 1;
  while (await dirHasFile(dir, `${stem}_${i}${ext}`)) i++;
  return `${stem}_${i}${ext}`;
}

interface CopiedFile {
  fileName: string;
  action: "copied" | "renamed" | "overwritten" | "skipped";
  size: number;
}

async function copyFileEntry(
  entry: FileEntry,
  destDir: FileSystemDirectoryHandle,
  conflict: ConflictMode
): Promise<CopiedFile> {
  const file = await entry.handle.getFile();
  let targetName = entry.name;
  let action: CopiedFile["action"] = "copied";

  if (await dirHasFile(destDir, targetName)) {
    if (conflict === "skip") {
      return { action: "skipped", fileName: targetName, size: file.size };
    }
    if (conflict === "overwrite") {
      action = "overwritten";
    } else {
      targetName = await uniqueDestName(destDir, targetName);
      action = "renamed";
    }
  }

  const fh = await destDir.getFileHandle(targetName, { create: true });
  const writable = await fh.createWritable();
  await writable.write(file);
  await writable.close();
  return { action, fileName: targetName, size: file.size };
}

export interface CustomerFilterInput {
  name: string;
  phone: string | null;
  filenames: string[];
}

export interface CustomerFilterResult {
  name: string;
  phone: string | null;
  destDirName: string;
  requested: number;
  matched: number;
  copied: number;
  skipped: number;
  totalBytes: number;
  notFound: string[];
  copiedFiles: CopiedFile[];
}

export interface CustomerPreview {
  name: string;
  phone: string | null;
  requested: number;
  matched: number;
  notFound: string[];
}

/** "Dò khớp trước" — matches each customer's requested filenames against the
 * scanned source index without touching the destination at all (no folders
 * created, no files copied). Lets the studio review what will happen before
 * committing to the actual copy. */
export function previewMultiUserFilter(
  index: Map<string, FileEntry[]>,
  customers: CustomerFilterInput[]
): CustomerPreview[] {
  return customers.map((c) => {
    const wantedStems = Array.from(new Set(c.filenames.map(stemOnly)));
    const notFound = wantedStems.filter((s) => !index.has(s));
    return {
      name: c.name,
      phone: c.phone,
      requested: wantedStems.length,
      matched: wantedStems.length - notFound.length,
      notFound,
    };
  });
}

/** Runs the filter+copy for each customer independently against the same
 * source index, into its own subfolder under destRoot. A filename selected
 * by multiple customers is copied into each of their folders — no
 * deduplication across customers (event/yearbook albums rely on this). */
export async function runMultiUserFilter(
  index: Map<string, FileEntry[]>,
  customers: CustomerFilterInput[],
  destRoot: FileSystemDirectoryHandle,
  conflict: ConflictMode,
  onProgress?: (customerIndex: number, customerTotal: number, fileDone: number, fileTotal: number) => void
): Promise<CustomerFilterResult[]> {
  const results: CustomerFilterResult[] = [];

  for (let ci = 0; ci < customers.length; ci++) {
    const c = customers[ci];
    const destDirName = sanitizeFolderName(c.phone ? `${c.name}_${c.phone}` : c.name);
    const destDir = await destRoot.getDirectoryHandle(destDirName, { create: true });

    const wantedStems = Array.from(new Set(c.filenames.map(stemOnly)));
    const notFound = wantedStems.filter((s) => !index.has(s));
    const matches: FileEntry[] = [];
    for (const stem of wantedStems) {
      const entries = index.get(stem);
      if (entries) matches.push(...entries);
    }

    let copied = 0;
    let skipped = 0;
    let totalBytes = 0;
    const copiedFiles: CopiedFile[] = [];

    for (let fi = 0; fi < matches.length; fi++) {
      const r = await copyFileEntry(matches[fi], destDir, conflict);
      if (r.action === "skipped") skipped++;
      else {
        copied++;
        totalBytes += r.size;
      }
      copiedFiles.push(r);
      onProgress?.(ci, customers.length, fi + 1, matches.length);
    }
    if (matches.length === 0) onProgress?.(ci, customers.length, 0, 0);

    results.push({
      name: c.name,
      phone: c.phone,
      destDirName,
      requested: wantedStems.length,
      matched: wantedStems.length - notFound.length,
      copied,
      skipped,
      totalBytes,
      notFound,
      copiedFiles,
    });
  }

  return results;
}

export interface SinglePreview {
  requested: number;
  matched: number;
  notFound: string[];
}

/** "Lọc Tên" dò khớp — a flat, single name list (pasted in, not tied to any
 * customer) matched against the source index. No destination touched. */
export function previewSingleFilter(index: Map<string, FileEntry[]>, names: string[]): SinglePreview {
  const wantedStems = Array.from(new Set(names.map(stemOnly)));
  const notFound = wantedStems.filter((s) => !index.has(s));
  return {
    requested: wantedStems.length,
    matched: wantedStems.length - notFound.length,
    notFound,
  };
}

export interface SingleFilterResult {
  requested: number;
  matched: number;
  copied: number;
  skipped: number;
  totalBytes: number;
  notFound: string[];
  copiedFiles: CopiedFile[];
}

/** "Lọc Tên" copy — matches a flat pasted name list and copies straight into
 * destDir itself (no per-customer subfolder, unlike runMultiUserFilter). */
export async function runSingleFilter(
  index: Map<string, FileEntry[]>,
  names: string[],
  destDir: FileSystemDirectoryHandle,
  conflict: ConflictMode,
  onProgress?: (fileDone: number, fileTotal: number) => void
): Promise<SingleFilterResult> {
  const wantedStems = Array.from(new Set(names.map(stemOnly)));
  const notFound = wantedStems.filter((s) => !index.has(s));
  const matches: FileEntry[] = [];
  for (const stem of wantedStems) {
    const entries = index.get(stem);
    if (entries) matches.push(...entries);
  }

  let copied = 0;
  let skipped = 0;
  let totalBytes = 0;
  const copiedFiles: CopiedFile[] = [];

  for (let i = 0; i < matches.length; i++) {
    const r = await copyFileEntry(matches[i], destDir, conflict);
    if (r.action === "skipped") skipped++;
    else {
      copied++;
      totalBytes += r.size;
    }
    copiedFiles.push(r);
    onProgress?.(i + 1, matches.length);
  }

  return {
    requested: wantedStems.length,
    matched: wantedStems.length - notFound.length,
    copied,
    skipped,
    totalBytes,
    notFound,
    copiedFiles,
  };
}

export function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let v = bytes / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(1)} ${units[i]}`;
}

export function buildMultiUserReport(results: CustomerFilterResult[]): string {
  const lines: string[] = [];
  lines.push("=== BÁO CÁO LỌC ẢNH — Books View ===");
  const totalCopied = results.reduce((s, r) => s + r.copied, 0);
  const totalBytes = results.reduce((s, r) => s + r.totalBytes, 0);
  lines.push(`Tổng: ${results.length} khách, ${totalCopied} ảnh (${humanSize(totalBytes)})`);
  lines.push("");
  for (const r of results) {
    lines.push(`--- ${r.name}${r.phone ? " · " + r.phone : ""} → ${r.destDirName} ---`);
    lines.push(`Yêu cầu: ${r.requested} | Khớp: ${r.matched} | Đã chép: ${r.copied} | Bỏ qua: ${r.skipped}`);
    if (r.notFound.length) lines.push(`Không tìm thấy: ${r.notFound.join(", ")}`);
    lines.push("");
  }
  return lines.join("\n");
}

export function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
