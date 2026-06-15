"use client";

import { useEffect, useRef, useState } from "react";

export type ChatPickerOption = {
  kind: "tutor" | "model";
  id: string;
  label: string;
  group: string;
};

function optionKey(option: ChatPickerOption): string {
  return `${option.kind}:${option.id}`;
}

export function buildPickerOptions(
  tutors: Array<{ id: string; title: string }>,
  models: Array<{ id: string; label: string }>,
): ChatPickerOption[] {
  return [
    ...tutors.map((tutor) => ({
      kind: "tutor" as const,
      id: tutor.id,
      label: tutor.title,
      group: "Tutoren",
    })),
    ...models.map((model) => ({
      kind: "model" as const,
      id: model.id,
      label: model.label,
      group: "Modelle",
    })),
  ];
}

export function ModelTutorPicker({
  options,
  value,
  onChange,
}: {
  options: ChatPickerOption[];
  value: ChatPickerOption;
  onChange: (option: ChatPickerOption) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const groups = ["Tutoren", "Modelle"].flatMap((group) => {
    const items = options.filter((option) => option.group === group);
    return items.length > 0 ? [{ group, items }] : [];
  });

  return (
    <div className="model-picker" ref={rootRef}>
      <button
        type="button"
        className="model-picker-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="model-picker-label">{value.label}</span>
        <span className="model-picker-chevron" aria-hidden="true" />
      </button>

      {open ? (
        <div className="model-picker-menu" role="listbox">
          {groups.map(({ group, items }) => (
            <div key={group} className="model-picker-group">
              <span className="model-picker-group-label">{group}</span>
              {items.map((option) => (
                <button
                  key={optionKey(option)}
                  type="button"
                  role="option"
                  aria-selected={optionKey(option) === optionKey(value)}
                  className={
                    optionKey(option) === optionKey(value)
                      ? "model-picker-item active"
                      : "model-picker-item"
                  }
                  onClick={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
