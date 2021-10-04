export const getEntries = <T>(
  object: T,
): [keyof T & string, T[keyof T & string]][] => {
  return Object.entries(object) as [keyof T & string, T[keyof T & string]][];
};
