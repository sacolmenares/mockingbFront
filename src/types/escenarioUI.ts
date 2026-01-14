import type { Headers } from "../models/backendModels";

export interface AsyncItemUI {
  url?: string;
  body?: string;
  method?: string;
  headers?: Headers;
  async?: AsyncItemUI[];
}

export interface EscenarioUI {
  path: string;
  method: string;
  schema?: string;
  response: string;
  status_code: number;
  headers: Headers;

  async?: AsyncItemUI[];

  chaosInjection?: {
    enabled: boolean;
    latency?: number | null;
    latencyProbability?: string | null;
    abort?: number | boolean | null;
    abortProbability?: string | null;
    error?: number | null;
    errorProbability?: string | null;
    errorResponse?: string | null;
  };
}
