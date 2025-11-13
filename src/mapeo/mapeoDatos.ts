import type { Location } from "../models/backendModels";
import type { EscenarioUI } from "../types/escenarioUI";

//Mapea los datos del back y los adapta a la UI 
export function mapBackendToUI(location: Location | any): EscenarioUI {
  // Manejar tanto statusCode (camelCase) como status_code (snake_case del YAML)
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
          headers: location.async.headers ?? { "Content-Type": "application/json" },
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


//Mapea del UI al backend 
export function mapUIToBackend(escenario: EscenarioUI): Location {
    let safeResponse = escenario.response;    
  
    return {
      path: escenario.path,
      method: escenario.method,
      //schema: escenario.schema ?? "",
      response: safeResponse,
      statusCode: escenario.statusCode,
      headers: escenario.headers,

      async: escenario.async?.enabled
        ? {
            url: escenario.async.url ?? "",
            body: escenario.async.body ?? "",
            method: escenario.async.method ?? "",
            headers: escenario.async.headers,
            timeout: escenario.async.timeout,
            retries: escenario.async.retries,
            retryDelay: escenario.async.retryDelay,
          }
        : undefined,
  
      chaosInjection: escenario.chaosInjection?.enabled
        ? {
            latency: {
              time:
                escenario.chaosInjection.latency !== null &&
                escenario.chaosInjection.latency !== undefined
                  ? escenario.chaosInjection.latency
                  : 0,
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
              code:
                escenario.chaosInjection.error !== null &&
                escenario.chaosInjection.error !== undefined
                  ? escenario.chaosInjection.error
                  : 0,
              probability: String(escenario.chaosInjection.errorProbability ?? "0"),
              response: escenario.chaosInjection.errorResponse ?? "",
            },
          }
        : undefined,
    };
    
  }
  
