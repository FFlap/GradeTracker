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

  it('centers narrow labels without reserving layout width for the indicator', () => {
    const markup = renderHeader('asc')

    expect(markup).toContain('<button type="button"')
    expect(markup).toContain('relative flex justify-center text-center')
    expect(markup).toContain('w-full text-center')
    expect(markup).toContain('absolute right-0.5 size-1.5')
    expect(markup).not.toContain('grid-cols-')
  })

  it('keeps the centered indicator dimensions stable while unsorted', () => {
    const markup = renderHeader()

    expect(markup).toContain(
      '<span aria-hidden="true" class="flex items-center justify-center absolute right-0.5 size-1.5"></span>'
    )
  })

  it('keeps left-aligned labels at the original start without a leading spacer', () => {
    const markup = renderLeftHeader('asc')

    expect(markup).toContain('inline-flex')
    expect(markup).not.toContain('relative flex justify-center text-center')
    expect(markup).not.toContain('absolute right-0.5 size-1.5')
    expect(markup.indexOf('Assignment')).toBeLessThan(
      markup.indexOf('lucide-arrow-up')
    )
  })
})
