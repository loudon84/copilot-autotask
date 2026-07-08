function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

export function mapKeysToCamel<T>(obj: unknown): T {
  if (obj === null || obj === undefined) {
    return obj as T;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => mapKeysToCamel(item)) as T;
  }
  if (typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[snakeToCamel(key)] = mapKeysToCamel(value);
    }
    return result as T;
  }
  return obj as T;
}

export function mapListResponse<T>(data: unknown): T[] {
  if (Array.isArray(data)) {
    return data.map((item) => mapKeysToCamel<T>(item));
  }
  const wrapped = data as { items?: unknown[]; data?: unknown[] };
  const items = wrapped.items ?? wrapped.data ?? [];
  return items.map((item) => mapKeysToCamel<T>(item));
}

export function mapItemResponse<T>(data: unknown): T {
  return mapKeysToCamel<T>(data);
}
