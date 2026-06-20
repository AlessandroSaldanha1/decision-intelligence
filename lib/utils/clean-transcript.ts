/**
 * Strips WEBVTT formatting (headers, cue IDs, timestamps) from a raw VTT string.
 * Returns plain text with just the spoken words. If input is not VTT, returns as-is.
 */
export function cleanTranscript(raw: string): string {
  if (!raw || !raw.trimStart().startsWith('WEBVTT')) return raw

  const lines = raw.split('\n')
  const cleaned: string[] = []

  for (const line of lines) {
    const t = line.trim()
    if (!t) continue
    if (t === 'WEBVTT') continue
    // Timestamp line: "00:00:00.000 --> 00:00:00.000" or "00:00.000 --> 00:00.000"
    if (/^\d{1,2}:\d{2}[:.]\d{2,3}(\.\d+)?\s*-->\s*\d{1,2}:\d{2}[:.]\d{2,3}/.test(t)) continue
    // Cue identifier (only digits)
    if (/^\d+$/.test(t)) continue
    // Cue identifier with format like "NOTE" lines
    if (/^NOTE\b/.test(t)) continue
    cleaned.push(t)
  }

  return cleaned.join(' ').replace(/\s{2,}/g, ' ').trim()
}
