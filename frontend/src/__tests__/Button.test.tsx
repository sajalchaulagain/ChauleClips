import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { Button, ButtonLink } from '@/components/ui/Button'

describe('Button', () => {
  it('calls the click handler', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Start clipping</Button>)

    await userEvent.click(screen.getByRole('button', { name: 'Start clipping' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled while busy and cannot be clicked', async () => {
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Rendering
      </Button>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Rendering' }))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('renders internal navigation as a router link', () => {
    render(
      <MemoryRouter>
        <ButtonLink to="/signup">Get started</ButtonLink>
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Get started' })).toHaveAttribute('href', '/signup')
  })
})
