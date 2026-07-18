import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/** Junta classes ignorando valores vazios. */
export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

// ---------------------------------------------------------------------------
// Marca VALENLOG (wordmark) — "VALEN" (azul) + "LOG" (laranja)
// ---------------------------------------------------------------------------
export function Logo({
  tone = "onDark",
  tagline = false,
  size = "md",
}: {
  tone?: "onDark" | "onLight";
  tagline?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const valenCor = tone === "onDark" ? "text-white" : "text-brand-800";
  const taglineCor = tone === "onDark" ? "text-slate-400" : "text-slate-500";
  const tam =
    size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-xl";
  return (
    <span className="inline-flex flex-col leading-none">
      <span className={cx("font-extrabold tracking-tight", tam)}>
        <span className={valenCor}>VALEN</span>
        <span className="text-accent-500">LOG</span>
      </span>
      {tagline && (
        <span
          className={cx(
            "mt-1 text-[9px] font-semibold uppercase tracking-[0.22em]",
            taglineCor,
          )}
        >
          Logística e Triagem
        </span>
      )}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Botão (helper de classes — usável em <button>, <Link> e <a>)
// ---------------------------------------------------------------------------
type Variant = "primary" | "secondary" | "ghost" | "danger" | "success";
type Size = "sm" | "md";

const VARIANTES: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 border border-transparent",
  secondary:
    "bg-white text-slate-700 hover:bg-slate-50 border border-slate-300",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 border border-transparent",
  danger: "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200",
  success:
    "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200",
};

const TAMANHOS: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-4 py-2.5 text-sm rounded-lg",
};

export function btn(variant: Variant = "primary", size: Size = "md"): string {
  return cx(
    "inline-flex items-center justify-center gap-1.5 font-medium transition disabled:opacity-60 disabled:pointer-events-none",
    VARIANTES[variant],
    TAMANHOS[size],
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button className={cx(btn(variant, size), className)} {...props} />;
}

// ---------------------------------------------------------------------------
// Card / superfície
// ---------------------------------------------------------------------------
export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cx(
        "rounded-2xl border border-slate-200 bg-white shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cabeçalho de página (voltar, título, subtítulo, ações)
// ---------------------------------------------------------------------------
export function PageHeader({
  titulo,
  subtitulo,
  voltarHref,
  voltarLabel = "Voltar",
  acoes,
}: {
  titulo: ReactNode;
  subtitulo?: ReactNode;
  voltarHref?: string;
  voltarLabel?: string;
  acoes?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        {voltarHref && (
          <Link
            href={voltarHref}
            className="text-sm text-brand-600 hover:underline"
          >
            ← {voltarLabel}
          </Link>
        )}
        <h1 className="truncate text-2xl font-semibold text-slate-800">
          {titulo}
        </h1>
        {subtitulo && <p className="text-slate-500">{subtitulo}</p>}
      </div>
      {acoes && <div className="flex flex-wrap gap-2">{acoes}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// StatCard (KPI)
// ---------------------------------------------------------------------------
type Tone = "brand" | "slate" | "green" | "amber" | "red";

const TONE_TEXT: Record<Tone, string> = {
  brand: "text-brand-700",
  slate: "text-slate-800",
  green: "text-green-700",
  amber: "text-amber-600",
  red: "text-red-600",
};

export function StatCard({
  label,
  valor,
  emoji,
  tone = "slate",
  href,
  hint,
}: {
  label: string;
  valor: ReactNode;
  emoji?: string;
  tone?: Tone;
  href?: string;
  hint?: string;
}) {
  const conteudo = (
    <>
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">{label}</span>
        {emoji && <span className="text-lg">{emoji}</span>}
      </div>
      <p
        className={cx("mt-1 text-3xl font-bold tabular-nums", TONE_TEXT[tone])}
      >
        {valor}
      </p>
      {hint && <p className="mt-0.5 text-xs text-slate-400">{hint}</p>}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md"
      >
        {conteudo}
      </Link>
    );
  }
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {conteudo}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Badge
// ---------------------------------------------------------------------------
const BADGE_TONE: Record<Tone, string> = {
  brand: "bg-brand-50 text-brand-700",
  slate: "bg-slate-100 text-slate-600",
  green: "bg-green-50 text-green-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-600",
};

export function Badge({
  children,
  tone = "slate",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium",
        BADGE_TONE[tone],
      )}
    >
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Alert (feedback / avisos)
// ---------------------------------------------------------------------------
const ALERT_TONE: Record<"info" | "success" | "warning" | "danger", string> = {
  info: "border-brand-200 bg-brand-50 text-brand-700",
  success: "border-green-200 bg-green-50 text-green-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  danger: "border-red-200 bg-red-50 text-red-600",
};

export function Alert({
  children,
  tone = "info",
}: {
  children: ReactNode;
  tone?: "info" | "success" | "warning" | "danger";
}) {
  return (
    <div
      className={cx("rounded-lg border px-3 py-2 text-sm", ALERT_TONE[tone])}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// EmptyState
// ---------------------------------------------------------------------------
export function EmptyState({
  emoji = "📭",
  titulo,
  descricao,
  acao,
}: {
  emoji?: string;
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <div className="mb-3 text-4xl">{emoji}</div>
      <p className="font-medium text-slate-700">{titulo}</p>
      {descricao && <p className="mt-1 text-sm text-slate-500">{descricao}</p>}
      {acao && <div className="mt-4 flex justify-center">{acao}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Campos de formulário
// ---------------------------------------------------------------------------
const INPUT_BASE =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none transition focus:border-brand-500 disabled:bg-slate-50 disabled:text-slate-500";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-slate-700">
        {label}
        {hint && (
          <span className="ml-1 font-normal text-slate-400">{hint}</span>
        )}
      </span>
      {children}
    </label>
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cx(INPUT_BASE, className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cx(INPUT_BASE, className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cx(INPUT_BASE, className)} {...props} />;
}
