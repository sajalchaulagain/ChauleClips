import { CheckCircle2, CircleAlert, Info, TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/utils/cn'

type AlertTone = 'info' | 'success' | 'warning' | 'danger'

const STYLES: Record<AlertTone, { wrap: string; icon: typeof Info }> = {
  info: { wrap: 'border-info/25 bg-info/[0.07] text-info', icon: Info },
  success: { wrap: 'border-success/25 bg-success/[0.07] text-success', icon: CheckCircle2 },
  warning: { wrap: 'border-warning/25 bg-warning/[0.07] text-warning', icon: TriangleAlert },
  danger: { wrap: 'border-danger/25 bg-danger/[0.07] text-danger', icon: CircleAlert },
}

export function Alert({
  tone = 'info',
  title,
  children,
  className,
  action,
}: {
  tone?: AlertTone
  title?: string
  children?: ReactNode
  className?: string
  action?: ReactNode
}) {
  const { wrap, icon: Icon } = STYLES[tone]

  return (
    <div
      role={tone === 'danger' ? 'alert' : 'note'}
      className={cn('flex gap-2.5 rounded-control border px-3.5 py-2.5', wrap, className)}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1 space-y-1">
        {title ? <p className="text-[13px] font-semibold">{title}</p> : null}
        {children ? <div className="text-[13px] leading-relaxed text-fg-muted">{children}</div> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
