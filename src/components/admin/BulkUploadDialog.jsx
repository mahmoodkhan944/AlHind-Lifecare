import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Upload, Download, Loader2, FileSpreadsheet, CheckCircle2, XCircle } from "lucide-react";

/**
 * Generic "download template → fill it in → upload it back" bulk importer
 * for any db.entities.X. Every column is optional on purpose: nothing in
 * the template is validated as required, and any DB column that genuinely
 * can't be null (e.g. name) just gets an auto-generated placeholder like
 * "Untitled Doctor 3" if the admin left it blank, so an incomplete sheet
 * never blocks the import — the admin can fill in the rest later via Edit.
 *
 * Props:
 *  - entityLabel: display name, e.g. "Doctors"
 *  - entity: db.entities.Doctor (needs .create())
 *  - columns: [{ key, label, type: "text"|"number"|"boolean"|"list"|"lookup-list", example? }]
 *      "list" columns accept pipe-separated values in one cell (e.g.
 *      "Cardiology | Heart Surgery") and are stored as a JSON array string,
 *      matching how the full add/edit forms store their list fields.
 *      "lookup-list" columns also accept pipe-separated values, but each
 *      value is a human-readable NAME that gets resolved to a record id via
 *      lookupMaps[col.key] (case-insensitive) — for relation fields like
 *      hospital_ids/doctor_ids, so people can type names in the sheet
 *      instead of needing to know internal ids. Names with no match are
 *      silently skipped rather than blocking the row.
 *  - lookupMaps: { [columnKey]: Map<lowercaseName, id> } — only needed when
 *      using "lookup-list" columns.
 *  - requiredDefaults: { dbColumnKey: fallbackValue | (rowIndex) => value }
 *      applied only when that column ends up empty after the row is read.
 *  - onImported: called after a successful import (e.g. to reload the list)
 */
export default function BulkUploadDialog({ entityLabel, entity, columns, requiredDefaults = {}, lookupMaps = {}, onImported }) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState(null);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const reset = () => {
    setRows(null);
    setFileName("");
    setResult(null);
  };

  const downloadTemplate = () => {
    const headerRow = columns.map((c) => c.label);
    const exampleRow = columns.map((c) => c.example ?? "");
    const ws = XLSX.utils.aoa_to_sheet([headerRow, exampleRow]);
    ws["!cols"] = columns.map(() => ({ wch: 24 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, entityLabel);

    const listCols = columns.filter((c) => c.type === "list").map((c) => c.label);
    const lookupCols = columns.filter((c) => c.type === "lookup-list").map((c) => c.label);
    const notes = [
      ["How to use this template"],
      ["Every column is optional — leave anything blank you don't have yet."],
      ["Row 2 is just an example — delete it or overwrite it with your real data."],
      ["You can add as many rows as you like; each row becomes one entry."],
      listCols.length
        ? [`For list-style columns (${listCols.join(", ")}), separate multiple values with a "|" character.`]
        : [""],
      lookupCols.length
        ? [`For columns (${lookupCols.join(", ")}), type existing names separated by "|" — they'll be matched automatically. Names that don't match anything are skipped, not an error.`]
        : [""],
      ["Missing required fields (like name) will be auto-filled with a placeholder you can rename later from Edit."],
    ];
    const notesWs = XLSX.utils.aoa_to_sheet(notes);
    notesWs["!cols"] = [{ wch: 90 }];
    XLSX.utils.book_append_sheet(wb, notesWs, "Instructions");

    XLSX.writeFile(wb, `${entityLabel.toLowerCase().replace(/\s+/g, "_")}_bulk_template.xlsx`);
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setResult(null);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      setRows(json);
    } catch (err) {
      toast({ title: "Couldn't read that file", description: "Make sure it's a valid .xlsx file.", variant: "destructive" });
      setRows(null);
      setFileName("");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const coerce = (col, raw) => {
    const value = typeof raw === "string" ? raw.trim() : raw;
    if (value === "" || value === undefined || value === null) return undefined;
    if (col.type === "number") {
      const n = Number(value);
      return Number.isFinite(n) ? n : undefined;
    }
    if (col.type === "boolean") {
      const s = String(value).trim().toLowerCase();
      return ["true", "yes", "y", "1"].includes(s);
    }
    if (col.type === "list") {
      const items = String(value).split("|").map((s) => s.trim()).filter(Boolean);
      return items.length ? JSON.stringify(items) : undefined;
    }
    if (col.type === "lookup-list") {
      const names = String(value).split("|").map((s) => s.trim()).filter(Boolean);
      const map = lookupMaps[col.key];
      const ids = names
        .map((n) => map?.get(n.toLowerCase()))
        .filter(Boolean);
      return ids.length ? JSON.stringify(ids) : undefined;
    }
    return String(value);
  };

  const handleImport = async () => {
    if (!rows || rows.length === 0) return;
    setImporting(true);
    let success = 0;
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const payload = {};
      for (const col of columns) {
        const val = coerce(col, row[col.label]);
        if (val !== undefined) payload[col.key] = val;
      }
      // Every column above was optional. Now quietly fill any DB column
      // that truly can't be blank, so this row can never fail for that reason.
      for (const [key, fallback] of Object.entries(requiredDefaults)) {
        if (payload[key] === undefined || payload[key] === "") {
          payload[key] = typeof fallback === "function" ? fallback(i + 1, payload) : fallback;
        }
      }
      try {
        await entity.create(payload);
        success++;
      } catch (err) {
        errors.push({ row: i + 2, message: err?.message || "Unknown error" });
      }
    }

    setImporting(false);
    setResult({ success, failed: errors.length, errors: errors.slice(0, 10) });
    if (success > 0) onImported?.();
  };

  return (
    <>
      <Button type="button" variant="outline" className="gap-2 rounded-xl" onClick={() => setOpen(true)}>
        <Upload className="w-4 h-4" /> Bulk Upload
      </Button>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) reset();
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Bulk Upload {entityLabel}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-xl border border-dashed border-border p-3 text-xs text-muted-foreground">
              Every column in the template is optional — fill in only what you have. Anything a record truly needs
              (like a name) gets a placeholder automatically if left blank, so nothing blocks the import.
            </div>

            <Button type="button" variant="outline" className="w-full gap-2 rounded-xl" onClick={downloadTemplate}>
              <Download className="w-4 h-4" /> Download Excel Template
            </Button>

            <div>
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFile} />
              <Button
                type="button"
                className="w-full gap-2 rounded-xl bg-accent-jade hover:bg-accent-jade/90 text-white"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileSpreadsheet className="w-4 h-4" /> Choose Filled Excel File
              </Button>
              {fileName && (
                <p className="text-xs text-muted-foreground mt-1.5">
                  {fileName} — {rows ? `${rows.length} row(s) found` : "reading..."}
                </p>
              )}
            </div>

            {result && (
              <div className="rounded-xl border border-border p-3 text-sm space-y-1.5">
                <div className="flex items-center gap-1.5 text-accent-jade font-medium">
                  <CheckCircle2 className="w-4 h-4" /> {result.success} imported successfully
                </div>
                {result.failed > 0 && (
                  <div className="flex items-center gap-1.5 text-destructive font-medium">
                    <XCircle className="w-4 h-4" /> {result.failed} row(s) failed
                  </div>
                )}
                {result.errors.length > 0 && (
                  <ul className="text-xs text-muted-foreground list-disc pl-4 pt-1 space-y-0.5">
                    {result.errors.map((e, i) => (
                      <li key={i}>
                        Row {e.row}: {e.message}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-lg">
              Close
            </Button>
            <Button
              type="button"
              disabled={!rows || rows.length === 0 || importing}
              onClick={handleImport}
              className="rounded-lg bg-accent-jade hover:bg-accent-jade/90 text-white gap-2"
            >
              {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Import {rows ? `${rows.length} row(s)` : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}