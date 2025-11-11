import { z } from 'zod';


const JsonStringSchema = z.string().refine((val) => {
  // Permitir strings vacíos
  if (!val) return true; 
  try {
    JSON.parse(val);
    return true;
  } catch (e) {
    return false;
  }
}, { message: "El string debe ser un JSON válido" });



const ProbabilitySchema = z.coerce.number()
  .min(0, { message: "Debe ser >= 0" })
  .max(100, { message: "Debe ser <= 100" })
  .nullable()
  .optional();


  //Validación del path
export const PathSchema = z.string()
  .startsWith('/', { message: 'La ruta debe comenzar con "/"' })
  .refine(s => !s.includes(' '), { message: 'La ruta no puede contener espacios' })
  .refine(s => !s.includes('//'), { message: 'La ruta no puede tener barras consecutivas' })
  .refine(s => /^[a-zA-Z0-9\/:_-]*$/.test(s), { message: 'La ruta contiene caracteres inválidos' });



export const AsyncConfigSchema = z.object({
  enabled: z.boolean(),
  url: z.string().url({ message: "La URL de callback no es válida" }),
  method: z.string().min(1, "El método es requerido"),
  timeout: z.coerce.number().int().positive("El timeout debe ser positivo"),
  retries: z.coerce.number().int().positive("Los retries deben ser positivos"),
  retryDelay: z.coerce.number().int().positive("El delay debe ser positivo"),
  request: JsonStringSchema,
  headers: z.record(z.string(), z.string()),
});

export const ChaosConfigSchema = z.object({
  enabled: z.boolean(),
  
  latency: z.coerce.number().int().positive("Debe ser un número positivo").nullable(),
  latencyProbability: ProbabilitySchema,
  abort: z.union([
      z.boolean(), 
      z.coerce.number().int().min(100).max(599)
    ])
    .nullable(),
  abortProbability: ProbabilitySchema,

  error: z.coerce.number().int().min(100).max(599, "Código entre 100-599").nullable(),
  errorProbability: ProbabilitySchema,
});

export const EscenarioStateSchema = z.object({
  path: PathSchema, 
  method: z.string().min(1, "El método es requerido"),
  schema: JsonStringSchema.nullable().optional(),
  status_code: z.coerce.number().int().min(100, "Min 100").max(599, "Max 599"),
  headers: z.record(z.string(), z.string()),
  response: JsonStringSchema,
  async: AsyncConfigSchema,
  chaos_injection: ChaosConfigSchema,
});
export type EscenarioState = z.infer<typeof EscenarioStateSchema>;
export type AsyncConfig = z.infer<typeof AsyncConfigSchema>;
export type ChaosConfig = z.infer<typeof ChaosConfigSchema>;