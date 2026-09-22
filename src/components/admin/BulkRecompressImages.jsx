import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { compressImage } from "@/api/uploadFile";
import { ImageDown, Loader2, CheckCircle2 } from "lucide-react";

const BUCKET = "uploads";
const IMAGE_EXT_RE = /\.(jpe?g|png|webp)$/i;

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Lists every object in the uploads bucket, handling pagination (the
 * Supabase Storage list API returns at most 1000 per call).
 */
async function listAllFiles() {
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

export default function BulkRecompressImages() {
  const { toast } = useToast();
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(null); // { done, total, currentName }
  const [summary, setSummary] = useState(null); // { compressed, skipped, failed, bytesSaved }

  const run = async () => {
    setRunning(true);
    setSummary(null);
    let compressed = 0;
    let skipped = 0;
    const failedItems = [];
    let bytesSaved = 0;

    try {
      const files = (await listAllFiles()).filter((f) => IMAGE_EXT_RE.test(f.name));
      setProgress({ done: 0, total: files.length, currentName: "" });

      for (let i = 0; i < files.length; i++) {
        const entry = files[i];
        setProgress({ done: i, total: files.length, currentName: entry.name });
        try {
          const { data: blob, error: downloadError } = await supabase.storage.from(BUCKET).download(entry.name);
          if (downloadError || !blob) {
            failedItems.push({ name: entry.name, reason: downloadError?.message || "Couldn't download" });
            continue;
          }
          const originalSize = blob.size;
          // compressImage expects a File-like object with .type and .name.
          const asFile = new File([blob], entry.name, { type: blob.type });
          const result = await compressImage(asFile);

          if (result === asFile || result.size >= originalSize) {
            // Already optimal — nothing worth re-uploading.
            skipped++;
            continue;
          }

          const { error: uploadError } = await supabase.storage.from(BUCKET).upload(entry.name, result, {
            upsert: true,
            contentType: result.type || undefined,
            cacheControl: "3600",
          });
          if (uploadError) {
            failedItems.push({ name: entry.name, reason: uploadError.message || "Couldn't re-upload" });
            continue;
          }

          compressed++;
          bytesSaved += originalSize - result.size;
        } catch (err) {
          failedItems.push({ name: entry.name, reason: err?.message || "Unexpected error" });
        }
      }

      setProgress({ done: files.length, total: files.length, currentName: "" });
      setSummary({ compressed, skipped, failed: failedItems.length, failedItems, bytesSaved, total: files.length });
      toast({ title: "Re-compression complete", description: `${compressed} image(s) compressed, ${formatBytes(bytesSaved)} saved.` });
    } catch (err) {
      toast({ title: "Couldn't list storage files", description: err?.message, variant: "destructive" });
    }
    setRunning(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-border p-4 sm:p-5 shadow-sm">
      <div className="flex items-start gap-3 mb-3">
        <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary shrink-0">
          <ImageDown className="w-4.5 h-4.5" />
        </span>
        <div>
          <h3 className="font-bold text-foreground text-sm">Bulk Re-compress Existing Images</h3>
          <p className="text-xs text-muted-foreground/70 mt-0.5">
            New uploads are compressed automatically. This goes through every image already in storage and
            re-compresses it in place — same URL, so nothing else needs to change. Safe to run more than once;
            already-optimized images are skipped.
          </p>
        </div>
      </div>

      {!running && !summary && (
        <Button onClick={run} className="gap-2">
          <ImageDown className="w-4 h-4" /> Start Re-compression
        </Button>
      )}

      {running && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            {progress
              ? `Processing ${progress.done + 1} of ${progress.total}${progress.currentName ? ` — ${progress.currentName}` : ""}`
              : "Listing files..."}
          </div>
          {progress && progress.total > 0 && (
            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${Math.round((progress.done / progress.total) * 100)}%` }}
              />
            </div>
          )}
        </div>
      )}

      {summary && !running && (
        <div className="space-y-3">
          <div className="flex items-start gap-2 text-sm text-accent-jade bg-accent-jade/5 rounded-lg px-3 py-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Done — {formatBytes(summary.bytesSaved)} saved</p>
              <p className="text-muted-foreground text-xs mt-0.5">
                {summary.compressed} compressed &middot; {summary.skipped} already optimal &middot;{" "}
                {summary.failed} failed &middot; {summary.total} total
              </p>
            </div>
          </div>

          {summary.failedItems?.length > 0 && (
            <div className="border border-destructive/20 bg-destructive/5 rounded-lg p-3">
              <p className="text-xs font-medium text-destructive mb-2">
                {summary.failedItems.length} file{summary.failedItems.length !== 1 ? "s" : ""} couldn't be processed:
              </p>
              <ul className="space-y-1 max-h-48 overflow-y-auto">
                {summary.failedItems.map((item, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <span className="font-mono text-foreground/80 shrink-0">{item.name}</span>
                    <span className="text-muted-foreground/70">— {item.reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button onClick={run} variant="outline" size="sm" className="gap-2">
            <ImageDown className="w-3.5 h-3.5" /> Run Again
          </Button>
        </div>
      )}
    </div>
  );
}