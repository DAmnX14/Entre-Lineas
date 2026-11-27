"use client";

export function FormStatus({ state }: { state: { error?: string; ok?: string } | undefined }) {
  if (!state) return null;
  if (state.error) return <p role="alert" className="rounded-lg bg-rose/60 p-3 text-sm">{state.error}</p>;
  if (state.ok) return <p role="status" className="rounded-lg bg-sage/70 p-3 text-sm">{state.ok}</p>;
  return null;
}
