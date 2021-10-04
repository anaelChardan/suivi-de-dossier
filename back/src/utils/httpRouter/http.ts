export const httpMethods = ['get', 'post', 'put', 'patch', 'delete'] as const;

export type HttpMethod = typeof httpMethods[number];

function isHttpMethod(method: string): method is HttpMethod {
  return httpMethods.includes(method as any);
}

export function toHttpMethod(method: string): HttpMethod {
  const normalizedMethod = method.toLowerCase();
  if (isHttpMethod(normalizedMethod)) {
    return normalizedMethod;
  }
  throw new Error(`Unknown HTTP method ${method}`);
}
