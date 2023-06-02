import differenceInDays from 'date-fns/differenceInDays'
import differenceInHours from 'date-fns/differenceInHours'
import differenceInMinutes from 'date-fns/differenceInMinutes'
import differenceInMonths from 'date-fns/differenceInMonths'
import differenceInSeconds from 'date-fns/differenceInSeconds'
import differenceInYears from 'date-fns/differenceInYears'
import fileSize from 'file-size'

export { fileSize as formatFileSize }

enum TimeRange {
  Years = 'years',
  Months = 'months',
  Days = 'days',
  Hours = 'hours',
  Minutes = 'minutes',
  Seconds = 'seconds',
}

export const getFormattedDateDifference = (
  $now: number | Date,
  $then: number | Date
) => {
  const differences = new Array<
    [TimeRange, (leftDate: Date | number, rightDate: Date | number) => number]
  >(
    [TimeRange.Years, differenceInYears],
    [TimeRange.Months, differenceInMonths],
    [TimeRange.Days, differenceInDays],
    [TimeRange.Hours, differenceInHours],
    [TimeRange.Minutes, differenceInMinutes],
    [TimeRange.Seconds, differenceInSeconds]
  )

  const timeRange = differences
    .map(([range, fn]) => [range, fn($now, $then)] as [TimeRange, number])
    .sort(
      ([, lowerLevelRange], [, upperLevelRange]) =>
        lowerLevelRange - upperLevelRange
    ) // Lower first
    .filter(([, difference]) => Math.floor(difference) > 0)[0] // Pick the first value which is greater than 0

  return [
    timeRange[1],
    timeRange[1] === 1 ? String(timeRange[0]).slice(0, -1) : timeRange[0],
    'ago',
  ].join(' ')
}

export const getPageTitle = (pageTitle?: string) => {
  const baseTitle = process.env.BRAND_NAME
  return [pageTitle, baseTitle].filter(Boolean).join(' - ')
}
