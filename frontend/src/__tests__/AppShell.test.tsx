import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { AppShell } from '@/components/layout/AppShell'
import { ToastProvider } from '@/components/ui/Toast'

vi.mock('@/services/api', async () => {
  const actual = await vi.importActual<typeof import('@/services/api')>('@/services/api')
  return {
    ...actual,
    fetchCurrentUser: vi.fn().mockResolvedValue({ id: '1', full_name: 'Sajal', email: 'sajal@example.com' }),
    fetchSystemStatus: vi.fn().mockResolvedValue({
      overall: 'ok',
      app: { name: 'ChauleClips', version: '0.1.0', environment: 'test', debug: true },
      checks: [],
      config_warnings: [],
    }),
  }
})

describe('AppShell', () => {
  it('renders every workspace navigation entry and the developer credit after session check', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ToastProvider>
          <AppShell />
        </ToastProvider>
      </MemoryRouter>,
    )

    await screen.findAllByRole('link', { name: /Dashboard/i })
    for (const label of [
      'Dashboard',
      'Projects',
      'Clips',
      'Processing queue',
      'Templates',
      'Settings',
    ]) {
      expect(screen.getAllByRole('link', { name: new RegExp(label, 'i') }).length).toBeGreaterThan(0)
    }

    expect(screen.getAllByText('Sajal Chaulagain').length).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: 'New project' })).toBeInTheDocument()
  })
})
