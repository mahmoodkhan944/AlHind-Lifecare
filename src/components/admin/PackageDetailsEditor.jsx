import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { GripVertical, Plus, X, ChevronDown, ChevronRight, Trash2, Heading } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { uid } from "@/lib/packageUtils";

const reorder = (list, from, to) => {
  const next = [...list];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
};

const newBlock = () => ({ id: uid(), subheading: "", text: "", points: [""] });

/**
 * Editor for the "Package Details" accordion.
 * value: [{ id, title, blocks: [{ id, subheading, text, points: [string] }] }]
 *
 * Everything is drag & drop: the items (accordion rows), the sub-heading
 * groups inside an item, and the bullet points inside a group — bullets can
 * even be dragged from one group to another.
 */
export function PackageDetailsEditor({ value, onChange }) {
  const items = value || [];
  const [open, setOpen] = useState(() => new Set(items.slice(0, 1).map((i) => i.id)));

  const toggle = (id) =>
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const updateItem = (itemId, fn) => onChange(items.map((it) => (it.id === itemId ? fn(it) : it)));
  const updateBlock = (itemId, blockId, fn) =>
    updateItem(itemId, (it) => ({ ...it, blocks: it.blocks.map((b) => (b.id === blockId ? fn(b) : b)) }));

  const addItem = () => {
    const item = { id: uid(), title: "", blocks: [newBlock()] };
    onChange([...items, item]);
    setOpen((prev) => new Set(prev).add(item.id));
  };

  const findBlock = (blockId) => {
    for (const it of items) {
      const b = it.blocks.find((x) => x.id === blockId);
      if (b) return { item: it, block: b };
    }
    return null;
  };

  const onDragEnd = ({ source, destination, type }) => {
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    if (type === "ITEM") {
      onChange(reorder(items, source.index, destination.index));
      return;
    }

    if (type === "BLOCK") {
      const itemId = source.droppableId.replace("blocks:", "");
      if (destination.droppableId !== source.droppableId) return; // groups stay inside their item
      updateItem(itemId, (it) => ({ ...it, blocks: reorder(it.blocks, source.index, destination.index) }));
      return;
    }

    if (type === "POINT") {
      const fromId = source.droppableId.replace("points:", "");
      const toId = destination.droppableId.replace("points:", "");
      if (fromId === toId) {
        const { item } = findBlock(fromId);
        updateBlock(item.id, fromId, (b) => ({ ...b, points: reorder(b.points, source.index, destination.index) }));
        return;
      }
      // Move a bullet between two groups (possibly in different items).
      const from = findBlock(fromId);
      const to = findBlock(toId);
      if (!from || !to) return;
      const moved = from.block.points[source.index];
      onChange(
        items.map((it) => ({
          ...it,
          blocks: it.blocks.map((b) => {
            if (b.id === fromId) return { ...b, points: b.points.filter((_, i) => i !== source.index) };
            if (b.id === toId) {
              const pts = [...b.points];
              pts.splice(destination.index, 0, moved);
              return { ...b, points: pts };
            }
            return b;
          }),
        }))
      );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-border p-4 sm:p-5 shadow-sm">
      <h3 className="font-bold text-foreground text-sm">Package Details</h3>
      <p className="text-xs text-muted-foreground mt-0.5 mb-4">
        Accordion on the package page (e.g. Package Description, Cost Details, Inclusions, Exclusions, Extra Options).
        Drag <GripVertical className="inline w-3 h-3 -mt-0.5" /> to reorder items, sub-headings and bullet points.
        Empty items are not shown.
      </p>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="items" type="ITEM">
          {(drop) => (
            <div ref={drop.innerRef} {...drop.droppableProps} className="space-y-2.5">
              {items.map((item, idx) => (
                <Draggable key={item.id} draggableId={`item:${item.id}`} index={idx}>
                  {(drag, snap) => (
                    <div
                      ref={drag.innerRef}
                      {...drag.draggableProps}
                      className={`rounded-xl border bg-white ${snap.isDragging ? "shadow-lg border-accent-jade" : "border-border"}`}
                    >
                      <div className="flex items-center gap-2 px-2.5 py-2">
                        <span {...drag.dragHandleProps} className="p-1 text-muted-foreground/60 hover:text-foreground cursor-grab" title="Drag to reorder" aria-label="Drag item">
                          <GripVertical className="w-4 h-4" />
                        </span>
                        <span className="text-[11px] font-bold text-muted-foreground w-4 text-center">{idx + 1}</span>
                        <Input
                          value={item.title}
                          onChange={(e) => updateItem(item.id, (it) => ({ ...it, title: e.target.value }))}
                          placeholder="Item title, e.g. Cost Details"
                          className="h-9 rounded-lg font-semibold flex-1 min-w-0"
                        />
                        <button type="button" onClick={() => toggle(item.id)} className="p-1.5 rounded hover:bg-muted" aria-label={open.has(item.id) ? "Collapse" : "Expand"}>
                          {open.has(item.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Remove "${item.title || "this item"}"?`)) onChange(items.filter((i) => i.id !== item.id));
                          }}
                          className="p-1.5 rounded hover:bg-destructive/10"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </div>

                      {open.has(item.id) && (
                        <div className="border-t border-border px-3 py-3 bg-muted/30 rounded-b-xl">
                          <Droppable droppableId={`blocks:${item.id}`} type="BLOCK">
                            {(bDrop) => (
                              <div ref={bDrop.innerRef} {...bDrop.droppableProps} className="space-y-2.5">
                                {item.blocks.map((b, bIdx) => (
                                  <Draggable key={b.id} draggableId={`block:${b.id}`} index={bIdx}>
                                    {(bDrag, bSnap) => (
                                      <div
                                        ref={bDrag.innerRef}
                                        {...bDrag.draggableProps}
                                        className={`rounded-lg border bg-white p-2.5 space-y-2 ${bSnap.isDragging ? "shadow-lg border-accent-jade" : "border-border"}`}
                                      >
                                        <div className="flex items-center gap-1.5">
                                          {item.blocks.length > 1 && (
                                            <span {...bDrag.dragHandleProps} className="p-1 text-muted-foreground/60 hover:text-foreground cursor-grab" aria-label="Drag sub-heading group">
                                              <GripVertical className="w-4 h-4" />
                                            </span>
                                          )}
                                          {item.blocks.length <= 1 && <span {...bDrag.dragHandleProps} className="hidden" />}
                                          <Heading className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                          <Input
                                            value={b.subheading}
                                            onChange={(e) => updateBlock(item.id, b.id, (x) => ({ ...x, subheading: e.target.value }))}
                                            placeholder="Sub-heading (optional), e.g. Hospital Charges"
                                            className="h-8 rounded-md text-sm font-medium flex-1 min-w-0"
                                          />
                                          {item.blocks.length > 1 && (
                                            <button
                                              type="button"
                                              onClick={() => updateItem(item.id, (it) => ({ ...it, blocks: it.blocks.filter((x) => x.id !== b.id) }))}
                                              className="p-1 rounded hover:bg-muted"
                                              aria-label="Remove sub-heading group"
                                            >
                                              <X className="w-4 h-4 text-muted-foreground" />
                                            </button>
                                          )}
                                        </div>
                                        <Textarea
                                          value={b.text}
                                          onChange={(e) => updateBlock(item.id, b.id, (x) => ({ ...x, text: e.target.value }))}
                                          placeholder="Paragraph (optional)"
                                          className="rounded-md text-sm min-h-[60px]"
                                          rows={2}
                                        />
                                        <BulletList
                                          blockId={b.id}
                                          points={b.points}
                                          onChange={(points) => updateBlock(item.id, b.id, (x) => ({ ...x, points }))}
                                        />
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {bDrop.placeholder}
                              </div>
                            )}
                          </Droppable>
                          <button
                            type="button"
                            onClick={() => updateItem(item.id, (it) => ({ ...it, blocks: [...it.blocks, newBlock()] }))}
                            className="mt-2.5 flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-dashed border-border bg-white text-xs font-medium hover:bg-muted"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add sub-heading
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {drop.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <button
        type="button"
        onClick={addItem}
        className="mt-3 flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-white text-xs font-medium hover:bg-muted"
      >
        <Plus className="w-3.5 h-3.5" /> Add item
      </button>
    </div>
  );
}

function BulletList({ blockId, points, onChange }) {
  const focusBullet = (i) =>
    setTimeout(() => document.getElementById(`bullet-${blockId}-${i}`)?.focus(), 0);

  return (
    <div>
      <p className="text-[11px] font-semibold text-muted-foreground mb-1">Bullet points</p>
      <Droppable droppableId={`points:${blockId}`} type="POINT">
        {(drop, dropSnap) => (
          <div
            ref={drop.innerRef}
            {...drop.droppableProps}
            className={`space-y-1.5 min-h-[8px] rounded-md ${dropSnap.isDraggingOver ? "bg-accent-jade/5" : ""}`}
          >
            {points.map((p, i) => (
              <Draggable key={`${blockId}-${i}`} draggableId={`point:${blockId}:${i}`} index={i}>
                {(drag, snap) => (
                  <div
                    ref={drag.innerRef}
                    {...drag.draggableProps}
                    className={`flex items-center gap-1.5 rounded-md bg-white ${snap.isDragging ? "shadow-md ring-1 ring-accent-jade" : ""}`}
                  >
                    <span {...drag.dragHandleProps} className="p-0.5 text-muted-foreground/50 hover:text-foreground cursor-grab" aria-label="Drag bullet">
                      <GripVertical className="w-3.5 h-3.5" />
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-jade shrink-0" />
                    <Input
                      id={`bullet-${blockId}-${i}`}
                      value={p}
                      onChange={(e) => onChange(points.map((x, j) => (j === i ? e.target.value : x)))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const next = [...points];
                          next.splice(i + 1, 0, "");
                          onChange(next);
                          focusBullet(i + 1);
                        }
                      }}
                      placeholder="Bullet point (Enter for next)"
                      className="h-8 rounded-md text-sm flex-1 min-w-0"
                    />
                    <button type="button" onClick={() => onChange(points.filter((_, j) => j !== i))} className="p-1 rounded hover:bg-muted" aria-label="Remove bullet">
                      <X className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                )}
              </Draggable>
            ))}
            {drop.placeholder}
          </div>
        )}
      </Droppable>
      <button
        type="button"
        onClick={() => { onChange([...points, ""]); focusBullet(points.length); }}
        className="mt-1.5 flex items-center gap-1 text-xs font-medium text-accent-jade hover:underline"
      >
        <Plus className="w-3.5 h-3.5" /> Add bullet
      </button>
    </div>
  );
}

/**
 * Editor for "Treatment related information" — optional question/answer
 * cards, reorderable by drag & drop. value: [{ id, question, answer }]
 */
export function TreatmentInfoEditor({ value, onChange }) {
  const items = value || [];
  const update = (id, key, val) => onChange(items.map((it) => (it.id === id ? { ...it, [key]: val } : it)));

  return (
    <div className="bg-white rounded-2xl border border-border p-4 sm:p-5 shadow-sm">
      <h3 className="font-bold text-foreground text-sm">
        Treatment Related Information <span className="text-muted-foreground/70 font-normal text-xs">(optional)</span>
      </h3>
      <p className="text-xs text-muted-foreground mt-0.5 mb-4">
        Question & answer cards shown open on the page. Leave empty to hide the section. Drag to reorder.
      </p>
      <DragDropContext
        onDragEnd={({ source, destination }) => {
          if (destination && destination.index !== source.index) onChange(reorder(items, source.index, destination.index));
        }}
      >
        <Droppable droppableId="treatment-info">
          {(drop) => (
            <div ref={drop.innerRef} {...drop.droppableProps} className="space-y-2.5">
              {items.map((it, idx) => (
                <Draggable key={it.id} draggableId={`ti:${it.id}`} index={idx}>
                  {(drag, snap) => (
                    <div
                      ref={drag.innerRef}
                      {...drag.draggableProps}
                      className={`rounded-xl border bg-white p-2.5 flex gap-2 ${snap.isDragging ? "shadow-lg border-accent-jade" : "border-border"}`}
                    >
                      <span {...drag.dragHandleProps} className="p-1 h-fit text-muted-foreground/60 hover:text-foreground cursor-grab" aria-label="Drag">
                        <GripVertical className="w-4 h-4" />
                      </span>
                      <div className="flex-1 min-w-0 space-y-2">
                        <Input value={it.question} onChange={(e) => update(it.id, "question", e.target.value)} placeholder="Heading / question, e.g. What are the risks of a facelift?" className="h-9 rounded-lg font-medium" />
                        <Textarea value={it.answer} onChange={(e) => update(it.id, "answer", e.target.value)} placeholder="Answer" className="rounded-lg text-sm min-h-[70px]" rows={3} />
                      </div>
                      <button type="button" onClick={() => onChange(items.filter((x) => x.id !== it.id))} className="p-1 h-fit rounded hover:bg-muted" aria-label="Remove">
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {drop.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <button
        type="button"
        onClick={() => onChange([...items, { id: uid(), question: "", answer: "" }])}
        className="mt-3 flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-white text-xs font-medium hover:bg-muted"
      >
        <Plus className="w-3.5 h-3.5" /> Add information
      </button>
    </div>
  );
}