import differenceInDays from 'date-fns/differenceInDays'
import differenceInHours from 'date-fns/differenceInHours'
import differenceInMinutes from 'date-fns/differenceInMinutes'
import differenceInSeconds from 'date-fns/differenceInSeconds'
import fileSize from 'file-size'

export { fileSize as formatFileSize }

export const getFormattedDateDifference = (
  $now: number | Date,
  $then: number | Date
) => {
  type TimeRange = 'days' | 'hours' | 'minutes' | 'seconds'

  const differences: Array<[TimeRange, number]> = [
    ['days', differenceInDays($now, $then)],
    ['hours', differenceInHours($now, $then)],
    ['minutes', differenceInMinutes($now, $then)],
    ['seconds', differenceInSeconds($now, $then)],
  ]

  const timeRange = differences
    .sort(([, a], [, b]) => a - b) // Lower first
    .filter(([, difference]) => Math.floor(difference) > 0)[0] // Pick the first value which is greater than 0

  return `${timeRange[1]} ${
    timeRange[1] === 1 ? timeRange[0].slice(0, -1) : timeRange[0]
  } ago`
}

export const getPageTitle = (pageTitle?: string) => {
  const baseTitle = process.env.BRAND_NAME
  return [pageTitle, baseTitle].filter(Boolean).join(' - ')
}
