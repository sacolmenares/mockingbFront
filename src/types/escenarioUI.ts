import type { Headers } from "../models/backendModels";

export interface EscenarioUI {
  path: string;
  method: string;
  schema?: string;
  response: string;
  statusCode: number;
  headers: Headers;

  async?: {
    enabled: boolean;
    url?: string;
    body?: string;
    method?: string;
    headers?: Headers;
    timeout?: number;
    retries?: number;
    retryDelay?: number;
  };

  chaosInjection?: {
    enabled: boolean;
    latency?: number | null;
    latencyProbability?: string | null;
    abort?: number | boolean | null;
    abortProbability?: string | null;
    error?: number | null;
    errorProbability?: string | null;
  };
}
