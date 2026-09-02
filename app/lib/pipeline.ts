/**
 * Document generation pipeline.
 * Supports multiple docTypes: BRD, PCR, PRD, SRS, FSD, TSD.
 * Sequential sections generation and streaming via async iterator.
 */

import { prisma } from "@/lib/db";
import { generateText, type Provider } from "@/lib/llm";
import {
  DOCUMENT_SECTIONS,
  buildSectionPrompt,
  buildSystemPrompt,
  type DocType,
} from "@/lib/prompts.ts";
import type { IntakeData } from "@/lib/intake-schema.ts";

export interface SectionEvent {
  type: "section";
  key: string;
  content: string;
  index: number;
  total: number;
}

export interface DoneEvent {
  type: "done";
  prdId: string;
  versionId: string;
}

export interface ErrorEvent {
  type: "error";
  message: string;
}

export type PrdEvent = SectionEvent | DoneEvent | ErrorEvent;

export async function* generatePrdStream({
  projectId,
  userId,
  intake,
  provider = "gemini",
  docType = "PRD",
}: {
  projectId: string;
  userId: string;
  intake: IntakeData;
  provider?: Provider;
  docType?: DocType;
}): AsyncGenerator<PrdEvent, void, void> {
  const system = buildSystemPrompt(intake, docType);
  const sections = DOCUMENT_SECTIONS[docType];

  // Create document (Prd) + version in DB
  const prd = await prisma.prd.create({
    data: {
      projectId,
      docType,
      status: "generating",
      versions: {
        create: {
          versionNo: 1,
          content: {} as object,
          createdBy: userId,
        },
      },
    },
    include: { versions: true },
  });
  const versionId = prd.versions[0].id;

  for (let i = 0; i < sections.length; i++) {
    const key = sections[i];
    try {
      const prompt = buildSectionPrompt(key, intake, docType);
      const result = await generateText({
        system,
        prompt,
        provider,
        maxTokens: 1500,
        temperature: 0.4,
      });

      // Persist section
      await prisma.prdSection.create({
        data: {
          versionId,
          key,
          content: result.text,
          orderIdx: i,
        },
      });

      const event: SectionEvent = {
        type: "section",
        key,
        content: result.text,
        index: i + 1,
        total: sections.length,
      };
      yield event;
    } catch (e) {
      const event: ErrorEvent = {
        type: "error",
        message: e instanceof Error ? e.message : "Generation failed",
      };
      yield event;
      return;
    }
  }

  // Mark Prd ready + set currentVersionId
  await prisma.prd.update({
    where: { id: prd.id },
    data: { status: "ready", currentVersionId: versionId },
  });

  const done: DoneEvent = { type: "done", prdId: prd.id, versionId };
  yield done;
}
