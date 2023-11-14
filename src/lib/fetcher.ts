export function fetcher<T = any>(...args: Parameters<typeof fetch>) {
  return fetch(...args).then((res) => res.json()) as Promise<T>
}
