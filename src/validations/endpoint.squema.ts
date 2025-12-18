import { z } from 'zod';

export const PathSchema = z.string();

export const AsyncConfigSchema = z.object({
  enabled: z.boolean(),
  url: z.string().optional(), 
  method: z.string().optional(), 
  timeout: z.coerce.number().int().optional(), 
  retries: z.coerce.number().int().optional(), 
  retryDelay: z.coerce.number().int().optional(), 
  body: z.string().nullable().optional(),
  headers: z.record(z.string(), z.string()).optional(),
});


const SimpleProbabilitySchema = z.union([z.coerce.number(), z.coerce.string()]).optional();

export const ChaosConfigSchema = z.object({
  enabled: z.boolean().optional(),
  
  latency: z.coerce.number().int().nullable().optional(), 
  latencyProbability: SimpleProbabilitySchema, 

  abort: z.union([z.boolean(), z.coerce.number().int()]).nullable().optional(), 
  abortProbability: SimpleProbabilitySchema, 

  error: z.coerce.number().int().nullable().optional(), 
  errorProbability: SimpleProbabilitySchema,
  errorResponse: z.string().nullable().optional(),
});


export const EscenarioStateSchema = z.object({
  path: PathSchema, 
  method: z.string().optional(), 
  schema: z.string().nullable().optional(), 
  response: z.string().optional(), 
  status_code: z.coerce.number().int().optional(), 
  headers: z.record(z.string(), z.string()).optional(),
  async: AsyncConfigSchema.nullable().optional(),
  chaos_injection: ChaosConfigSchema.nullable().optional(),
});

export type EscenarioState = z.infer<typeof EscenarioStateSchema>;
export type AsyncConfig = z.infer<typeof AsyncConfigSchema>;
export type ChaosConfig = z.infer<typeof ChaosConfigSchema>;