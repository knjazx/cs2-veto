/**
 * LobbyInfo — shows the invite link for Team A to share with Team B.
 */
import { useState } from "react";

export default function LobbyInfo({ roomId }) {
  const [copied, setCopied] = useState(false);

  const link = `${window.location.origin}/room/${roomId}?team=B`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback — select input text
    }
  }

  return (
    <div className="w-full border border-border px-4 py-4">
      <p className="text-xs text-muted tracking-widest uppercase mb-2">
        Пригласить соперника
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          readOnly
          value={link}
          className="flex-1 bg-transparent border border-border px-3 py-2 text-xs text-muted
                     focus:outline-none focus:border-fg truncate"
        />
        <button
          onClick={handleCopy}
          className="border border-border px-4 py-2 text-xs tracking-widest uppercase
                     hover:border-fg hover:text-fg transition-colors duration-150 shrink-0"
        >
          {copied ? "✓ Скопировано" : "Копировать"}
        </button>
      </div>
    </div>
  );
}
