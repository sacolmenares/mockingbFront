import type { Location } from "../models/backendModels";
import type { EscenarioUI } from "../types/escenarioUI";

//Mapea los datos del back y los adapta a la UI 
export function mapBackendToUI(location: Location | any): EscenarioUI {
  const statusCode = location.statusCode !== undefined ? location.statusCode : location.status_code;

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

    chaosInjection: location.chaosInjection
      ? {
          enabled: true,
          latency: location.chaosInjection.latency?.time ?? null,
          latencyProbability: location.chaosInjection.latency?.probability ?? null,
          abort: location.chaosInjection.abort?.code ?? null,
          abortProbability: location.chaosInjection.abort?.probability ?? null,
          error: location.chaosInjection.error?.code ?? null,
          errorProbability: location.chaosInjection.error?.probability ?? null,
          errorResponse: location.chaosInjection.error?.response ?? null,
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
  

    chaosInjection:
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
