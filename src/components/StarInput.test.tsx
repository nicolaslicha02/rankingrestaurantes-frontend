import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { StarInput } from './StarInput'

function Harness({ onChange }: { onChange: (n: number) => void }) {
  const [value, setValue] = useState(0)
  return (
    <StarInput
      value={value}
      onChange={(n) => {
        setValue(n)
        onChange(n)
      }}
    />
  )
}

describe('StarInput', () => {
  it('se opera con teclado (flechas y Home/End)', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<Harness onChange={onChange} />)

    await user.tab() // foco en la primera estrella
    await user.keyboard('{ArrowRight}{ArrowRight}')
    expect(screen.getByRole('radio', { name: '2 estrellas' })).toBeChecked()
    await user.keyboard('{End}')
    expect(screen.getByRole('radio', { name: '5 estrellas' })).toBeChecked()
    await user.keyboard('{Home}')
    expect(screen.getByRole('radio', { name: '1 estrella' })).toBeChecked()
  })
})

