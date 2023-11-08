type SimilarityOptions = {
  /**
   * The expected percentage of similarity between two strings.
   *
   * Is a number between 0 and 100.
   */
  syntheticPercentage?: number
  caseSensitive?: boolean
}

const defaultSyntheticSimilarityPercentage = 80

export function getJaroWinkler(
  comparator: string,
  criteria: string,
  options?: SimilarityOptions,
) {
  const syntheticPercentage =
    options?.syntheticPercentage ?? defaultSyntheticSimilarityPercentage

  const caseSensitive = options?.caseSensitive ?? false

  if (!caseSensitive) {
    comparator = comparator.toLowerCase()
    criteria = criteria.toLowerCase()
  }

  if (syntheticPercentage < 0 || syntheticPercentage > 100)
    throw new TypeError(
      `The synthetic percentage must be an integer or float number between 0 and 100.`,
    )

  const calculateStringsSimilarity = (
    firstString: string,
    secondString: string,
  ) => {
    let matchesFound = 0

    if (firstString.trim() === secondString.trim()) return 100

    const range =
      Math.floor(Math.max(firstString.length, secondString.length) / 2) - 1

    const matchesInFirstString = new Array(firstString.length)

    const matchesInSecondString = new Array(secondString.length)

    for (const firstStringCharIndex in firstString.split('')) {
      const high =
        parseInt(firstStringCharIndex) + range <= secondString.length
          ? parseInt(firstStringCharIndex) + range
          : secondString.length - 1

      let low =
        parseInt(firstStringCharIndex) >= range
          ? parseInt(firstStringCharIndex) - range
          : 0

      while (low <= high) {
        if (
          !matchesInFirstString[firstStringCharIndex] &&
          !matchesInSecondString[low] &&
          firstString[firstStringCharIndex] === secondString[low]
        ) {
          ++matchesFound

          matchesInFirstString[firstStringCharIndex] = matchesInSecondString[
            low
          ] = true

          low = high
        }

        low++
      }
    }

    if (matchesFound === 0) return 0

    let transpositionsCounterIndex = 0,
      transpositions = 0

    for (const firstStringCharIndex in firstString.split('')) {
      if (matchesInFirstString[parseInt(firstStringCharIndex)])
        while (transpositionsCounterIndex < secondString.length) {
          if (matchesInSecondString[transpositionsCounterIndex]) {
            transpositionsCounterIndex += 1
            break
          }

          if (
            firstString[parseInt(firstStringCharIndex)] !==
            secondString[transpositionsCounterIndex]
          )
            ++transpositions

          transpositionsCounterIndex++
        }
    }

    let weight =
      (matchesFound / firstString.length +
        matchesFound / secondString.length +
        (matchesFound - transpositions / 2) / matchesFound) /
      3

    let lengthPrefix = 0

    const scoreScalingFactor = 0.1

    if (weight > 0.7) {
      while (
        firstString[lengthPrefix] === secondString[lengthPrefix] &&
        lengthPrefix < 4
      )
        ++lengthPrefix

      weight = weight + lengthPrefix * scoreScalingFactor * (1 - weight)
    }

    return weight * 100
  }

  const validateComparison = (percentage: number) => {
    return percentage >= syntheticPercentage
  }

  return validateComparison(calculateStringsSimilarity(comparator, criteria))
}
