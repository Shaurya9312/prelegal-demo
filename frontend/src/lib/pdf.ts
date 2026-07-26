import { jsPDF } from "jspdf";
import { buildDownloadFilename, buildMutualNda, type MutualNdaFormValues } from "@/lib/mutual-nda";

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 54;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const BODY_SIZE = 10;

type Block =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "hr" }
  | { type: "table"; rows: string[][] }
  | { type: "paragraph"; text: string };

type Token = { text: string; bold: boolean; leadingSpace: boolean };

// buildMutualNda() already assembles the full agreement as markdown; rather than
// duplicate that content as structured PDF drawing calls, we parse the small subset
// of markdown it actually produces (headings, a table, hr, bold spans, paragraphs).
function parseMarkdownBlocks(markdown: string): Block[] {
  const lines = markdown.split("\n");
  const blocks: Block[] = [];
  let paragraphLines: string[] = [];
  let i = 0;

  const flushParagraph = () => {
    if (paragraphLines.length > 0) {
      blocks.push({ type: "paragraph", text: paragraphLines.join(" ").trim() });
      paragraphLines = [];
    }
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === "") {
      flushParagraph();
      i++;
      continue;
    }

    if (trimmed === "---") {
      flushParagraph();
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      blocks.push({ type: "heading", level: headingMatch[1].length as 1 | 2 | 3, text: headingMatch[2] });
      i++;
      continue;
    }

    if (trimmed.startsWith("|")) {
      flushParagraph();
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const rowText = lines[i].trim();
        if (!/^[|:\-\s]+$/.test(rowText)) {
          rows.push(rowText.split("|").slice(1, -1).map((cell) => cell.trim()));
        }
        i++;
      }
      blocks.push({ type: "table", rows });
      continue;
    }

    // Numbered clauses (e.g. the Standard Terms) are separated by single newlines,
    // not blank lines, so each one must start a fresh paragraph block itself.
    if (/^\d+\.\s/.test(trimmed)) {
      flushParagraph();
    }
    paragraphLines.push(trimmed);
    i++;
  }
  flushParagraph();

  return blocks;
}

// Splits "plain **bold** plain" into words, preserving bold state and whether each
// word had whitespace before it (so re-wrapping doesn't gain or lose spaces).
function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  const runs = text.split("**").map((segment, index) => ({ text: segment, bold: index % 2 === 1 }));

  for (const run of runs) {
    let pendingSpace = false;
    for (const piece of run.text.split(/(\s+)/)) {
      if (piece === "") continue;
      if (/^\s+$/.test(piece)) {
        pendingSpace = true;
        continue;
      }
      tokens.push({ text: piece, bold: run.bold, leadingSpace: pendingSpace });
      pendingSpace = false;
    }
  }

  return tokens;
}

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > PAGE_HEIGHT - MARGIN) {
    doc.addPage();
    return MARGIN;
  }
  return y;
}

function drawParagraph(
  doc: jsPDF,
  text: string,
  y: number,
  options: { fontSize: number; forceBold?: boolean; gapAfter: number },
): number {
  const { fontSize, forceBold = false, gapAfter } = options;
  const lineHeight = fontSize * 1.35;
  doc.setFontSize(fontSize);

  let x = MARGIN;
  let cursorY = ensureSpace(doc, y, lineHeight);

  for (const token of tokenize(text)) {
    const bold = forceBold || token.bold;
    doc.setFont("helvetica", bold ? "bold" : "normal");

    // Draw the leading space as part of the same text run (rather than as a bare
    // x-offset) so the space glyph actually lands in the PDF's content stream.
    const withLeadingSpace = token.leadingSpace && x > MARGIN;
    let renderText = withLeadingSpace ? ` ${token.text}` : token.text;
    let renderWidth = doc.getTextWidth(renderText);

    if (x + renderWidth > MARGIN + CONTENT_WIDTH) {
      cursorY = ensureSpace(doc, cursorY + lineHeight, lineHeight);
      x = MARGIN;
      renderText = token.text;
      renderWidth = doc.getTextWidth(renderText);
    }

    doc.text(renderText, x, cursorY);
    x += renderWidth;
  }

  return cursorY + lineHeight + gapAfter;
}

function drawTable(doc: jsPDF, rows: string[][], y: number): number {
  if (rows.length === 0) return y;

  const labelColWidth = 130;
  const partyColWidth = (CONTENT_WIDTH - labelColWidth) / 2;
  const colWidths = [labelColWidth, partyColWidth, partyColWidth];
  const rowHeight = 22;
  const fontSize = 9;

  doc.setFontSize(fontSize);
  let cursorY = y;

  for (const row of rows) {
    cursorY = ensureSpace(doc, cursorY, rowHeight);
    let x = MARGIN;
    row.forEach((cellText, columnIndex) => {
      const width = colWidths[columnIndex] ?? partyColWidth;
      doc.setDrawColor(200);
      doc.rect(x, cursorY, width, rowHeight);
      if (cellText) {
        doc.setFont("helvetica", "normal");
        doc.text(cellText, x + 5, cursorY + 14, { maxWidth: width - 10 });
      }
      x += width;
    });
    cursorY += rowHeight;
  }

  return cursorY + 12;
}

export function generateMutualNdaPdf(values: MutualNdaFormValues): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const blocks = parseMarkdownBlocks(buildMutualNda(values));

  let y = MARGIN;
  for (const block of blocks) {
    if (block.type === "heading") {
      const fontSize = block.level === 1 ? 18 : block.level === 2 ? 14 : 11;
      y = drawParagraph(doc, block.text, y, { fontSize, forceBold: true, gapAfter: 10 });
    } else if (block.type === "hr") {
      y = ensureSpace(doc, y, 16);
      doc.setDrawColor(180);
      doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
      y += 16;
    } else if (block.type === "table") {
      y = drawTable(doc, block.rows, y);
    } else {
      y = drawParagraph(doc, block.text, y, { fontSize: BODY_SIZE, gapAfter: 8 });
    }
  }

  return doc;
}

export function downloadMutualNdaPdf(values: MutualNdaFormValues): void {
  generateMutualNdaPdf(values).save(buildDownloadFilename(values).replace(/\.md$/, ".pdf"));
}
