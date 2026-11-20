import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SystemStatusPanel } from '@/components/environment/SystemStatusPanel'
import { ToastProvider } from '@/components/ui/Toast'
import type { SystemStatus } from '@/types/api'

// The panel must be testable without a running backend: mock the service layer.
const statusFixture: SystemStatus = {
  overall: 'warning',
  app: { name: 'ChauleClips', version: '0.1.0', environment: 'test', debug: true },
  checks: [
    { id: 'ffmpeg', label: 'FFmpeg', status: 'ok', detail: 'ffmpeg version 7.1.5', hint: null },
    {
      id: 'openrouter',
      label: 'OpenRouter AI',
      status: 'warning',
      detail: 'no API key configured',
      hint: 'Add OPENROUTER_API_KEY.',
    },
  ],
  config_warnings: ['OPENROUTER_API_KEY is not set.'],
}

const fetchSystemStatus = vi.fn()

vi.mock('@/services/api', async () => {
  const actual = await vi.importActual<typeof import('@/services/api')>('@/services/api')
  return { ...actual, fetchSystemStatus: (...args: unknown[]) => fetchSystemStatus(...args) }
})

function renderPanel() {
  return render(
    <ToastProvider>
      <SystemStatusPanel />
    </ToastProvider>,
  )
}

describe('SystemStatusPanel', () => {
  beforeEach(() => {
    fetchSystemStatus.mockReset()
  })

  it('renders the real checks returned by the API', async () => {
    fetchSystemStatus.mockResolvedValue(statusFixture)
    renderPanel()

    expect(await screen.findByText('FFmpeg')).toBeInTheDocument()
    expect(screen.getByText('OpenRouter AI')).toBeInTheDocument()
    expect(screen.getByText('Needs setup')).toBeInTheDocument()
    expect(screen.getByText(/OPENROUTER_API_KEY is not set/)).toBeInTheDocument()
  })

  it('explains what to do when the backend is unreachable', async () => {
    fetchSystemStatus.mockRejectedValue(new Error('Network Error'))
    renderPanel()

    expect(await screen.findByText('Backend unreachable')).toBeInTheDocument()
    // The underlying reason is shown, not swallowed:
    expect(screen.getByText('Network Error')).toBeInTheDocument()
  })

  it('re-checks on demand', async () => {
    fetchSystemStatus.mockResolvedValue(statusFixture)
    renderPanel()
    await screen.findByText('FFmpeg')

    await userEvent.click(screen.getByRole('button', { name: /re-check/i }))
    await waitFor(() => expect(fetchSystemStatus).toHaveBeenCalledTimes(2))
  })
})
