import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { toDocx, toMarkdown, toPdf } from "@/lib/export";

const metaSchema = z.object({
  docType: z.string().default("BUSINESS REQUIREMENT DOCUMENT"),
  version: z.string().default("1.0"),
  company: z.string().default("Company Name"),
  team: z.array(z.string()).default([]),
  productName: z.string().default("Product Name"),
  division: z.string().default("Division"),
});

const bodySchema = z.object({
  title: z.string().min(1),
  format: z.enum(["markdown", "docx", "pdf"]),
  sections: z
    .array(z.object({ key: z.string(), content: z.string() }))
    .min(1),
  meta: metaSchema.optional(),
});

const MIME: Record<string, string> = {
  markdown: "text/markdown",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pdf: "application/pdf",
};

const EXT: Record<string, string> = {
  markdown: "md",
  docx: "docx",
  pdf: "pdf",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((i) => i.message).join(", ") },
        { status: 400 },
      );
    }

    const { title, format, sections, meta } = parsed.data;
    const filename = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.${EXT[format]}`;

    if (format === "markdown") {
      const content = toMarkdown({ title, sections, meta: meta! });
      return new NextResponse(content, {
        headers: {
          "Content-Type": MIME[format],
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    if (format === "docx") {
      const buf = await toDocx({ title, sections, meta: meta! });
      return new NextResponse(new Uint8Array(buf), {
        headers: {
          "Content-Type": MIME[format],
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    if (format === "pdf") {
      const buf = await toPdf({ title, sections, meta: meta! });
      return new NextResponse(new Uint8Array(buf), {
        headers: {
          "Content-Type": MIME[format],
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
  } catch (e) {
    console.error("export error", e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
