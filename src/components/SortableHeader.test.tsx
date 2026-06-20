import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { SortableHeader } from './SortableHeader'

function renderHeader(direction: 'asc' | 'desc' | null = null) {
  return renderToStaticMarkup(
    <SortableHeader
      label="Grade"
      direction={direction}
      align="center"
      onClick={() => undefined}
    />
  )
}

function renderLeftHeader(direction: 'asc' | 'desc' | null = null) {
  return renderToStaticMarkup(
    <SortableHeader
      label="Assignment"
      direction={direction}
      onClick={() => undefined}
    />
  )
}

describe('SortableHeader', () => {
  it.each([
    [null, 'none'],
    ['asc', 'ascending'],
    ['desc', 'descending'],
  ] as const)('exposes %s as aria-sort=%s', (direction, ariaSort) => {
    expect(renderHeader(direction)).toContain(`aria-sort="${ariaSort}"`)
  })

  it('centers the label and indicator together', () => {
    const markup = renderHeader('asc')

    expect(markup).toContain('<button type="button"')
    expect(markup).toContain('inline-flex justify-center gap-0.5 text-center')
    expect(markup).toContain('flex size-3 shrink-0')
    expect(markup.indexOf('Grade')).toBeLessThan(markup.indexOf('lucide-arrow-up'))
  })

  it('shows a neutral up-down indicator while unsorted', () => {
    const markup = renderHeader()

    expect(markup).toContain('lucide-move-vertical')
    expect(markup).toContain('opacity-60')
  })

  it('keeps left-aligned labels at the original start without a leading spacer', () => {
    const markup = renderLeftHeader('asc')

    expect(markup).toContain('inline-flex')
    expect(markup).not.toContain('justify-center gap-0.5 text-center')
    expect(markup.indexOf('Assignment')).toBeLessThan(
      markup.indexOf('lucide-arrow-up')
    )
  })
})
