import { getEnv } from "./env";

export const isDev = getEnv().isDev();
