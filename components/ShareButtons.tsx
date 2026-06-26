"use client";

import { useState } from "react";

export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);

  async function nativeShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        /* uživatel zrušil */
      }
    } else {
      copy();
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  const btn =
    "flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50";

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold text-slate-500">Sdílet:</span>

      <button onClick={nativeShare} className={`${btn} sm:hidden`}>
        📤 Sdílet
      </button>

      <a className={btn} href={`https://www.facebook.com/sharer/sharer.php?u=${u}`} target="_blank" rel="noopener noreferrer">
        <span className="font-bold text-[#1877F2]">f</span> Facebook
      </a>
      <a className={btn} href={`https://x.com/intent/tweet?url=${u}&text=${t}`} target="_blank" rel="noopener noreferrer">
        𝕏 Tweet
      </a>
      <a className={btn} href={`https://api.whatsapp.com/send?text=${t}%20${u}`} target="_blank" rel="noopener noreferrer">
        🟢 WhatsApp
      </a>
      <a className={btn} href={`mailto:?subject=${t}&body=${u}`}>
        ✉️ E-mail
      </a>
      <button onClick={copy} className={btn}>
        {copied ? "✅ Zkopírováno" : "🔗 Kopírovat odkaz"}
      </button>
    </div>
  );
}
