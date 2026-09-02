import { redis } from "../redis/client";
import { Provider } from "./index";

const ERROR_THRESHOLD = 5; // Number of consecutive errors before tripping
const RECOVERY_TIMEOUT_MS = 60000; // 1 minute before trying again

export class CircuitBreakerError extends Error {
  constructor(provider: Provider) {
    super(`Circuit breaker tripped for provider: ${provider}`);
    this.name = "CircuitBreakerError";
  }
}

/**
 * Checks if a provider's circuit is open (tripped).
 * Throws CircuitBreakerError if open.
 */
export async function checkCircuit(provider: Provider): Promise<void> {
  // If Upstash isn't configured, bypass gracefully
  if (!process.env.UPSTASH_REDIS_REST_URL) return;

  const key = `cb:llm:${provider}:errors`;
  const errors = await redis.get<number>(key);
  
  if (errors && errors >= ERROR_THRESHOLD) {
    throw new CircuitBreakerError(provider);
  }
}

/**
 * Records a successful call, resetting the error count.
 */
export async function recordSuccess(provider: Provider): Promise<void> {
  if (!process.env.UPSTASH_REDIS_REST_URL) return;
  const key = `cb:llm:${provider}:errors`;
  await redis.del(key);
}

/**
 * Records a failure, incrementing the error count.
 */
export async function recordFailure(provider: Provider): Promise<void> {
  if (!process.env.UPSTASH_REDIS_REST_URL) return;
  const key = `cb:llm:${provider}:errors`;
  
  // Atomic increment and set expiry if it's the first error
  const tx = redis.multi();
  tx.incr(key);
  tx.pexpire(key, RECOVERY_TIMEOUT_MS);
  await tx.exec();
}
