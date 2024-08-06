export type Nullable<T> = T | null;

export type NestedKeys<T> = {
  [K in keyof T]: T[K] extends object ? keyof T[K] : never;
}[keyof T];

export function isNotNumber(value: unknown): boolean {
  return typeof value !== "number" || isNaN(value);
}