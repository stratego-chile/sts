import chroma from 'chroma-js'
import type { CSSProperties } from 'react'

type MonochromeColorLabel = 'white' | 'black'

export function getMonoContrast(color: string): MonochromeColorLabel {
  return chroma(
    Math.round(chroma(color).luminance()) === 0 ? 'white' : 'black',
  ).hex() as MonochromeColorLabel
}

export function coloredBoxStyles(
  color?: string,
): Pick<CSSProperties, Extend<'backgroundColor', 'color'>> {
  const definitiveColor = color ?? chroma.random().hex()

  return {
    backgroundColor: definitiveColor,
    color: getMonoContrast(definitiveColor),
  }
}
