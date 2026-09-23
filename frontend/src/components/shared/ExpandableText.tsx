"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";

interface ExpandableTextProps {
  text: string | number;
  className?: string;
  expandedClassName?: string;
  copyable?: boolean;
}

export function ExpandableText({
  text,
  className,
  expandedClassName,
  copyable = false
}: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const textStr = String(text ?? "");

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(textStr);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <span
      onClick={() => setIsExpanded(!isExpanded)}
      title={isExpanded ? "Click to collapse" : "Click to view full text"}
      className={cn(
        "cursor-pointer transition-all duration-200 inline-flex items-center gap-1 min-w-0 max-w-full",
        isExpanded
          ? cn(
              "whitespace-normal break-words bg-[#161F30] text-blue-300 px-1.5 py-0.5 rounded border border-[#1F2A3D]",
              expandedClassName
            )
          : cn("truncate hover:text-blue-400", className)
      )}
    >
      <span className={cn(isExpanded ? "break-words" : "truncate")}>{textStr}</span>
      {isExpanded && copyable && (
        <button
          type="button"
          onClick={handleCopy}
          className="p-0.5 ml-1 rounded hover:bg-sky-800/50 text-sky-400 shrink-0 inline-flex"
          title="Copy text"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
        </button>
      )}
    </span>
  );
}
