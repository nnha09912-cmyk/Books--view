"use client";

import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { Users, Download, FolderOpen, Search, Play, Type, FileJson, Upload } from "lucide-react";
import { AdminShell } from "@/components/layout/admin-shell";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useStudio } from "@/lib/use-studio";
import { api } from "@/lib/api-client";
import type { AlbumSummary, AlbumDetail, AlbumCustomer } from "@/lib/types";
import {
  isFileSystemAccessSupported,
  buildSourceIndex,
  previewMultiUserFilter,
  runMultiUserFilter,
  previewSingleFilter,
  runSingleFilter,
  downloadTextFile,
  humanSize,
  type ExtMode,
  type ConflictMode,
  type CustomerPreview,
  type CustomerFilterResult,
  type CustomerFilterInput,
  type SinglePreview,
  type SingleFilterResult,
} from "@/lib/fs-filter";

/** Fallback exchange format for the separate Books Filter desktop app, for
 * browsers without File System Access (Chromium-only) — same shape a "Lọc
 * JSON" import expects. */
interface SelectionExport {
  album: string;
  exportedAt: string;
  customers: { name: string; phone: string | null; filenames: string[] }[];
}

type FilterTab = "album" | "name" | "json";

/** Customers can share the exact same name (name+phone "login" has no
 * uniqueness check) — append " A" / " B" / " C"… to duplicates so the list,
 * preview, and results stay visually distinguishable. Display-only; the
 * underlying name (and the phone-suffixed folder name) is unaffected. */
function dedupeNames<T extends { name: string }>(items: T[]): string[] {
  const counts = new Map<string, number>();
  for (const it of items) counts.set(it.name, (counts.get(it.name) ?? 0) + 1);
  const seen = new Map<string, number>();
  return items.map((it) => {
    const total = counts.get(it.name)!;
    if (total <= 1) return it.name;
    const idx = seen.get(it.name) ?? 0;
    seen.set(it.name, idx + 1);
    return `${it.name} ${String.fromCharCode(65 + idx)}`;
  });
}

function StatCard({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="card" style={{ flex: 1, textAlign: "center", padding: "12px 8px" }}>
      <div className="text-xs text-secondary" style={{ fontWeight: 600, letterSpacing: 0.4 }}>
        {label.toUpperCase()}
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.3 }}>{value}</div>
      <div className="text-xs text-secondary">{unit}</div>
    </div>
  );
}

function ProgressBar({ text, pct }: { text: string; pct: number }) {
  return (
    <div className="mt-sm">
      <div className="text-sm text-secondary">{text}</div>
      <div style={{ height: 6, borderRadius: 999, background: "var(--muted)", marginTop: 4, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: "var(--accent)",
            transition: "width .15s linear",
          }}
        />
      </div>
    </div>
  );
}

function buildMultiReportLines(results: CustomerFilterResult[]): string[] {
  const lines: string[] = ["=== BÁO CÁO LỌC ẢNH — Books View ==="];
  for (const r of results) {
    lines.push("");
    lines.push(`--- ${r.name}${r.phone ? " · " + r.phone : ""} → ${r.destDirName} ---`);
    lines.push(`Yêu cầu: ${r.requested} | Khớp: ${r.matched} | Đã copy: ${r.copied}`);
    for (const f of r.copiedFiles.filter((f) => f.action !== "skipped")) {
      lines.push(`  ✓ ${f.fileName}`);
    }
    for (const name of r.notFound) {
      lines.push(`  ✗ ${name} → Không tìm thấy`);
    }
    for (const f of r.copiedFiles.filter((f) => f.action === "skipped")) {
      lines.push(`  ✗ ${f.fileName} → File đã tồn tại`);
    }
  }
  return lines;
}

/** Shared per-customer result block, used by both "Lọc Album" and "Lọc JSON"
 * (identical rendering — only where the customer list comes from differs). */
function MultiResultList({ results }: { results: CustomerFilterResult[] }) {
  const resultDaCopy = results.reduce((s, r) => s + r.copied, 0);
  const resultBoQua = results.reduce(
    (s, r) => s + r.notFound.length + r.copiedFiles.filter((f) => f.action === "skipped").length,
    0
  );
  return (
    <div className="mt-md">
      <div style={{ display: "flex", gap: 8 }}>
        <StatCard label="Đã Copy" value={resultDaCopy} unit="ảnh" />
        <StatCard label="Bỏ Qua" value={resultBoQua} unit="ảnh" />
      </div>
      <div className="mt-sm" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {results.map((r) => {
          const copiedFiles = r.copiedFiles.filter((f) => f.action !== "skipped");
          const skippedExisting = r.copiedFiles.filter((f) => f.action === "skipped");
          return (
            <div key={r.destDirName + r.name} className="text-sm" style={{ borderTop: "1px solid var(--border)", paddingTop: 8 }}>
              <strong>{r.name}</strong>
              {r.phone ? ` · ${r.phone}` : ""} → <code className="mono">{r.destDirName}</code>
              <br />
              <span className="text-secondary">
                {r.copied} ảnh đã chép ({humanSize(r.totalBytes)})
              </span>
              {copiedFiles.length > 0 && (
                <div className="mt-xs text-xs" style={{ color: "var(--success, #2f9e44)" }}>
                  {copiedFiles.map((f) => (
                    <div key={f.fileName}>✓ {f.fileName}</div>
                  ))}
                </div>
              )}
              {(r.notFound.length > 0 || skippedExisting.length > 0) && (
                <div className="mt-xs text-xs" style={{ color: "var(--destructive)" }}>
                  {r.notFound.map((name) => (
                    <div key={name}>✗ {name} → Không tìm thấy</div>
                  ))}
                  {skippedExisting.map((f) => (
                    <div key={f.fileName}>✗ {f.fileName} → File đã tồn tại</div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MultiPreviewList({ preview }: { preview: CustomerPreview[] }) {
  const fileKhop = preview.reduce((s, p) => s + p.matched, 0);
  const khongKhop = preview.reduce((s, p) => s + p.notFound.length, 0);
  return (
    <div className="mt-md">
      <div style={{ display: "flex", gap: 8 }}>
        <StatCard label="File khớp" value={fileKhop} unit="ảnh" />
        <StatCard label="Khách hàng" value={preview.length} unit="người" />
        <StatCard label="Không khớp" value={khongKhop} unit="ảnh" />
      </div>
      <div className="mt-sm" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {preview.map((p, i) => (
          <div key={p.name + (p.phone ?? "") + i} className="text-sm" style={{ borderTop: "1px solid var(--border)", paddingTop: 6 }}>
            <strong>{p.name}</strong>
            {p.phone ? <span className="text-secondary"> · {p.phone}</span> : null}{" "}
            <span className="text-secondary">
              — {p.requested} ảnh · {p.matched} khớp
              {p.notFound.length ? ` · ${p.notFound.length} không tìm thấy` : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FilterPage() {
  const { studio, loading: studioLoading } = useStudio();

  const [albums, setAlbums] = useState<AlbumSummary[] | null>(null);
  const [albumSearch, setAlbumSearch] = useState("");
  const [albumId, setAlbumId] = useState("");
  const [album, setAlbum] = useState<AlbumDetail | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastClickedIndex, setLastClickedIndex] = useState<number | null>(null);

  const fsSupported = isFileSystemAccessSupported();
  const [activeTab, setActiveTab] = useState<FilterTab>("album");

  // Shared by all 3 tabs — one source folder, one destination folder, one set
  // of matching options.
  const [sourceDir, setSourceDir] = useState<FileSystemDirectoryHandle | null>(null);
  const [sourceName, setSourceName] = useState("");
  const [destDir, setDestDir] = useState<FileSystemDirectoryHandle | null>(null);
  const [destName, setDestName] = useState("");
  const [recursive, setRecursive] = useState(true);
  const [extMode, setExtMode] = useState<ExtMode>("all");
  const [customExt, setCustomExt] = useState("");
  const [conflict, setConflict] = useState<ConflictMode>("rename");

  // Tab 1 — Lọc Album (Selection Manager driven)
  const [previewing, setPreviewing] = useState(false);
  const [preview, setPreview] = useState<CustomerPreview[] | null>(null);
  const [running, setRunning] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [progressPct, setProgressPct] = useState(0);
  const [results, setResults] = useState<CustomerFilterResult[] | null>(null);

  // Tab 2 — Lọc Tên (pasted flat name list, copies straight into destDir)
  const [nameListText, setNameListText] = useState("");
  const [namePreviewing, setNamePreviewing] = useState(false);
  const [namePreview, setNamePreview] = useState<SinglePreview | null>(null);
  const [nameRunning, setNameRunning] = useState(false);
  const [nameProgressText, setNameProgressText] = useState("");
  const [nameProgressPct, setNameProgressPct] = useState(0);
  const [nameResult, setNameResult] = useState<SingleFilterResult | null>(null);

  // Tab 3 — Lọc JSON (imported selection export, same engine as Lọc Album)
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const [jsonFileName, setJsonFileName] = useState("");
  const [jsonAlbumLabel, setJsonAlbumLabel] = useState("");
  const [jsonCustomers, setJsonCustomers] = useState<CustomerFilterInput[] | null>(null);
  const [jsonPreviewing, setJsonPreviewing] = useState(false);
  const [jsonPreview, setJsonPreview] = useState<CustomerPreview[] | null>(null);
  const [jsonRunning, setJsonRunning] = useState(false);
  const [jsonProgressText, setJsonProgressText] = useState("");
  const [jsonProgressPct, setJsonProgressPct] = useState(0);
  const [jsonResults, setJsonResults] = useState<CustomerFilterResult[] | null>(null);

  useEffect(() => {
    if (!studio) return;
    api<{ data: AlbumSummary[] }>("/api/albums").then((res) => setAlbums(res.data));
  }, [studio]);

  useEffect(() => {
    if (!albumId) {
      setAlbum(null);
      return;
    }
    api<AlbumDetail>(`/api/albums/${albumId}`).then((a) => {
      setAlbum(a);
      const withSelections = a.customers.filter((c) => c.selectedFilenames.length > 0);
      // Wedding-style albums (studio password set) are almost always a single
      // customer — pre-select them. Event/yearbook albums (many customers)
      // start empty so the studio picks explicitly.
      setSelectedIds(a.passwordProtected ? new Set(withSelections.map((c) => c.id)) : new Set());
      setLastClickedIndex(null);
      setPreview(null);
      setResults(null);
    });
  }, [albumId]);

  if (studioLoading || !studio) return null;

  const filteredAlbums =
    albums?.filter((a) => a.name.toLowerCase().includes(albumSearch.trim().toLowerCase())) ?? null;

  const customers = album?.customers.filter((c) => c.selectedFilenames.length > 0) ?? [];
  const targets: AlbumCustomer[] = customers.filter((c) => selectedIds.has(c.id));
  const targetPhotoCount = targets.reduce((s, c) => s + c.selectedFilenames.length, 0);
  const customerDisplayNames = dedupeNames(customers);
  const parsedNameList = nameListText.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);

  function handleCustomerClick(e: React.MouseEvent, index: number, id: string) {
    if (e.shiftKey && lastClickedIndex !== null) {
      const [start, end] = lastClickedIndex < index ? [lastClickedIndex, index] : [index, lastClickedIndex];
      setSelectedIds((prev) => {
        const next = new Set(prev);
        for (let i = start; i <= end; i++) next.add(customers[i].id);
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    }
    setLastClickedIndex(index);
  }

  function selectAll() {
    setSelectedIds(new Set(customers.map((c) => c.id)));
  }
  function clearSelection() {
    setSelectedIds(new Set());
  }

  function exportSelection() {
    if (!album) return;
    if (targets.length === 0) {
      toast.error("Chưa chọn khách nào để xuất.");
      return;
    }
    const payload: SelectionExport = {
      album: album.name,
      exportedAt: new Date().toISOString(),
      customers: targets.map((c) => ({ name: c.name, phone: c.phone, filenames: c.selectedFilenames })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${album.linkToken}-lua-chon.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast(`Đã xuất lựa chọn của ${targets.length} khách — mở file này trong Books Filter.`);
  }

  async function pickSource() {
    try {
      const handle = await window.showDirectoryPicker();
      setSourceDir(handle);
      setSourceName(handle.name);
      setPreview(null);
      setResults(null);
      setNamePreview(null);
      setNameResult(null);
      setJsonPreview(null);
      setJsonResults(null);
    } catch {
      /* user cancelled */
    }
  }
  async function pickDest() {
    try {
      const handle = await window.showDirectoryPicker();
      setDestDir(handle);
      setDestName(handle.name);
    } catch {
      /* user cancelled */
    }
  }

  function customExtList() {
    return customExt.split(/[,\s]+/).map((s) => s.trim()).filter(Boolean);
  }

  // ---------- Tab 1: Lọc Album ----------
  async function runPreview() {
    if (!sourceDir) {
      toast.error("Chưa chọn thư mục ảnh gốc.");
      return;
    }
    if (targets.length === 0) {
      toast.error("Chưa chọn khách nào để dò khớp.");
      return;
    }
    setPreviewing(true);
    setPreview(null);
    setResults(null);
    setProgressText("Đang quét thư mục nguồn…");
    setProgressPct(0);
    try {
      const { index, errors } = await buildSourceIndex(
        sourceDir,
        recursive,
        extMode,
        customExtList(),
        (scanned) => setProgressText(`Đang quét thư mục nguồn… (${scanned} file)`)
      );
      if (errors.length) toast.error(errors.join(" "));
      const p = previewMultiUserFilter(
        index,
        targets.map((c) => ({ name: c.name, phone: c.phone, filenames: c.selectedFilenames }))
      );
      setPreview(p);
      setProgressPct(100);
    } catch (e) {
      toast.error(`Lỗi khi dò khớp: ${String(e)}`);
    } finally {
      setPreviewing(false);
    }
  }

  async function runFilter() {
    if (!sourceDir || !destDir) {
      toast.error("Chưa chọn thư mục nguồn hoặc thư mục lưu.");
      return;
    }
    if (targets.length === 0) {
      toast.error("Chưa chọn khách nào để lọc.");
      return;
    }
    setRunning(true);
    setResults(null);
    setProgressText("Đang quét thư mục nguồn…");
    setProgressPct(0);
    try {
      const { index, errors } = await buildSourceIndex(
        sourceDir,
        recursive,
        extMode,
        customExtList(),
        (scanned) => setProgressText(`Đang quét thư mục nguồn… (${scanned} file)`)
      );
      if (errors.length) toast.error(errors.join(" "));

      const res = await runMultiUserFilter(
        index,
        targets.map((c) => ({ name: c.name, phone: c.phone, filenames: c.selectedFilenames })),
        destDir,
        conflict,
        (ci, cTotal, fDone, fTotal) => {
          const overall = Math.round(((ci + (fTotal ? fDone / Math.max(fTotal, 1) : 1)) / cTotal) * 100);
          setProgressPct(overall);
          setProgressText(`${ci + 1}/${cTotal}: ${targets[ci].name} — ${fDone}/${fTotal || 0} ảnh`);
        }
      );
      setResults(res);
      const totalCopied = res.reduce((s, r) => s + r.copied, 0);
      const totalBytes = res.reduce((s, r) => s + r.totalBytes, 0);
      toast(`Hoàn tất ${res.length} khách — đã chép ${totalCopied} ảnh (${humanSize(totalBytes)}).`);
    } catch (e) {
      toast.error(`Lỗi khi lọc & copy: ${String(e)}`);
    } finally {
      setRunning(false);
      setProgressPct(100);
    }
  }

  function exportReport() {
    if (!results) return;
    downloadTextFile("bao-cao-loc-anh.txt", buildMultiReportLines(results).join("\n"));
  }

  // ---------- Tab 2: Lọc Tên ----------
  async function runNamePreview() {
    if (!sourceDir) {
      toast.error("Chưa chọn thư mục ảnh gốc.");
      return;
    }
    if (parsedNameList.length === 0) {
      toast.error("Chưa dán danh sách tên ảnh.");
      return;
    }
    setNamePreviewing(true);
    setNamePreview(null);
    setNameResult(null);
    setNameProgressText("Đang quét thư mục nguồn…");
    setNameProgressPct(0);
    try {
      const { index, errors } = await buildSourceIndex(
        sourceDir,
        recursive,
        extMode,
        customExtList(),
        (scanned) => setNameProgressText(`Đang quét thư mục nguồn… (${scanned} file)`)
      );
      if (errors.length) toast.error(errors.join(" "));
      setNamePreview(previewSingleFilter(index, parsedNameList));
      setNameProgressPct(100);
    } catch (e) {
      toast.error(`Lỗi khi dò khớp: ${String(e)}`);
    } finally {
      setNamePreviewing(false);
    }
  }

  async function runNameFilter() {
    if (!sourceDir || !destDir) {
      toast.error("Chưa chọn thư mục nguồn hoặc thư mục lưu.");
      return;
    }
    if (parsedNameList.length === 0) {
      toast.error("Chưa dán danh sách tên ảnh.");
      return;
    }
    setNameRunning(true);
    setNameResult(null);
    setNameProgressText("Đang quét thư mục nguồn…");
    setNameProgressPct(0);
    try {
      const { index, errors } = await buildSourceIndex(
        sourceDir,
        recursive,
        extMode,
        customExtList(),
        (scanned) => setNameProgressText(`Đang quét thư mục nguồn… (${scanned} file)`)
      );
      if (errors.length) toast.error(errors.join(" "));
      const res = await runSingleFilter(index, parsedNameList, destDir, conflict, (done, total) => {
        setNameProgressPct(total ? Math.round((done / total) * 100) : 100);
        setNameProgressText(`Đang chép ${done}/${total || 0} ảnh`);
      });
      setNameResult(res);
      toast(`Hoàn tất — đã chép ${res.copied} ảnh (${humanSize(res.totalBytes)}).`);
    } catch (e) {
      toast.error(`Lỗi khi lọc & copy: ${String(e)}`);
    } finally {
      setNameRunning(false);
      setNameProgressPct(100);
    }
  }

  function exportNameReport() {
    if (!nameResult) return;
    const lines = ["=== BÁO CÁO LỌC ẢNH (Lọc Tên) — Books View ===", ""];
    lines.push(`Yêu cầu: ${nameResult.requested} | Khớp: ${nameResult.matched} | Đã copy: ${nameResult.copied}`);
    for (const f of nameResult.copiedFiles.filter((f) => f.action !== "skipped")) lines.push(`  ✓ ${f.fileName}`);
    for (const n of nameResult.notFound) lines.push(`  ✗ ${n} → Không tìm thấy`);
    for (const f of nameResult.copiedFiles.filter((f) => f.action === "skipped")) lines.push(`  ✗ ${f.fileName} → File đã tồn tại`);
    downloadTextFile("bao-cao-loc-ten.txt", lines.join("\n"));
  }

  // ---------- Tab 3: Lọc JSON ----------
  async function handleJsonFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as SelectionExport;
      if (!parsed || !Array.isArray(parsed.customers)) {
        throw new Error("File không đúng định dạng (thiếu customers).");
      }
      setJsonFileName(file.name);
      setJsonAlbumLabel(parsed.album ?? "");
      setJsonCustomers(
        parsed.customers.map((c) => ({ name: c.name, phone: c.phone, filenames: c.filenames }))
      );
      setJsonPreview(null);
      setJsonResults(null);
      toast(`Đã nhập ${parsed.customers.length} khách từ "${file.name}".`);
    } catch (err) {
      toast.error(`Không đọc được file .json: ${String(err)}`);
    }
  }

  async function runJsonPreview() {
    if (!sourceDir) {
      toast.error("Chưa chọn thư mục ảnh gốc.");
      return;
    }
    if (!jsonCustomers || jsonCustomers.length === 0) {
      toast.error("Chưa nhập file .json.");
      return;
    }
    setJsonPreviewing(true);
    setJsonPreview(null);
    setJsonResults(null);
    setJsonProgressText("Đang quét thư mục nguồn…");
    setJsonProgressPct(0);
    try {
      const { index, errors } = await buildSourceIndex(
        sourceDir,
        recursive,
        extMode,
        customExtList(),
        (scanned) => setJsonProgressText(`Đang quét thư mục nguồn… (${scanned} file)`)
      );
      if (errors.length) toast.error(errors.join(" "));
      setJsonPreview(previewMultiUserFilter(index, jsonCustomers));
      setJsonProgressPct(100);
    } catch (e) {
      toast.error(`Lỗi khi dò khớp: ${String(e)}`);
    } finally {
      setJsonPreviewing(false);
    }
  }

  async function runJsonFilter() {
    if (!sourceDir || !destDir) {
      toast.error("Chưa chọn thư mục nguồn hoặc thư mục lưu.");
      return;
    }
    if (!jsonCustomers || jsonCustomers.length === 0) {
      toast.error("Chưa nhập file .json.");
      return;
    }
    setJsonRunning(true);
    setJsonResults(null);
    setJsonProgressText("Đang quét thư mục nguồn…");
    setJsonProgressPct(0);
    try {
      const { index, errors } = await buildSourceIndex(
        sourceDir,
        recursive,
        extMode,
        customExtList(),
        (scanned) => setJsonProgressText(`Đang quét thư mục nguồn… (${scanned} file)`)
      );
      if (errors.length) toast.error(errors.join(" "));
      const list = jsonCustomers;
      const res = await runMultiUserFilter(index, list, destDir, conflict, (ci, cTotal, fDone, fTotal) => {
        const overall = Math.round(((ci + (fTotal ? fDone / Math.max(fTotal, 1) : 1)) / cTotal) * 100);
        setJsonProgressPct(overall);
        setJsonProgressText(`${ci + 1}/${cTotal}: ${list[ci].name} — ${fDone}/${fTotal || 0} ảnh`);
      });
      setJsonResults(res);
      const totalCopied = res.reduce((s, r) => s + r.copied, 0);
      const totalBytes = res.reduce((s, r) => s + r.totalBytes, 0);
      toast(`Hoàn tất ${res.length} khách — đã chép ${totalCopied} ảnh (${humanSize(totalBytes)}).`);
    } catch (e) {
      toast.error(`Lỗi khi lọc & copy: ${String(e)}`);
    } finally {
      setJsonRunning(false);
      setJsonProgressPct(100);
    }
  }

  function exportJsonReport() {
    if (!jsonResults) return;
    downloadTextFile("bao-cao-loc-json.txt", buildMultiReportLines(jsonResults).join("\n"));
  }

  return (
    <AdminShell>
      <h1 className="mb-lg">Filter — Lọc &amp; Copy ảnh cho khách</h1>
      <p className="text-secondary mb-lg" style={{ marginTop: -12, maxWidth: 760 }}>
        Chọn album, chọn khách cần lọc, dò khớp trước để kiểm tra, rồi mới copy ảnh gốc từ máy vào
        từng thư mục khách — ảnh trùng giữa nhiều khách vẫn được chép vào từng thư mục (không gộp).
      </p>

      {!fsSupported && (
        <div className="card mb-lg" style={{ maxWidth: 760, borderColor: "var(--accent)" }}>
          <div className="card-body text-sm">
            Trình duyệt này không hỗ trợ lọc &amp; chép ảnh trực tiếp (cần Chrome, Edge hoặc Opera trên
            máy tính). Bạn vẫn có thể dùng nút <strong>“Xuất cho Books Filter (.json)”</strong> bên dưới
            và mở file đó bằng app <strong>Books Filter</strong> trên máy tính studio.
          </div>
        </div>
      )}

      <div className="field mb-lg" style={{ maxWidth: 420 }}>
        <label style={{ fontSize: 15 }}>Chọn album</label>
        <input
          className="input"
          placeholder="Tìm album theo tên…"
          value={albumSearch}
          onChange={(e) => setAlbumSearch(e.target.value)}
        />
        <select
          className="input"
          value={albumId}
          onChange={(e) => {
            setAlbumId(e.target.value);
            setAlbumSearch("");
          }}
        >
          <option value="">— Chọn album —</option>
          {filteredAlbums?.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        {filteredAlbums && albumSearch.trim() && filteredAlbums.length === 0 && (
          <p className="text-xs text-secondary">Không tìm thấy album nào khớp “{albumSearch.trim()}”.</p>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          alignItems: "start",
        }}
      >
        {/* CỘT 1 — Chọn đối tượng lọc */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center gap-sm mb-sm">
              <Users size={16} />
              <h3 style={{ fontSize: 17 }}>Chọn đối tượng lọc</h3>
            </div>
            <div className="mb-md" style={{ fontSize: 13, color: "var(--foreground)" }}>
              Selection Manager — Multi-User Selection
            </div>

            {!album ? (
              <p className="text-sm text-secondary">Chọn album ở trên để xem danh sách khách.</p>
            ) : customers.length === 0 ? (
              <p className="text-sm text-secondary">Chưa có khách nào chọn ảnh trong album này.</p>
            ) : (
              <>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <Button type="button" variant="secondary" onClick={selectAll} style={{ flex: 1 }}>
                    ☑ Chọn tất cả
                  </Button>
                  <Button type="button" variant="secondary" onClick={clearSelection} style={{ flex: 1 }}>
                    ☐ Bỏ chọn
                  </Button>
                </div>

                <div
                  className="text-sm"
                  style={{
                    background: "var(--muted)",
                    borderRadius: 6,
                    padding: "8px 10px",
                    marginBottom: 10,
                    fontWeight: 600,
                  }}
                >
                  Đã chọn: {targets.length} khách · {targetPhotoCount} ảnh
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {customers.map((c, i) => {
                    const checked = selectedIds.has(c.id);
                    return (
                      <div
                        key={c.id}
                        onClick={(e) => handleCustomerClick(e, i, c.id)}
                        className="nav-item"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          userSelect: "none",
                          cursor: "pointer",
                          background: checked ? "var(--muted)" : "transparent",
                          border: checked ? "1px solid var(--accent)" : "1px solid transparent",
                          width: "100%",
                        }}
                      >
                        <input type="checkbox" checked={checked} readOnly style={{ pointerEvents: "none" }} />
                        <span style={{ fontWeight: 600, color: "var(--foreground)", flex: 1 }}>
                          {customerDisplayNames[i]}
                        </span>
                        <span style={{ fontSize: 13, color: "var(--foreground)" }}>
                          {c.selectedFilenames.length} ảnh
                          {c.phone ? ` · ${c.phone}` : ""}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-secondary mt-sm">
                  Click chọn 1 · Shift+Click chọn khoảng · Cmd/Ctrl+Click chọn rời
                </p>

                <Button onClick={exportSelection} variant="secondary" style={{ marginTop: 16, width: "100%" }}>
                  <Download size={16} />
                  Xuất cho Books Filter (.json)
                </Button>
              </>
            )}
          </div>
        </div>

        {/* CỘT 2 — Lọc & Copy trực tiếp trên máy */}
        {fsSupported && (
          <div className="card">
            <div className="card-body">
              <div className="flex items-center gap-sm mb-md">
                <FolderOpen size={16} />
                <h3 style={{ fontSize: 17 }}>Lọc &amp; Copy trực tiếp trên máy</h3>
              </div>

              <div className="field">
                <label>Thư mục ảnh gốc</label>
                <Button type="button" variant="secondary" onClick={pickSource} style={{ width: "100%" }}>
                  {sourceName || "Chọn thư mục…"}
                </Button>
              </div>
              <div className="field mt-sm">
                <label>Thư mục lưu</label>
                <Button type="button" variant="secondary" onClick={pickDest} style={{ width: "100%" }}>
                  {destName || "Chọn thư mục…"}
                </Button>
              </div>

              <label
                className="check-row flex items-center gap-sm mt-sm"
                style={{ fontSize: 13, color: "var(--foreground)" }}
              >
                <input type="checkbox" checked={recursive} onChange={(e) => setRecursive(e.target.checked)} />
                Quét thư mục con
              </label>

              <div className="mt-sm" style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>
                Loại file
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                {(
                  [
                    ["all", "Tất cả"],
                    ["jpg", "Chỉ JPG"],
                    ["raw", "Chỉ RAW"],
                    ["raw_jpg", "RAW và JPG"],
                    ["custom", "Tùy chỉnh"],
                  ] as [ExtMode, string][]
                ).map(([val, label]) => (
                  <label key={val} className="flex items-center gap-sm" style={{ fontSize: 13, color: "var(--foreground)" }}>
                    <input type="radio" name="ext-mode" checked={extMode === val} onChange={() => setExtMode(val)} />
                    {label}
                  </label>
                ))}
              </div>
              {extMode === "custom" && (
                <input
                  className="input mt-sm"
                  placeholder="Ví dụ: cr2, nef, arw (cách nhau bởi dấu phẩy)"
                  value={customExt}
                  onChange={(e) => setCustomExt(e.target.value)}
                />
              )}

              <div className="mt-sm" style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>
                Khi file đã tồn tại
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                {(
                  [
                    ["skip", "Bỏ qua file"],
                    ["rename", "Đổi tên"],
                    ["overwrite", "Ghi đè"],
                  ] as [ConflictMode, string][]
                ).map(([val, label]) => (
                  <label key={val} className="flex items-center gap-sm" style={{ fontSize: 13, color: "var(--foreground)" }}>
                    <input type="radio" name="conflict-mode" checked={conflict === val} onChange={() => setConflict(val)} />
                    {label}
                  </label>
                ))}
              </div>

              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FilterTab)} className="mt-md">
                <TabsList variant="line">
                  <TabsTrigger value="album">Lọc Album</TabsTrigger>
                  <TabsTrigger value="name">Lọc Tên</TabsTrigger>
                  <TabsTrigger value="json">Lọc JSON</TabsTrigger>
                </TabsList>

                {/* ---------- Lọc Album ---------- */}
                <TabsContent value="album" className="mt-md">
                  <Button
                    onClick={runPreview}
                    disabled={previewing || running || !sourceDir || targets.length === 0}
                    variant="secondary"
                    style={{ width: "100%" }}
                  >
                    <Search size={16} />
                    {previewing ? "Đang dò khớp…" : "Dò khớp trước"}
                  </Button>

                  {(previewing || running) && <ProgressBar text={progressText} pct={progressPct} />}
                  {preview && <MultiPreviewList preview={preview} />}

                  <Button
                    onClick={runFilter}
                    disabled={running || previewing || !sourceDir || !destDir || targets.length === 0}
                    style={{ marginTop: 16, width: "100%" }}
                  >
                    <Play size={16} />
                    {running ? "Đang lọc & copy…" : "Bắt đầu lọc & Copy"}
                  </Button>

                  {results && (
                    <>
                      <MultiResultList results={results} />
                      <Button variant="secondary" onClick={exportReport} style={{ marginTop: 12, width: "100%" }}>
                        Xuất báo cáo (.txt)
                      </Button>
                    </>
                  )}
                </TabsContent>

                {/* ---------- Lọc Tên ---------- */}
                <TabsContent value="name" className="mt-md">
                  <div className="field">
                    <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Type size={14} /> Dán danh sách tên ảnh (mỗi tên 1 dòng)
                    </label>
                    <textarea
                      className="input"
                      style={{ minHeight: 120, resize: "vertical", fontFamily: "var(--font-mono)", fontSize: 12 }}
                      placeholder={"DSC_0001\nIMG_1234\nALBUM_01"}
                      value={nameListText}
                      onChange={(e) => setNameListText(e.target.value)}
                    />
                    <p className="text-xs text-secondary">{parsedNameList.length} tên (đã bỏ trùng khi lọc)</p>
                  </div>

                  <Button
                    onClick={runNamePreview}
                    disabled={namePreviewing || nameRunning || !sourceDir || parsedNameList.length === 0}
                    variant="secondary"
                    style={{ marginTop: 12, width: "100%" }}
                  >
                    <Search size={16} />
                    {namePreviewing ? "Đang dò khớp…" : "Dò khớp trước"}
                  </Button>

                  {(namePreviewing || nameRunning) && <ProgressBar text={nameProgressText} pct={nameProgressPct} />}

                  {namePreview && (
                    <div className="mt-md" style={{ display: "flex", gap: 8 }}>
                      <StatCard label="File khớp" value={namePreview.matched} unit="ảnh" />
                      <StatCard label="Không khớp" value={namePreview.notFound.length} unit="ảnh" />
                    </div>
                  )}

                  <Button
                    onClick={runNameFilter}
                    disabled={nameRunning || namePreviewing || !sourceDir || !destDir || parsedNameList.length === 0}
                    style={{ marginTop: 16, width: "100%" }}
                  >
                    <Play size={16} />
                    {nameRunning ? "Đang lọc & copy…" : "Bắt đầu lọc & Copy"}
                  </Button>

                  {nameResult && (
                    <div className="mt-md">
                      <div style={{ display: "flex", gap: 8 }}>
                        <StatCard label="Đã Copy" value={nameResult.copied} unit="ảnh" />
                        <StatCard
                          label="Bỏ Qua"
                          value={nameResult.notFound.length + nameResult.copiedFiles.filter((f) => f.action === "skipped").length}
                          unit="ảnh"
                        />
                      </div>
                      <div className="mt-sm text-sm">
                        {nameResult.copiedFiles
                          .filter((f) => f.action !== "skipped")
                          .map((f) => (
                            <div key={f.fileName} className="text-xs" style={{ color: "var(--success, #2f9e44)" }}>
                              ✓ {f.fileName}
                            </div>
                          ))}
                        {nameResult.notFound.map((n) => (
                          <div key={n} className="text-xs" style={{ color: "var(--destructive)" }}>
                            ✗ {n} → Không tìm thấy
                          </div>
                        ))}
                        {nameResult.copiedFiles
                          .filter((f) => f.action === "skipped")
                          .map((f) => (
                            <div key={f.fileName} className="text-xs" style={{ color: "var(--destructive)" }}>
                              ✗ {f.fileName} → File đã tồn tại
                            </div>
                          ))}
                      </div>
                      <Button variant="secondary" onClick={exportNameReport} style={{ marginTop: 12, width: "100%" }}>
                        Xuất báo cáo (.txt)
                      </Button>
                    </div>
                  )}
                </TabsContent>

                {/* ---------- Lọc JSON ---------- */}
                <TabsContent value="json" className="mt-md">
                  <div className="field">
                    <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <FileJson size={14} /> Nhập từ file .json
                    </label>
                    <input
                      ref={jsonInputRef}
                      type="file"
                      accept="application/json,.json"
                      onChange={handleJsonFile}
                      style={{ display: "none" }}
                    />
                    <Button type="button" variant="secondary" onClick={() => jsonInputRef.current?.click()} style={{ width: "100%" }}>
                      <Upload size={16} />
                      {jsonFileName || "Chọn file .json…"}
                    </Button>
                    {jsonCustomers && (
                      <p className="text-xs text-secondary">
                        Album: {jsonAlbumLabel || "—"} · {jsonCustomers.length} khách ·{" "}
                        {jsonCustomers.reduce((s, c) => s + c.filenames.length, 0)} ảnh
                      </p>
                    )}
                  </div>

                  <Button
                    onClick={runJsonPreview}
                    disabled={jsonPreviewing || jsonRunning || !sourceDir || !jsonCustomers || jsonCustomers.length === 0}
                    variant="secondary"
                    style={{ marginTop: 12, width: "100%" }}
                  >
                    <Search size={16} />
                    {jsonPreviewing ? "Đang dò khớp…" : "Dò khớp trước"}
                  </Button>

                  {(jsonPreviewing || jsonRunning) && <ProgressBar text={jsonProgressText} pct={jsonProgressPct} />}
                  {jsonPreview && <MultiPreviewList preview={jsonPreview} />}

                  <Button
                    onClick={runJsonFilter}
                    disabled={jsonRunning || jsonPreviewing || !sourceDir || !destDir || !jsonCustomers || jsonCustomers.length === 0}
                    style={{ marginTop: 16, width: "100%" }}
                  >
                    <Play size={16} />
                    {jsonRunning ? "Đang lọc & copy…" : "Bắt đầu lọc & Copy"}
                  </Button>

                  {jsonResults && (
                    <>
                      <MultiResultList results={jsonResults} />
                      <Button variant="secondary" onClick={exportJsonReport} style={{ marginTop: 12, width: "100%" }}>
                        Xuất báo cáo (.txt)
                      </Button>
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
