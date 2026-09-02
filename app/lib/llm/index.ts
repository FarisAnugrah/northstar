import { checkCircuit, recordSuccess, recordFailure } from "./circuit-breaker";
/**
 * LLM client abstraction — supports Anthropic Claude + OpenAI GPT + OpenAI-compatible aggregators (Moyra, OpenRouter).
 * Single interface so the worker can switch providers easily.
 */

export type Provider = "claude" | "openai" | "moyra" | "gemini";

export interface GenerateOptions {
  system: string;
  prompt: string;
  provider?: Provider;
  maxTokens?: number;
  temperature?: number;
}

export interface GenerateResult {
  text: string;
  provider: Provider;
  usage: { inputTokens: number; outputTokens: number };
}

export async function generateText({
  system,
  prompt,
  provider = "claude",
  maxTokens = 2000,
  temperature = 0.4,
}: GenerateOptions): Promise<GenerateResult> {
  await checkCircuit(provider);
  
  try {
    let result: GenerateResult;
    if (provider === "openai") {
      result = await generateOpenAI({ system, prompt, maxTokens, temperature });
    } else if (provider === "moyra") {
      result = await generateMoyra({ system, prompt, maxTokens, temperature });
    } else if (provider === "gemini") {
      result = await generateGemini({ system, prompt, maxTokens, temperature });
    } else {
      result = await generateClaude({ system, prompt, maxTokens, temperature });
    }
    
    await recordSuccess(provider);
    return result;
  } catch (error) {
    await recordFailure(provider);
    throw error;
  }
}

async function generateClaude({
  system,
  prompt,
  maxTokens,
  temperature,
}: Omit<GenerateOptions, "provider">): Promise<GenerateResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      temperature,
      system,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API error ${res.status}: ${err.slice(0, 300)}`);
  }

  const data = await res.json();
  const text = data.content
    .filter((b: { type: string }) => b.type === "text")
    .map((b: { text: string }) => b.text)
    .join("\n");

  return {
    text,
    provider: "claude",
    usage: {
      inputTokens: data.usage?.input_tokens ?? 0,
      outputTokens: data.usage?.output_tokens ?? 0,
    },
  };
}

async function generateOpenAI({
  system,
  prompt,
  maxTokens,
  temperature,
}: Omit<GenerateOptions, "provider">): Promise<GenerateResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not set");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      max_tokens: maxTokens,
      temperature,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${err.slice(0, 300)}`);
  }

  const data = await res.json();
  return {
    text: data.choices?.[0]?.message?.content ?? "",
    provider: "openai",
    usage: {
      inputTokens: data.usage?.prompt_tokens ?? 0,
      outputTokens: data.usage?.completion_tokens ?? 0,
    },
  };
}

async function generateMoyra({
  system,
  prompt,
  maxTokens,
  temperature,
}: Omit<GenerateOptions, "provider">): Promise<GenerateResult> {
  const apiKey = process.env.MOYRA_API_KEY;
  const baseUrl = process.env.MOYRA_BASE_URL ?? "https://api.moyra.my.id/v1";
  const model = process.env.MOYRA_MODEL ?? "anthropic/claude-sonnet-4";
  if (!apiKey) throw new Error("MOYRA_API_KEY not set");

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Moyra API error ${res.status}: ${err.slice(0, 300)}`);
  }

  const data = await res.json();
  const text =
    data.choices?.[0]?.message?.content ??
    data.content
      ?.filter((b: { type: string }) => b.type === "text")
      .map((b: { text: string }) => b.text)
      .join("\n") ??
    "";

  return {
    text,
    provider: "moyra",
    usage: {
      inputTokens: data.usage?.prompt_tokens ?? data.usage?.input_tokens ?? 0,
      outputTokens:
        data.usage?.completion_tokens ?? data.usage?.output_tokens ?? 0,
    },
  };
}

async function generateGemini({
  system,
  prompt,
  maxTokens,
  temperature,
}: Omit<GenerateOptions, "provider">): Promise<GenerateResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  // Format system prompt and user prompt
  const combinedPrompt = system ? `System: ${system}\n\nUser: ${prompt}` : prompt;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: combinedPrompt }]
        }
      ],
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: temperature,
      }
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err.slice(0, 300)}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  return {
    text,
    provider: "gemini",
    usage: {
      inputTokens: data.usageMetadata?.promptTokenCount ?? 0,
      outputTokens: data.usageMetadata?.candidatesTokenCount ?? 0,
    },
  };
}
