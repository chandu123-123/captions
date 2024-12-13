export interface SRTSegment {
 
  start: number;
  end: number;
  text: string;
}

export function convertToUTF8(content: string): string {
  // Add UTF-8 BOM marker
  const utf8BOM = '\uFEFF';
  return utf8BOM + content;
}

export function formatSRTTimestamp(time: number): string {
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = Math.floor(time % 60);
  const milliseconds = Math.floor((time % 1) * 1000);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')},${String(milliseconds).padStart(3, '0')}`;
}

export function generateSRTContent(segments: SRTSegment[]): string {
  return segments
    .map((segment, index) => {
      return `${index + 1}\n${formatSRTTimestamp(segment.start)} --> ${formatSRTTimestamp(segment.end)}\n${segment.text}\n`;
    })
    .join('\n');
}