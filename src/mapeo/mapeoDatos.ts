import type { Location } from "../models/backendModels";
import type { EscenarioUI } from "../types/escenarioUI";

export function mapBackendToUI(location: Location | any): EscenarioUI {
  const chaos = location.chaos_injection;

  return {
    path: location.path,
    method: location.method,
    schema: location.schema ?? undefined,
    response: location.response,
    status_code: location.status_code,
    headers: location.headers ?? { "Content-Type": "application/json" },

    async: location.async
      ? {
          enabled: true,
          url: location.async.url,
          method: location.async.method,
          timeout: location.async.timeout ?? 5000,
          retries: location.async.retries ?? 3,
          retryDelay: location.async.retryDelay ?? 1000,
          body: location.async.body ?? "",
          headers: location.async.headers ?? {},
        }
      : undefined,

    chaosInjection: chaos ?
       {
          enabled: true,
          latency: (chaos.latency?.time > 0) ? chaos.latency.time : null,
          latencyProbability: chaos.latency?.probability || null,
          abort: (chaos.abort?.code > 0) ? chaos.abort.code : null,
          abortProbability: chaos.abort?.probability || null,
          error: (chaos.error?.code > 0) ? chaos.error.code : null,
          errorProbability: chaos.error?.probability || null,
          errorResponse: chaos.error?.response || null,
        }
      : undefined,
  };
}


export function mapUIToBackend(escenario: EscenarioUI): Location {
  const toNumber = (value: unknown, fallback = 0): number => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  };
  
  const toBoolean = (value: unknown): boolean => {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") return value.toLowerCase() === "true";
    return false;
  };

  return {
    path: escenario.path,
    method: escenario.method,
    schema: escenario.schema,
    response: escenario.response,
    status_code: toNumber(escenario.status_code, 200),
    headers: escenario.headers,


    async: escenario.async?.enabled
    ? {
        url: escenario.async.url ?? "",
        method: escenario.async.method ?? "POST",
        body: escenario.async.body ?? "",
        headers: escenario.async.headers ?? {},
      }
    : undefined,
  
    chaos_injection:
      escenario.chaosInjection?.enabled
        ? {
            latency: {
              time: toNumber(escenario.chaosInjection.latency, 0),
              probability: toNumber(escenario.chaosInjection.latencyProbability, 0),
            },
            abort: {
              code: (() => {
                const abort = escenario.chaosInjection.abort;
              
                if (typeof abort === "number") return abort;
                if (toBoolean(abort)) return 500;
              
                return 0;
              })(),
              probability: toNumber(escenario.chaosInjection.abortProbability, 0),
            },
            error: {
              code: toNumber(escenario.chaosInjection.error, 0),
              probability: toNumber(escenario.chaosInjection.errorProbability, 0),
              response: escenario.chaosInjection.errorResponse ?? "",
            },
          }
        : undefined,
  };
}
