import { AxiosError } from "axios";

export interface AxiosErrorResponse {
  message: string;
  [key: string]: unknown; // por si incluye más campos
}

export type TypedAxiosError = AxiosError<AxiosErrorResponse>;