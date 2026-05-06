import "axios";
import type { RetryOptions } from "@/services/http/createAxiosClient";

declare module "axios" {
  export interface AxiosRequestConfig {
    retry?: RetryOptions;
    skipAuth?: boolean;
    _retryCount?: number;
    _authRefreshed?: boolean;
    _requestStartedAt?: number;
  }
}

