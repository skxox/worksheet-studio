"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sheet } from "@/components/common/Sheet";
import type { CopybookType } from "@/types";

const TONE_VOWELS = [
  "ā",
  "á",
  "ǎ",
  "à",
  "ē",
  "é",
  "ě",
  "è",
  "ī",
  "í",
  "ǐ",
  "ì",
  "ō",
  "ó",
  "ǒ",
  "ò",
  "ū",
  "ú",
  "ǔ",
  "ù",
  "ǖ",
  "ǘ",
  "ǚ",
  "ǜ",
];

export function CopybookContentModal({
  open,
  title,
  type,
  placeholder,
  draftContent,
  onClose,
  onDraftChange,
  onSave,
}: {
  open: boolean;
  title: string;
  type: CopybookType;
  placeholder: string;
  draftContent: string;
  onClose: () => void;
  onDraftChange: (value: string) => void;
  onSave: () => void;
}) {
  const modalHeading = "编辑内容";
  const modalSubheading = title;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertToneVowel = (vowel: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const nextContent =
      draftContent.slice(0, start) + vowel + draftContent.slice(end);
    onDraftChange(nextContent);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + vowel.length, start + vowel.length);
    });
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      side="center"
      ariaLabel="编辑内容"
      panelClassName="max-w-2xl"
    >
      <div className="border-border/50 flex items-center justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0">
          <div className="text-foreground truncate text-base font-semibold">
            {modalHeading}
          </div>
          <div className="text-muted-foreground truncate text-xs">
            {modalSubheading}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            取消
          </Button>
          <Button size="sm" onClick={onSave}>
            保存
          </Button>
        </div>
      </div>
      <div className="p-4">
        {type === "pinyin" ? (
          <div className="mb-3">
            <div className="text-muted-foreground mb-2 text-xs">
              点击插入带声调韵母
            </div>
            <div className="flex flex-wrap gap-1.5">
              {TONE_VOWELS.map((vowel) => (
                <Button
                  key={vowel}
                  type="button"
                  variant="outline"
                  size="sm"
                  aria-label={`插入拼音 ${vowel}`}
                  onClick={() => insertToneVowel(vowel)}
                  className="h-8 min-w-8 px-2"
                >
                  {vowel}
                </Button>
              ))}
            </div>
          </div>
        ) : null}
        <Textarea
          ref={textareaRef}
          value={draftContent}
          onChange={(e) => onDraftChange(e.target.value)}
          rows={type === "paragraph" || type === "english-para" ? 10 : 6}
          placeholder={placeholder}
          className="border-input bg-background placeholder:text-muted-foreground shadow-1 w-full resize-none rounded-lg border px-3 py-2 text-base transition-[color,box-shadow] md:text-sm"
        />
      </div>
    </Sheet>
  );
}
