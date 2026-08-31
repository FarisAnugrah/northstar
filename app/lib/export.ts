/**
 * Export utilities for PRD/BRD documents.
 * Corporate-formal template (bank/BUMN style but general):
 * - Cover page (title, doc type checkboxes, company info, team, version)
 * - Repeating header (doc title + page no) / footer
 * - 2-level black bold headings (A. / 1.)
 * - Justified Arial body
 * - Full-grid tables with blue (#2E75B6) header, white bold text
 *
 * Supports Markdown, DOCX (real tables + header/footer/cover), and PDF.
 */

import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  Packer,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  Tab,
  TabStopType,
  TabStopPosition,
  TextRun,
  WidthType,
} from "docx";
import PDFDocument from "pdfkit";
import { SECTION_LABELS } from "./prompts.ts";

// ---- Corporate theme ----
const COLORS = {
  headerBlue: "2E75B6", // table header bg
  labelBlue: "DEEBF7", // left label column shading
  headerGray: "F2F2F2",
  borderGray: "808080",
  black: "000000",
  white: "FFFFFF",
};

const FONT = "Arial";

export interface ExportSection {
  key: string;
  content: string;
}

export interface ExportMeta {
  /** Document type, e.g. "BRD", "PRD", "SRS" */
  docType: string;
  /** Document version, e.g. "1.0" */
  version: string;
  /** Company / organization name */
  company: string;
  /** Team members, e.g. ["Faris Anugrah", "Aji"] */
  team: string[];
  /** Product / application name */
  productName: string;
  /** Division / department */
  division: string;
}

export interface ExportContext {
  title: string;
  sections: ExportSection[];
  meta?: ExportMeta;
}

const defaultMeta: ExportMeta = {
  docType: "BUSINESS REQUIREMENT DOCUMENT",
  version: "1.0",
  company: "Company Name",
  team: [],
  productName: "Product Name",
  division: "Division",
};

/**
 * Normalize text so non-WinAnsi characters render in PDF (Helvetica Type 1)
 * and stay clean in DOCX. Replaces typographic punctuation with ASCII.
 */
export function normalizeText(text: string): string {
  return text
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2013\u2014\u2015]/g, "-")
    .replace(/[\u2022\u2023\u2043]/g, "*")
    .replace(/\u2026/g, "...")
    .replace(/\u2192/g, "->")
    .replace(/\u2190/g, "<-")
    .replace(/\u2264/g, "<=")
    .replace(/\u2265/g, ">=")
    .replace(/\u00A0/g, " ");
}

/** Strip inline markdown markers (**, *, `, links) and normalize typography. */
export function stripInline(text: string): string {
  return normalizeText(
    text
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"),
  );
}

// ---- Markdown ----
export function toMarkdown({ title, sections, meta = defaultMeta }: ExportContext): string {
  const header = `# ${meta.docType}\n\n## ${title}\n`;
  const body = sections
    .map((s) => s.content.trim())
    .filter(Boolean)
    .join("\n\n");
  return `${header}\n\n${body}\n`;
}

// ================= DOCX =================

function docxBodyParagraph(text: string, opts?: { bullet?: boolean; bold?: boolean }): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, bold: opts?.bold, font: FONT, size: 22 })],
    alignment: AlignmentType.JUSTIFIED,
    bullet: opts?.bullet ? { level: 0 } : undefined,
    spacing: { line: 276, after: 120 }, // ~1.15 line spacing
  });
}

function docxHeading1(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, font: FONT, size: 30 })], // 15pt
    spacing: { before: 360, after: 180 },
    keepNext: true,
  });
}

function docxHeading2(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, font: FONT, size: 26 })], // 13pt
    spacing: { before: 260, after: 140 },
    keepNext: true,
  });
}

function docxHeading3(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, font: FONT, size: 24 })], // 12pt
    spacing: { before: 200, after: 100 },
    keepNext: true,
  });
}

function makeDocxCell(text: string, opts?: { isHeader?: boolean; isLabel?: boolean; bold?: boolean }): TableCell {
  return new TableCell({
    shading:
      opts?.isHeader ? { type: ShadingType.CLEAR, fill: COLORS.headerBlue, color: COLORS.white }
      : opts?.isLabel ? { type: ShadingType.CLEAR, fill: COLORS.labelBlue, color: COLORS.black }
      : undefined,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    verticalAlign: "center",
    children: [
      new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [
          new TextRun({
            text: stripInline(text),
            bold: opts?.isHeader ?? opts?.bold ?? false,
            color: opts?.isHeader ? COLORS.white : COLORS.black,
            font: FONT,
            size: 22,
          }),
        ],
      }),
    ],
  });
}

const gridBorders = {
  top: { style: BorderStyle.SINGLE, size: 4, color: COLORS.borderGray },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: COLORS.borderGray },
  left: { style: BorderStyle.SINGLE, size: 4, color: COLORS.borderGray },
  right: { style: BorderStyle.SINGLE, size: 4, color: COLORS.borderGray },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: COLORS.borderGray },
  insideVertical: { style: BorderStyle.SINGLE, size: 4, color: COLORS.borderGray },
};

function buildDocxTable(header: string[], rows: string[][], opts?: { labelCol?: boolean }): Table {
  const rowEls: TableRow[] = [];
  rowEls.push(
    new TableRow({
      tableHeader: true,
      children: header.map((c, ci) => makeDocxCell(c, { isHeader: true, isLabel: ci === 0 && !!opts?.labelCol })),
    }),
  );
  for (const row of rows) {
    rowEls.push(
      new TableRow({
        children: row.map((c, ci) => makeDocxCell(c, { isLabel: ci === 0 && !!opts?.labelCol })),
      }),
    );
  }
  return new Table({
    rows: rowEls,
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: gridBorders,
  });
}

/** Map markdown content (sections) into docx block elements with corporate styling. */
function parseSectionBlocks(content: string): (Paragraph | Table)[] {
  const blocks: (Paragraph | Table)[] = [];
  const lines = content.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    i++;
    if (!line) continue;

    if (line.startsWith("|") && i < lines.length && /^\s*\|?[\s\-:|]+\|?\s*$/.test(lines[i])) {
      const header = line.split("|").slice(1, -1).map((c) => c.trim());
      i++; // separator
      const bodyRows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const row = lines[i].trim().split("|").slice(1, -1).map((c) => c.trim());
        if (row.some((c) => !/^[-:]+$/.test(c))) bodyRows.push(row);
        i++;
      }
      blocks.push(buildDocxTable(header, bodyRows));
      continue;
    }

    if (line.startsWith("### ")) blocks.push(docxHeading3(stripInline(line.slice(4))));
    else if (line.startsWith("## ")) blocks.push(docxHeading2(stripInline(line.slice(3))));
    else if (line.startsWith("# ")) blocks.push(docxHeading1(stripInline(line.slice(2))));
    else if (line.startsWith("- ") || line.startsWith("* ")) blocks.push(docxBodyParagraph(stripInline(line.slice(2)), { bullet: true }));
    else if (/^\d+\.\s/.test(line)) blocks.push(docxBodyParagraph(stripInline(line)));
    else blocks.push(docxBodyParagraph(stripInline(line)));
  }
  return blocks;
}

function docxCover(meta: ExportMeta): Paragraph[] {
  const p: Paragraph[] = [];

  // Title block (left aligned, uppercase)
  p.push(
    new Paragraph({
      children: [new TextRun({ text: meta.docType.toUpperCase(), bold: true, font: FONT, size: 36 })], // 18pt
      alignment: AlignmentType.LEFT,
      spacing: { after: 200 },
    }),
  );

  // Checkbox line (Type S / F / BRCPD italic)
  p.push(
    new Paragraph({
      children: [
        new TextRun({ text: "Type: [ ] S    [ ] F    [ ] BRCPD", italics: true, font: FONT, size: 22 }),
      ],
      spacing: { after: 400 },
    }),
  );

  // Center info block
  const centerInfo = [meta.productName, meta.company, meta.division];
  for (const line of centerInfo) {
    p.push(
      new Paragraph({
        children: [new TextRun({ text: line, bold: true, font: FONT, size: 28 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
      }),
    );
  }

  p.push(new Paragraph({ text: "", spacing: { after: 400 } }));

  // Team section
  p.push(
    new Paragraph({
      children: [new TextRun({ text: "Tim Penyusun", bold: true, font: FONT, size: 26 })],
      spacing: { after: 120 },
    }),
  );
  const team = meta.team.length ? meta.team : ["-"];
  for (const member of team) {
    p.push(docxBodyParagraph(member, { bullet: true }));
  }

  p.push(new Paragraph({ text: "", spacing: { after: 400 } }));

  // Version info (italic)
  p.push(
    new Paragraph({
      children: [new TextRun({ text: `Version: ${meta.version}`, italics: true, font: FONT, size: 22 })],
      spacing: { after: 60 },
    }),
  );
  p.push(
    new Paragraph({
      children: [new TextRun({ text: "Revision Date: ______________", italics: true, font: FONT, size: 22 })],
    }),
  );

  // Page break
  p.push(new Paragraph({ children: [new TextRun({ text: "", break: 1 })], pageBreakBefore: true }));

  return p;
}

function docxHeader(title: string): Header {
  return new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [
          new TextRun({ text: title.toUpperCase() + "   ", bold: true, font: FONT, size: 16 }),
          new TextRun({ text: "No. Registrasi: ____  Halaman: ", font: FONT, size: 16 }),
          new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16 }),
        ],
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: COLORS.borderGray } },
      }),
    ],
  });
}

function docxFooter(title: string): Footer {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [
          new TextRun({ text: `${title} - ${""}`, font: FONT, size: 16 }),
          new Tab(),
          new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16 }),
        ],
        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
      }),
    ],
  });
}

export async function toDocx({ title, sections, meta = defaultMeta }: ExportContext): Promise<Buffer> {
  const children: (Paragraph | Table)[] = [];

  // Cover page
  children.push(...docxCover(meta));

  // Body: each section labelled
  for (const s of sections) {
    if (!s.content.trim()) continue;
    const label = SECTION_LABELS[s.key] ?? s.key;
    children.push(docxHeading1(label));
    children.push(...parseSectionBlocks(s.content));
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: { margin: { top: 1100, bottom: 1100, left: 1000, right: 1000 } },
        },
        headers: { default: docxHeader(title) },
        footers: { default: docxFooter(title) },
        children,
      },
    ],
  });

  return Packer.toBuffer(doc);
}

// ================= PDF =================

export async function toPdf({ title, sections, meta = defaultMeta }: ExportContext): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 60, bufferPages: true });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // ---- Cover ----
    doc.fontSize(18).font("Helvetica-Bold").text(meta.docType.toUpperCase(), { align: "left" });
    doc.moveDown(0.3);
    doc.fontSize(11).font("Helvetica-Oblique").text("Type: [ ] S    [ ] F    [ ] BRCPD");
    doc.moveDown(2);

    doc.fontSize(14).font("Helvetica-Bold").text(meta.productName, { align: "center" });
    doc.fontSize(13).font("Helvetica-Bold").text(meta.company, { align: "center" });
    doc.fontSize(12).font("Helvetica-Bold").text(meta.division, { align: "center" });
    doc.moveDown(2);

    doc.fontSize(13).font("Helvetica-Bold").text("Tim Penyusun");
    doc.moveDown(0.2);
    const team = meta.team.length ? meta.team : ["-"];
    for (const member of team) {
      doc.fontSize(11).font("Helvetica").text("•  " + member, { indent: 12 });
    }
    doc.moveDown(2);

    doc.fontSize(11).font("Helvetica-Oblique").text(`Version: ${meta.version}`);
    doc.fontSize(11).font("Helvetica-Oblique").text("Revision Date: ______________");
    doc.addPage();

    // ---- Body ----
    const headingBlue = false;
    for (const s of sections) {
      if (!s.content.trim()) continue;
      const label = SECTION_LABELS[s.key] ?? s.key;
      doc.moveDown(0.4);
      doc.fontSize(15).font("Helvetica-Bold").fillColor("#000000").text(label);
      doc.moveDown(0.1);

      const lines = s.content.split("\n");
      let i = 0;
      while (i < lines.length) {
        const line = lines[i].trim();
        i++;
        if (!line) continue;

        if (line.startsWith("|") && i < lines.length && /^\s*\|?[\s\-:|]+\|?\s*$/.test(lines[i])) {
          const header = line.split("|").slice(1, -1).map((c) => c.trim());
          i++;
          const bodyRows: string[][] = [];
          while (i < lines.length && lines[i].trim().startsWith("|")) {
            const row = lines[i].trim().split("|").slice(1, -1).map((c) => c.trim());
            if (row.some((c) => !/^[-:]+$/.test(c))) bodyRows.push(row);
            i++;
          }
          drawPdfTable(doc, header, bodyRows);
          doc.moveDown(0.3);
          continue;
        }

        if (line.startsWith("### ")) {
          doc.fontSize(12).font("Helvetica-Bold").text(stripInline(line.slice(4)));
          doc.moveDown(0.1);
        } else if (line.startsWith("## ")) {
          doc.fontSize(14).font("Helvetica-Bold").text(stripInline(line.slice(3)));
          doc.moveDown(0.12);
        } else if (line.startsWith("# ")) {
          doc.fontSize(15).font("Helvetica-Bold").text(stripInline(line.slice(2)));
          doc.moveDown(0.15);
        } else if (line.startsWith("- ") || line.startsWith("* ")) {
          doc.fontSize(11).font("Helvetica").text("•  " + stripInline(line.slice(2)), { indent: 12 });
        } else if (/^\d+\.\s/.test(line)) {
          doc.fontSize(11).font("Helvetica").text(stripInline(line), { indent: 12 });
        } else {
          doc.fontSize(11).font("Helvetica").text(stripInline(line), { align: "justify", lineGap: 2 });
        }
      }
    }

    // ---- Repeating footer via bufferPages (page numbers) ----
    const pages = doc.bufferedPageRange();
    for (let p = pages.start; p < pages.start + pages.count; p++) {
      doc.switchToPage(p);
      doc.fontSize(8).font("Helvetica").fillColor("#555555").text(
        `${title} - ${meta.company}`,
        60,
        doc.page.height - 40,
        { lineBreak: false },
      );
      doc.text(String(p + 1), doc.page.width - 60 - 20, doc.page.height - 40, {
        lineBreak: false,
      });
    }

    doc.end();
  });
}

function drawPdfTable(doc: PDFKit.PDFDocument, header: string[], rows: string[][]): void {
  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const colWidth = pageWidth / Math.max(header.length, 1);
  const cellPadding = 4;
  const fontSize = 8.5;

  const measureRowHeight = (cells: string[]) =>
    Math.max(
      ...cells.map((c) => {
        const w = colWidth - cellPadding * 2;
        const chars = doc.font("Helvetica").fontSize(fontSize).widthOfString(stripInline(c), { lineBreak: false });
        const est = Math.max(1, Math.ceil(chars / (w / (fontSize * 0.6))));
        return est * fontSize * 1.4 + cellPadding * 2;
      }),
      20,
    );

  const drawRow = (cells: string[], isHeader: boolean) => {
    const rowH = measureRowHeight(cells);
    const rowY = doc.y;

    cells.forEach((_, ci) => {
      const x = doc.page.margins.left + ci * colWidth;
      if (isHeader) {
        doc.save().rect(x, rowY, colWidth, rowH).fill("#2E75B6").restore();
      } else {
        doc.save().rect(x, rowY, colWidth, rowH).fill("#FFFFFF").restore();
      }
    });

    cells.forEach((cell, ci) => {
      const x = doc.page.margins.left + ci * colWidth;
      doc
        .font(isHeader ? "Helvetica-Bold" : "Helvetica")
        .fontSize(fontSize)
        .fillColor(isHeader ? "#FFFFFF" : "#000000")
        .text(stripInline(cell), x + cellPadding, rowY + cellPadding, {
          width: colWidth - cellPadding * 2,
          lineBreak: true,
          height: rowH - cellPadding * 2,
        });
    });

    doc.y = rowY + rowH;
    doc
      .strokeColor("#808080")
      .lineWidth(0.4)
      .moveTo(doc.page.margins.left, doc.y)
      .lineTo(doc.page.margins.left + pageWidth, doc.y)
      .stroke();
  };

  drawRow(header, true);
  for (const row of rows) {
    drawRow(row, false);
  }
}
