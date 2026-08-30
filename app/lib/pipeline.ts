/**
 * PRD generation pipeline.
 * MVP: in-process generation (no queue) — generate sequential sections
 * and emit progress via async iterator. Swap with Upstash Redis when scaling.
 */

import { prisma } from "@/lib/db";
import { generateText, type Provider } from "@/lib/llm";
import {
  PRD_SECTIONS,
  buildSectionPrompt,
  buildSystemPrompt,
  type PrdSectionKey,
} from "@/lib/prompts";
import type { IntakeData } from "@/lib/intake-schema";

export interface SectionEvent {
  type: "section";
  key: PrdSectionKey;
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
  provider = "moyra",
}: {
  projectId: string;
  userId: string;
  intake: IntakeData;
  provider?: Provider;
}): AsyncGenerator<PrdEvent, void, void> {
  const system = buildSystemPrompt(intake);

  // Create Prd + PrdVersion in DB
  const prd = await prisma.prd.create({
    data: {
      projectId,
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

  for (let i = 0; i < PRD_SECTIONS.length; i++) {
    const key = PRD_SECTIONS[i];
    try {
      const prompt = buildSectionPrompt(key, intake);
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
        total: PRD_SECTIONS.length,
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
