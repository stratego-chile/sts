import { ProjectStatus, TicketStatus } from '@/lib/enumerators'
import chroma from 'chroma-js'
import type { CSSProperties } from 'react'

type MonochromeColorLabel = 'white' | 'black'

export const getMonoContrast = (color: string): MonochromeColorLabel =>
  chroma(
    Math.round(chroma(color).luminance()) === 0 ? 'white' : 'black'
  ).hex() as MonochromeColorLabel

export const coloredBoxStyles = (
  color?: string
): Pick<CSSProperties, Extend<'backgroundColor', 'color'>> => {
  const definitiveColor = color ?? chroma.random().hex()

  return {
    backgroundColor: definitiveColor,
    color: getMonoContrast(definitiveColor),
  }
}

export const projectStatusColors: Record<ProjectStatus, string> = {
  active: chroma('royalblue').hex(),
  closed: chroma('lightgray').hex(),
  draft: chroma('brown').hex(),
}

export const ticketStatusColors: Record<TicketStatus, string> = {
  closed: chroma('indianred').hex(),
  draft: chroma('lightgray').hex(),
  open: chroma('royalblue').hex(),
  resolved: chroma('mediumseagreen').desaturate(0.4).hex(),
}
