export function parseJSONUntilUnescaped(escapedJson: string) {
  try {
    const parsedJson = JSON.parse(escapedJson)

    const stringifiedParsedJson: string = parsedJson.toString()

    if (stringifiedParsedJson.includes('\\"'))
      return parseJSONUntilUnescaped(stringifiedParsedJson)

    return parsedJson
  } catch {
    return {}
  }
}
