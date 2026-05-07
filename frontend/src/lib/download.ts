import { apiBase } from "./api";

export async function downloadWithAuth(opts: {
  path: string;
  token: string;
  filename?: string;
}) {
  const res = await fetch(`${apiBase()}${opts.path}`, {
    headers: { Authorization: `Bearer ${opts.token}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Download failed (${res.status}): ${text}`);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement("a");
    a.href = url;
    a.download = opts.filename ?? "download";
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}

