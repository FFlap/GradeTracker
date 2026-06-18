import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { GradeTable } from './GradeTable'

describe('GradeTable semantics', () => {
  it('renders a complete ARIA table hierarchy', () => {
    const markup = renderToStaticMarkup(
      <GradeTable
        rows={[
          {
            id: 'row-1',
            assignment: 'Midterm',
            date: '2026-06-18',
            grade: '80',
            weight: '25',
          },
        ]}
        onUpdateRow={() => undefined}
        onDeleteRow={() => undefined}
      />
    )

    expect(markup).toContain('role="table"')
    expect(markup).toContain('role="rowgroup"')
    expect(markup.match(/role="row"/g)).toHaveLength(2)
    expect(markup.match(/role="columnheader"/g)).toHaveLength(5)
    expect(markup.match(/role="cell"/g)).toHaveLength(5)
    expect(markup).toContain('role="presentation"')
  })
})
