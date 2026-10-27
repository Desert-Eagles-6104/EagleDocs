export function isEnumValue<T extends Record<string, string>>(
  values: T,
  value: unknown,
): value is T[keyof T] {
  return typeof value === "string" && Object.values(values).includes(value);
}

export function typedEntries<T extends object>(value: T) {
  return Object.entries(value) as {
    [Key in keyof T]: [Key, T[Key]];
  }[keyof T][];
}
