import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'

import { Segmented } from '@/components/ui/Segmented'
import { Switch } from '@/components/ui/Switch'

const OPTIONS = [
  { value: '9:16', label: '9:16', hint: 'Shorts' },
  { value: '16:9', label: '16:9', hint: 'Landscape' },
  { value: '1:1', label: '1:1', hint: 'Square' },
]

function Harness() {
  const [value, setValue] = useState('9:16')
  return <Segmented label="Aspect ratio" options={OPTIONS} value={value} onChange={setValue} />
}

describe('Segmented', () => {
  it('exposes a radio group with the correct checked item', () => {
    render(<Harness />)

    expect(screen.getByRole('radiogroup', { name: 'Aspect ratio' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /9:16/ })).toBeChecked()
    expect(screen.getByRole('radio', { name: /16:9/ })).not.toBeChecked()
  })

  it('selects on click', async () => {
    render(<Harness />)
    await userEvent.click(screen.getByRole('radio', { name: /1:1/ }))
    expect(screen.getByRole('radio', { name: /1:1/ })).toBeChecked()
  })

  it('moves selection with arrow keys', async () => {
    render(<Harness />)
    const first = screen.getByRole('radio', { name: /9:16/ })
    first.focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByRole('radio', { name: /16:9/ })).toBeChecked()
  })
})

describe('Switch', () => {
  it('toggles through its accessible role', async () => {
    function SwitchHarness() {
      const [checked, setChecked] = useState(false)
      return <Switch checked={checked} onChange={setChecked} label="Normalise volume" />
    }
    render(<SwitchHarness />)

    const toggle = screen.getByRole('switch', { name: 'Normalise volume' })
    expect(toggle).toHaveAttribute('aria-checked', 'false')
    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-checked', 'true')
  })
})
