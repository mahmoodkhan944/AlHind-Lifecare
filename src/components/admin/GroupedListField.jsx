import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { GripVertical, Plus, X, Heading } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { newGroup } from "@/lib/sectionGroups";

const reorder = (list, from, to) => {
  const next = [...list];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
};

/**
 * A section editor with several sub-headings, each with its own list of
 * points. Sub-headings and points can be dragged up/down (⠿ handle), and a
 * point can be dragged from one sub-heading to another.
 *
 * groups: [{ id, subheading, items: [string] }]
 * multiline: use a textarea per item (e.g. description paragraphs)
 */
export default function GroupedListField({
  label,
  placeholder = "Item",
  number,
  required,
  optional,
  groups,
  onChange,
  multiline = false,
  accent = false,
  hint,
}) {
  // An empty section still shows one blank group to type into.
  const list = groups && groups.length > 0 ? groups : [newGroup()];
  const set = (next) => onChange(next);
  const updateGroup = (id, fn) => set(list.map((g) => (g.id === id ? fn(g) : g)));

  const focusItem = (groupId, i) =>
    setTimeout(() => document.getElementById(`gl-${groupId}-${i}`)?.focus(), 0);

  const onDragEnd = ({ source, destination, type }) => {
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    if (type === "GROUP") {
      set(reorder(list, source.index, destination.index));
      return;
    }
    const fromId = source.droppableId.replace("items:", "");
    const toId = destination.droppableId.replace("items:", "");
    if (fromId === toId) {
      updateGroup(fromId, (g) => ({ ...g, items: reorder(g.items, source.index, destination.index) }));
      return;
    }
    const moved = list.find((g) => g.id === fromId)?.items[source.index];
    set(
      list.map((g) => {
        if (g.id === fromId) return { ...g, items: g.items.filter((_, i) => i !== source.index) };
        if (g.id === toId) {
          const items = [...g.items];
          items.splice(destination.index, 0, moved);
          return { ...g, items };
        }
        return g;
      })
    );
  };

  const ItemInput = multiline ? Textarea : Input;

  return (
    <div className={`rounded-2xl border p-4 sm:p-5 shadow-sm ${accent ? "bg-[hsl(var(--accent-warm)/0.08)] border-amber-200" : "bg-white border-border"}`}>
      {label && (
        <div className="flex items-center gap-2 mb-1">
          {number != null && (
            <span className="w-5 h-5 rounded-full bg-secondary text-white text-[10px] font-bold flex items-center justify-center shrink-0">{number}</span>
          )}
          <h3 className="font-bold text-foreground text-sm">
            {label}
            {required && <span className="text-destructive"> *</span>}
            {optional && <span className="text-muted-foreground/70 font-normal text-xs ml-1">(optional)</span>}
          </h3>
        </div>
      )}
      <p className="text-[11px] text-muted-foreground/80 mb-3">
        Add as many sub-headings as you need. Drag <GripVertical className="inline w-3 h-3 -mt-0.5" /> to move sub-headings or points up/down.
      </p>
      {hint && <p className="text-xs text-accent-jade bg-accent-jade/5 border border-accent-jade/15 rounded-lg px-3 py-2 mb-3">{hint}</p>}

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="groups" type="GROUP">
          {(drop) => (
            <div ref={drop.innerRef} {...drop.droppableProps} className="space-y-3">
              {list.map((g, gIdx) => (
                <Draggable key={g.id} draggableId={`group:${g.id}`} index={gIdx}>
                  {(drag, snap) => (
                    <div
                      ref={drag.innerRef}
                      {...drag.draggableProps}
                      className={`rounded-xl border bg-white p-2.5 sm:p-3 space-y-2 ${snap.isDragging ? "shadow-lg border-accent-jade" : "border-border"}`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          {...drag.dragHandleProps}
                          className={`p-1 text-muted-foreground/60 hover:text-foreground cursor-grab ${list.length < 2 ? "invisible" : ""}`}
                          aria-label="Drag sub-heading"
                          title="Drag to move this sub-heading"
                        >
                          <GripVertical className="w-4 h-4" />
                        </span>
                        <Heading className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <Input
                          value={g.subheading}
                          onChange={(e) => updateGroup(g.id, (x) => ({ ...x, subheading: e.target.value }))}
                          placeholder={gIdx === 0 ? "Sub-heading (optional)" : `Sub-heading ${gIdx + 1}`}
                          className="h-9 rounded-lg font-bold text-[15px] placeholder:font-normal flex-1 min-w-0"
                        />
                        {list.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const hasContent = g.subheading.trim() || g.items.some((i) => i.trim());
                              if (!hasContent || window.confirm("Remove this sub-heading and its points?")) {
                                set(list.filter((x) => x.id !== g.id));
                              }
                            }}
                            className="p-1.5 rounded hover:bg-destructive/10"
                            aria-label="Remove sub-heading"
                          >
                            <X className="w-4 h-4 text-muted-foreground" />
                          </button>
                        )}
                      </div>

                      <Droppable droppableId={`items:${g.id}`} type="ITEM">
                        {(iDrop, iSnap) => (
                          <div
                            ref={iDrop.innerRef}
                            {...iDrop.droppableProps}
                            className={`space-y-1.5 min-h-[6px] rounded-md pl-1 ${iSnap.isDraggingOver ? "bg-accent-jade/5" : ""}`}
                          >
                            {g.items.map((item, i) => (
                              <Draggable key={`${g.id}-${i}`} draggableId={`item:${g.id}:${i}`} index={i}>
                                {(iDrag, iDragSnap) => (
                                  <div
                                    ref={iDrag.innerRef}
                                    {...iDrag.draggableProps}
                                    className={`flex items-start gap-1.5 rounded-md bg-white ${iDragSnap.isDragging ? "shadow-md ring-1 ring-accent-jade" : ""}`}
                                  >
                                    <span {...iDrag.dragHandleProps} className="p-0.5 mt-2 text-muted-foreground/50 hover:text-foreground cursor-grab" aria-label="Drag point">
                                      <GripVertical className="w-3.5 h-3.5" />
                                    </span>
                                    <ItemInput
                                      id={`gl-${g.id}-${i}`}
                                      value={item}
                                      onChange={(e) =>
                                        updateGroup(g.id, (x) => ({ ...x, items: x.items.map((v, j) => (j === i ? e.target.value : v)) }))
                                      }
                                      onKeyDown={
                                        multiline
                                          ? undefined
                                          : (e) => {
                                              if (e.key === "Enter") {
                                                e.preventDefault();
                                                updateGroup(g.id, (x) => {
                                                  const items = [...x.items];
                                                  items.splice(i + 1, 0, "");
                                                  return { ...x, items };
                                                });
                                                focusItem(g.id, i + 1);
                                              }
                                            }
                                      }
                                      placeholder={`${placeholder} ${i + 1}`}
                                      className={`flex-1 min-w-0 rounded-lg ${multiline ? "min-h-[70px]" : "h-9"}`}
                                      rows={multiline ? 3 : undefined}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => updateGroup(g.id, (x) => ({ ...x, items: x.items.filter((_, j) => j !== i) }))}
                                      className="mt-0.5 w-8 h-8 shrink-0 flex items-center justify-center rounded-lg text-muted-foreground/70 hover:bg-destructive/10 hover:text-destructive"
                                      aria-label="Remove point"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {iDrop.placeholder}
                          </div>
                        )}
                      </Droppable>
                      <button
                        type="button"
                        onClick={() => {
                          updateGroup(g.id, (x) => ({ ...x, items: [...x.items, ""] }));
                          focusItem(g.id, g.items.length);
                        }}
                        className="flex items-center gap-1 text-xs font-medium text-accent-jade hover:underline ml-6"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add {multiline ? "paragraph" : "point"}
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
        onClick={() => set([...list, newGroup()])}
        className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-border text-muted-foreground text-sm font-medium hover:bg-muted transition-colors"
      >
        <Plus className="w-4 h-4" /> Add sub-heading
      </button>
    </div>
  );
}