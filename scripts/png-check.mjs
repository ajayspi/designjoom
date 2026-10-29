// PNG structure validator: walks the chunk stream and verifies every chunk's declared
// length fits and the stream ends on a complete IEND. Catches silent CRLF rewriting,
// which preserves the PNG signature but corrupts the data.
import { readFileSync } from "node:fs";

export function inspect(file) {
  const b = readFileSync(file);
  const out = { file, bytes: b.length, ok: true, problems: [] };
  const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (!sig.every((v, i) => b[i] === v)) {
    out.ok = false;
    out.problems.push("bad PNG signature");
    return out;
  }
  let i = 8, sawIEND = false, chunks = [];
  while (i + 8 <= b.length) {
    const len = b.readUInt32BE(i);
    const type = b.slice(i + 4, i + 8).toString("ascii");
    if (len > b.length || i + 12 + len > b.length) {
      out.ok = false;
      out.problems.push(`chunk ${type} declares ${len} bytes but only ${b.length - i - 12} remain`);
      break;
    }
    chunks.push(type);
    i += 12 + len;
    if (type === "IEND") { sawIEND = true; break; }
  }
  if (!sawIEND) { out.ok = false; out.problems.push("no IEND — stream is truncated"); }
  if (i !== b.length) out.problems.push(`${b.length - i} trailing bytes after last chunk`);
  out.chunks = chunks.length;
  out.firstChunks = chunks.slice(0, 5).join(",");
  out.lastChunk = chunks[chunks.length - 1];
  return out;
}

if (process.argv[2]) {
  for (const f of process.argv.slice(2)) {
    try {
      const r = inspect(f);
      console.log(
        `${r.ok ? "VALID  " : "INVALID"} ${String(r.bytes).padStart(8)} B  chunks=${String(r.chunks).padStart(3)}  ${f}`,
      );
      if (r.problems.length) console.log(`         -> ${r.problems.join("; ")}`);
    } catch (e) {
      console.log(`MISSING  ${f}: ${e.message}`);
    }
  }
}
