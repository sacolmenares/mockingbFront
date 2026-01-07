export interface Headers {
    [key: string]: string;
  }
  
  export interface Latency {
    time: number;
    probability: number;
  }
  
  export interface Abort {
    code: number;
    probability: number;
  }
  
  export interface ErrorModel {
    code: number;
    probability: number;
    response: string;
  }
  
  export interface ChaosInjection {
    latency: Latency;
    abort: Abort;
    error: ErrorModel;
  }
  
  export interface AsyncConfig {
    url?: string;
    body?: string;
    method?: string;
    headers?: Headers;
    timeout?: number;
    retries?: number;
    retryDelay?: number;
  }
  
  export interface Location {
    path: string;
    method: string;
    static_dir?: string;
    schema?: string;
    response: string;
    headers?: Headers;
    status_code: number;
    async?: AsyncConfig;
    chaos_injection?: ChaosInjection;
  }
  
  export interface Server {
    listen: number;
    logger?: boolean;
    logger_path?: string;
    name?: string;
    version?: string;
    chaosInjection?: ChaosInjection;
    location: Location[];
  }
  
  export interface Http {
    servers: Server[];
  }
  
  export interface PostgresServer {
    name: string;
    user: string;
    password: string;
    host: string;
    port: number;
    database: string;
    init_script?: string;
  }
  
  export interface MockServer {
    http: Http;
    postgres: {
      servers: PostgresServer[];
    };
  }
  