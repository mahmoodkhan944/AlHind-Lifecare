import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { GripVertical, Plus, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

// Paragraphs are stored in the same single text column as before, separated
// by a blank line, so no database change is needed and old text still works.
export const splitParagraphs = (text) =>
  String(text || "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

const joinParagraphs = (list) => list.map((p) => p.trim()).filter(Boolean).join("\n\n");

/**
 * Several paragraph boxes for one text field (e.g. Doctor Overview).
 * value: the saved text; onChange receives the joined text.
 * Paragraphs can be added, removed and dragged up/down.
 */
export default function ParagraphListField({ value, onChange, placeholder = "Write a paragraph..." }) {
  // Kept locally so empty boxes the admin just added don't disappear.
  const [items, setItems] = useState(() => {
    const list = splitParagraphs(value).map((text, i) => ({ id: `p${i}-${Date.now()}`, text }));
    return list.length ? list : [{ id: `p0-${Date.now()}`, text: "" }];
  });

  const update = (next) => {
    setItems(next);
    onChange(joinParagraphs(next.map((p) => p.text)));
  };

  const add = () => {
    const id = `p${Date.now()}`;
    update([...items, { id, text: "" }]);
    setTimeout(() => document.getElementById(`para-${id}`)?.focus(), 0);
  };

  return (
    <div>
      <DragDropContext
        onDragEnd={({ source, destination }) => {
          if (!destination || destination.index === source.index) return;
          const next = [...items];
          const [moved] = next.splice(source.index, 1);
          next.splice(destination.index, 0, moved);
          update(next);
        }}
      >
        <Droppable droppableId="paragraphs">
          {(drop) => (
            <div ref={drop.innerRef} {...drop.droppableProps} className="space-y-2">
              {items.map((p, i) => (
                <Draggable key={p.id} draggableId={p.id} index={i}>
                  {(drag, snap) => (
                    <div
                      ref={drag.innerRef}
                      {...drag.draggableProps}
                      className={`flex items-start gap-1.5 rounded-lg bg-white ${snap.isDragging ? "shadow-md ring-1 ring-accent-jade" : ""}`}
                    >
                      <span
                        {...drag.dragHandleProps}
                        className={`p-0.5 mt-3 text-muted-foreground/50 hover:text-foreground cursor-grab ${items.length < 2 ? "invisible" : ""}`}
                        aria-label="Drag paragraph"
                      >
                        <GripVertical className="w-3.5 h-3.5" />
                      </span>
                      <Textarea
                        id={`para-${p.id}`}
                        value={p.text}
                        onChange={(e) => update(items.map((x) => (x.id === p.id ? { ...x, text: e.target.value } : x)))}
                        placeholder={i === 0 ? placeholder : `Paragraph ${i + 1}`}
                        className="rounded-lg border-border min-h-[80px] flex-1"
                        rows={3}
                      />
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => update(items.filter((x) => x.id !== p.id))}
                          className="mt-1 w-8 h-8 shrink-0 flex items-center justify-center rounded-lg text-muted-foreground/70 hover:bg-destructive/10 hover:text-destructive"
                          aria-label="Remove paragraph"
                        >
                          <X className="w-4 h-4" />
                        </button>
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
        onClick={add}
        className="mt-2 ml-5 flex items-center gap-1 text-xs font-medium text-accent-jade hover:underline"
      >
        <Plus className="w-3.5 h-3.5" /> Add paragraph
      </button>
    </div>
  );
}