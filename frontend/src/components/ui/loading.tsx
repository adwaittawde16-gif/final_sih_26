import React from "react";
import { Loader2 } from "lucide-react";

export function LoadingSpinner({ label = "Loading intelligence feeds..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      <p className="text-xs font-mono text-gray-400 tracking-wider uppercase animate-pulse">{label}</p>
    </div>
  );
}

export function Loading({ message }: { message?: string }) {
  return <LoadingSpinner label={message} />;
}

export function ErrorState({ title = "Failed to load intelligence data", message, onRetry }: { title?: string; message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-10 bg-red-950/20 border border-red-900/50 rounded-xl space-y-3 text-center my-6">
      <div className="w-10 h-10 rounded-full bg-red-900/40 flex items-center justify-center text-red-400 font-bold font-mono">!</div>
      <h4 className="text-sm font-bold text-red-300 uppercase tracking-wide">{title}</h4>
      {message && <p className="text-xs text-gray-400 max-w-md font-mono">{message}</p>}
      {onRetry && (
        <button onClick={onRetry} className="mt-2 text-xs font-mono bg-red-900/40 hover:bg-red-800/60 text-red-200 px-3 py-1.5 rounded-md border border-red-700 transition-colors">
          Retry Request
        </button>
      )}
    </div>
  );
}
