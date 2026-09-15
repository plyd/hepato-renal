/**
 * Détection minimale d'EXIF dans un JPEG : présence d'un segment APP1 "Exif"
 * et lecture du tag 0x010F (Make, fabricant de l'appareil photo).
 * Une photo de téléphone porte presque toujours un Make ; un export d'échographe
 * ou une capture d'écran n'en porte pas. Sert à forcer le mode « photo ».
 */
export interface ExifSniff {
  isJpeg: boolean;
  hasExif: boolean;
  make?: string;
  model?: string;
}

export function sniffJpeg(bytes: Uint8Array): ExifSniff {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return { isJpeg: false, hasExif: false };
  let off = 2;
  while (off + 4 <= bytes.length) {
    if (bytes[off] !== 0xff) return { isJpeg: true, hasExif: false };
    const marker = bytes[off + 1];
    if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) { off += 2; continue; }
    if (marker === 0xda || marker === 0xd9) break; // SOS / EOI : fin des en-têtes
    const len = (bytes[off + 2] << 8) | bytes[off + 3];
    if (len < 2) break;
    if (marker === 0xe1 && off + 10 <= bytes.length) {
      const sig = String.fromCharCode(bytes[off + 4], bytes[off + 5], bytes[off + 6], bytes[off + 7]);
      if (sig === "Exif") {
        const tiff = off + 10;
        const parsed = parseTiff(bytes, tiff, Math.min(bytes.length, off + 2 + len));
        return { isJpeg: true, hasExif: true, ...parsed };
      }
    }
    off += 2 + len;
  }
  return { isJpeg: true, hasExif: false };
}

function parseTiff(b: Uint8Array, base: number, end: number): { make?: string; model?: string } {
  if (base + 8 > end) return {};
  const le = b[base] === 0x49 && b[base + 1] === 0x49;
  const be = b[base] === 0x4d && b[base + 1] === 0x4d;
  if (!le && !be) return {};
  const u16 = (o: number) => (le ? b[o] | (b[o + 1] << 8) : (b[o] << 8) | b[o + 1]);
  const u32 = (o: number) => (le ? (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0 : ((b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]) >>> 0);
  if (u16(base + 2) !== 42) return {};
  const ifd = base + u32(base + 4);
  if (ifd + 2 > end) return {};
  const count = u16(ifd);
  const out: { make?: string; model?: string } = {};
  for (let i = 0; i < count; i++) {
    const e = ifd + 2 + i * 12;
    if (e + 12 > end) break;
    const tag = u16(e), type = u16(e + 2), n = u32(e + 4);
    if ((tag === 0x010f || tag === 0x0110) && type === 2 && n > 0) {
      const off = n <= 4 ? e + 8 : base + u32(e + 8);
      if (off + n > end) continue;
      let s = "";
      for (let k = 0; k < n; k++) { const c = b[off + k]; if (c === 0) break; s += String.fromCharCode(c); }
      if (tag === 0x010f) out.make = s.trim(); else out.model = s.trim();
    }
  }
  return out;
}
