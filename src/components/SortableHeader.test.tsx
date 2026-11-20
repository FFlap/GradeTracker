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

describe('SortableHeader', () => {
  it.each([
    [null, 'none'],
    ['asc', 'ascending'],
    ['desc', 'descending'],
  ] as const)('exposes %s as aria-sort=%s', (direction, ariaSort) => {
    expect(renderHeader(direction)).toContain(`aria-sort="${ariaSort}"`)
  })
})
