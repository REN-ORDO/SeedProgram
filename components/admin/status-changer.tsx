"use client";

import { useState } from "react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { Loader2, Check } from "lucide-react";
import { db } from "@/lib/firebase";
import { STATUS_META, type AppStatus } from "@/lib/admin-helpers";
import { cn } from "@/lib/utils";

const STATUSES: AppStatus[] = ["pending", "reviewed", "accepted", "rejected"];

export function StatusChanger({
  collectionName,
  docId,
  currentStatus,
  adminEmail,
}: {
  collectionName: "aspirantes" | "empresas";
  docId: string;
  currentStatus: AppStatus;
  adminEmail: string | null | undefined;
}) {
  const [updating, setUpdating] = useState<AppStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setStatus = async (next: AppStatus) => {
    if (next === currentStatus) return;
    setError(null);
    setUpdating(next);
    try {
      await updateDoc(doc(db, collectionName, docId), {
        status: next,
        updatedAt: serverTimestamp(),
        updatedBy: adminEmail ?? "unknown",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error";
      setError(msg);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div>
      <div className="mb-2 font-display text-xs font-semibold uppercase tracking-wider text-[var(--color-fg-muted)]">
        Cambiar estado
      </div>
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => {
          const meta = STATUS_META[s];
          const isCurrent = s === currentStatus;
          const isLoading = updating === s;
          return (
            <button
              key={s}
              onClick={() => setStatus(s)}
              disabled={!!updating || isCurrent}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border-2 border-[var(--color-ink)] px-3 py-1.5 font-display text-xs font-bold uppercase tracking-wider transition-all",
                isCurrent
                  ? "shadow-[3px_3px_0_var(--color-ink)] cursor-default"
                  : "shadow-none hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_var(--color-ink)] disabled:opacity-50 disabled:cursor-not-allowed",
              )}
              style={{ background: meta.bg, color: meta.text }}
            >
              {isLoading ? (
                <Loader2 size={12} className="animate-spin" />
              ) : isCurrent ? (
                <Check size={12} />
              ) : null}
              {meta.label}
            </button>
          );
        })}
      </div>
      {error && (
        <div className="mt-3 rounded-lg border-2 border-red-500 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
