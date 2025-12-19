import type { Location } from "../models/backendModels";
import type { EscenarioUI } from "../types/escenarioUI";

export function mapBackendToUI(location: Location | any): EscenarioUI {
  const statusCode = location.statusCode !== undefined ? location.statusCode : location.status_code;
  const chaos = location.chaos_injection;

  return {
    path: location.path,
    method: location.method,
    schema: location.schema ?? undefined,
    response: location.response,
    statusCode: statusCode ?? 200,
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
  const optionalInt = (value: number | null | undefined): number | undefined => {
    if (value === null || value === undefined) {
      return undefined;
    }
    return value;
  };

  return {
    path: escenario.path,
    method: escenario.method,
    schema: escenario.schema,
    response: escenario.response,
    statusCode: escenario.statusCode,
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
              time: optionalInt(escenario.chaosInjection.latency) ?? 0,
              probability: String(escenario.chaosInjection.latencyProbability ?? "0"),
            },
            abort: {
              code:
                escenario.chaosInjection.abort !== null &&
                escenario.chaosInjection.abort !== undefined
                  ? typeof escenario.chaosInjection.abort === "number"
                    ? escenario.chaosInjection.abort
                    : escenario.chaosInjection.abort === true
                    ? 500
                    : 0
                  : 0,
              probability: String(escenario.chaosInjection.abortProbability ?? "0"),
            },
            error: {
              code: escenario.chaosInjection.error ?? 0,
              probability: String(escenario.chaosInjection.errorProbability ?? "0"),
              response: escenario.chaosInjection.errorResponse ?? "",
            },
          }
        : undefined,
  };
}
