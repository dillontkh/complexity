import React from "react";

export type Nullable<T> = T | null;

export function isNotNumber(value: unknown): boolean {
  return typeof value !== "number" || isNaN(value);
}

export function isReactNode(node: unknown): node is React.ReactNode {
  return (
    node === null ||
    node === undefined ||
    typeof node === "string" ||
    typeof node === "number" ||
    typeof node === "boolean" ||
    React.isValidElement(node) ||
    (Array.isArray(node) && node.every(isReactNode))
  );
}
