import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { db } from "@/api/dataClient";
import { Search, Loader2, Trash2, CheckCircle2, AlertTriangle } from "lucide-react";

const BUCKET = "uploads";

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

// Extracts the storage path from one of our own public URLs, e.g.
// "https://xxx.supabase.co/storage/v1/object/public/uploads/172839-abc-photo.jpg"
// -> "172839-abc-photo.jpg". Returns null for anything that isn't one of our
// own uploads (external links, lucide icon names, etc.) so those are never
// mistaken for a storage path.
function pathFromUrl(url) {
  if (!url || typeof url !== "string") return null;
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  try {
    return decodeURIComponent(url.slice(idx + marker.length));
  } catch {
    return null;
  }
}

// Every table + field that can hold a URL pointing into the uploads bucket.
// "list" fields are JSON-array columns (parsed before scanning); everything
// else is a plain text column.
const SOURCES = [
  { entity: "Treatment", fields: ["image_url"] },
  { entity: "Hospital", fields: ["cover_image_url"] },
  { entity: "Doctor", fields: ["photo_url", "award_document_url"] },
  { entity: "BlogPost", fields: ["cover_image_url"], listFields: ["additional_images"] },
  { entity: "SiteContent", fields: ["icon", "image_url"] },
  { entity: "Testimonial", fields: ["photo_url"] },
];

async function listAllStorageFiles() {
  const all = [];
  let offset = 0;
  const limit = 1000;
  while (true) {
    const { data, error } = await supabase.storage.from(BUCKET).list("", { limit, offset });
    if (error) throw error;
    if (!data || data.length === 0) break;
    all.push(...data.filter((f) => f.name && !f.name.endsWith("/")));
    if (data.length < limit) break;
    offset += limit;
  }
  return all;
}

async function collectReferencedPaths() {
  const used = new Set();
  for (const source of SOURCES) {
    const entity = db.entities[source.entity];
    if (!entity) continue;
    let rows = [];
    try {
      rows = await entity.list("-created_date", 5000);
    } catch {
      continue;
    }
    for (const row of rows) {
      for (const field of source.fields || []) {
        const path = pathFromUrl(row[field]);
        if (path) used.add(path);
      }
      for (const field of source.listFields || []) {
        let arr = row[field];
        if (typeof arr === "string") {
          try {
            arr = JSON.parse(arr);
          } catch {
            arr = [];
          }
        }
        if (Array.isArray(arr)) {
          for (const url of arr) {
            const path = pathFromUrl(url);
            if (path) used.add(path);
          }
        }
      }
    }
  }
  return used;
}

export default function OrphanedFilesFinder() {
  const { toast } = useToast();
  const [scanning, setScanning] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [result, setResult] = useState(null); // { orphans: [{name, size}], totalFiles, totalBytes }
  const [selected, setSelected] = useState(new Set());

  const scan = async () => {
    setScanning(true);
    setResult(null);
    setSelected(new Set());
    try {
      const [files, used] = await Promise.all([listAllStorageFiles(), collectReferencedPaths()]);
      const orphans = files.filter((f) => !used.has(f.name));
      const totalBytes = orphans.reduce((sum, f) => sum + (f.metadata?.size || 0), 0);
      setResult({ orphans, totalFiles: files.length, totalBytes });
      setSelected(new Set(orphans.map((f) => f.name)));
      toast({ title: `Scan complete — ${orphans.length} of ${files.length} files look unused` });
    } catch (err) {
      toast({ title: "Scan failed", description: err?.message, variant: "destructive" });
    }
    setScanning(false);
  };

  const toggle = (name) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const deleteSelected = async () => {
    if (selected.size === 0) return;
    if (
      !window.confirm(
        `Permanently delete ${selected.size} file${selected.size > 1 ? "s" : ""} from storage? This cannot be undone.`
      )
    )
      return;
    setDeleting(true);
    try {
      const paths = Array.from(selected);
      const { error } = await supabase.storage.from(BUCKET).remove(paths);
      if (error) throw error;
      setResult((prev) =>
        prev
          ? {
              ...prev,
              orphans: prev.orphans.filter((f) => !selected.has(f.name)),
            }
          : prev
      );
      toast({ title: `${paths.length} file(s) deleted` });
      setSelected(new Set());
    } catch (err) {
      toast({ title: "Delete failed", description: err?.message, variant: "destructive" });
    }
    setDeleting(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-border p-4 sm:p-5 shadow-sm">
      <div className="flex items-start gap-3 mb-3">
        <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary shrink-0">
          <Search className="w-4.5 h-4.5" />
        </span>
        <div>
          <h3 className="font-bold text-foreground text-sm">Find Orphaned Files</h3>
          <p className="text-xs text-muted-foreground/70 mt-0.5">
            Scans every Treatment, Hospital, Doctor, Blog Post, Testimonial, and Site Content record for the
            images/files they actually reference, then compares that against everything in storage. Anything left
            over isn't linked to anything on the site anymore — usually leftovers from before automatic cleanup was
            added, or from edits made outside the admin panel.
          </p>
        </div>
      </div>

      {!result && (
        <Button onClick={scan} disabled={scanning} className="gap-2">
          {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {scanning ? "Scanning..." : "Scan for Orphaned Files"}
        </Button>
      )}

      {result && (
        <div className="space-y-3">
          {result.orphans.length === 0 ? (
            <div className="flex items-start gap-2 text-sm text-accent-jade bg-accent-jade/5 rounded-lg px-3 py-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <p>Nothing orphaned — every one of the {result.totalFiles} files in storage is still in use.</p>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-2 text-sm text-[hsl(var(--accent-warm))] bg-[hsl(var(--accent-warm)/0.08)] rounded-lg px-3 py-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">
                    {result.orphans.length} of {result.totalFiles} files look unused —{" "}
                    {formatBytes(result.totalBytes)} reclaimable
                  </p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Review the list before deleting — untick anything you're not sure about.
                  </p>
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto rounded-lg border border-border divide-y divide-border">
                {result.orphans.map((f) => (
                  <label key={f.name} className="flex items-center gap-3 px-3 py-2 hover:bg-muted cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selected.has(f.name)}
                      onChange={() => toggle(f.name)}
                      className="w-4 h-4 rounded border-border text-accent-jade focus:ring-accent-jade shrink-0"
                    />
                    <span className="text-xs font-mono text-foreground/80 truncate flex-1">{f.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatBytes(f.metadata?.size || 0)}
                    </span>
                  </label>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={deleteSelected}
                  disabled={deleting || selected.size === 0}
                  variant="destructive"
                  size="sm"
                  className="gap-2"
                >
                  {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  Delete {selected.size} Selected
                </Button>
                <Button onClick={scan} disabled={scanning} variant="outline" size="sm" className="gap-2">
                  <Search className="w-3.5 h-3.5" /> Re-scan
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}