import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { ToastProvider } from '@/components/ui/Toast'
import { LoginPage } from '@/pages/auth/LoginPage'

const { loginAccount } = vi.hoisted(() => ({ loginAccount: vi.fn() }))

vi.mock('@/services/api', async () => {
  const actual = await vi.importActual<typeof import('@/services/api')>('@/services/api')
  return { ...actual, loginAccount }
})

/**
 * Covers frontend validation and verifies valid sign-in attempts reach the auth API.
 */
function renderLogin() {
  return render(
    <MemoryRouter>
      <ToastProvider>
        <LoginPage />
      </ToastProvider>
    </MemoryRouter>,
  )
}

describe('LoginPage', () => {
  beforeEach(() => loginAccount.mockReset().mockResolvedValue({ id: '1', full_name: 'Sajal', email: 'sajal@example.com' }))

  it('shows the working sign-in form without a phase placeholder', () => {
    renderLogin()
    expect(screen.queryByText('Sign-in opens in Phase 2')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('validates the email field before doing anything', async () => {
    renderLogin()

    await userEvent.type(screen.getByLabelText('Email address'), 'not-an-email')
    await userEvent.type(screen.getByLabelText('Password'), 'secret123')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument()
    // No fake success state:
    expect(screen.queryByText(/welcome back, /i)).not.toBeInTheDocument()
  })

  it('submits valid credentials to the authentication API', async () => {
    renderLogin()

    await userEvent.type(screen.getByLabelText('Email address'), 'sajal@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'secret123')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(loginAccount).toHaveBeenCalledWith({ email: 'sajal@example.com', password: 'secret123' })
  })

  it('toggles password visibility', async () => {
    renderLogin()

    const password = screen.getByLabelText('Password')
    expect(password).toHaveAttribute('type', 'password')
    await userEvent.click(screen.getByRole('button', { name: 'Show password' }))
    expect(password).toHaveAttribute('type', 'text')
  })
})
