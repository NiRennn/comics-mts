type PreloadResult = { src: string; ok: boolean };

const loaded = new Set<string>();
const pending = new Map<string, Promise<PreloadResult>>();

function preloadSrc(src: string): Promise<PreloadResult> {
  if (loaded.has(src)) {
    return Promise.resolve({ src, ok: true });
  }

  const existing = pending.get(src);
  if (existing) return existing;

  const promise = new Promise<PreloadResult>((resolve) => {
    const img = new Image();

    img.onload = () => {
      loaded.add(src);
      pending.delete(src);
      resolve({ src, ok: true });
    };

    img.onerror = () => {
      pending.delete(src);
      resolve({ src, ok: false });
    };

    img.src = src;
  });

  pending.set(src, promise);
  return promise;
}

export function preloadImageSrcs(srcs: readonly string[]) {
  const unique = Array.from(new Set(srcs));
  return Promise.all(unique.map(preloadSrc));
}