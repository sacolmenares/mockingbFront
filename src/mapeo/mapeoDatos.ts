import type { Location, AsyncConfig } from "../models/backendModels";
import type { EscenarioUI, AsyncItemUI } from "../types/escenarioUI";

function mapAsyncConfigToUI(asyncConfig: AsyncConfig | any): AsyncItemUI {
  return {
    url: asyncConfig.url,
    method: asyncConfig.method,
    body: asyncConfig.body ?? "",
    headers: asyncConfig.headers ?? {},
    async: asyncConfig.async ? asyncConfig.async.map((a: AsyncConfig) => mapAsyncConfigToUI(a)) : undefined,
  };
}

export function mapBackendToUI(location: Location | any): EscenarioUI {
  const chaos = location.chaos_injection;

  let asyncArray: AsyncItemUI[] | undefined = undefined;
  if (location.async) {
    if (Array.isArray(location.async)) {
      asyncArray = location.async.map((a: AsyncConfig) => mapAsyncConfigToUI(a));
    } else {
      asyncArray = [mapAsyncConfigToUI(location.async)];
    }
  }

  return {
    path: location.path,
    method: location.method,
    schema: location.schema ?? undefined,
    response: location.response,
    status_code: location.status_code,
    headers: location.headers ?? { "Content-Type": "application/json" },

    async: asyncArray,

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


function mapAsyncUIToBackend(asyncItem: AsyncItemUI): AsyncConfig {
  return {
    url: asyncItem.url,
    method: asyncItem.method,
    body: asyncItem.body ?? "",
    headers: asyncItem.headers ?? {},
    async: asyncItem.async ? asyncItem.async.map((a) => mapAsyncUIToBackend(a)) : undefined,
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

  // Convertir array de async a array de AsyncConfig
  let asyncArray: AsyncConfig[] | undefined = undefined;
  if (escenario.async && escenario.async.length > 0) {
    asyncArray = escenario.async.map((a) => mapAsyncUIToBackend(a));
  }

  return {
    path: escenario.path,
    method: escenario.method,
    schema: escenario.schema,
    response: escenario.response,
    status_code: toNumber(escenario.status_code, 200),
    headers: escenario.headers,

    async: asyncArray,
  
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
