export const fetcher = (...args: Parameters<typeof fetch>) => {
  return fetch(...args).then((res) => res.json())
}
