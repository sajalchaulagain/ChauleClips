import { zodResolver } from '@hookform/resolvers/zod'
import { AtSign } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { AuthLayout } from '@/components/auth/AuthLayout'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { forgotPasswordSchema, type ForgotPasswordValues } from '@/services/validation'

/**
 * Password reset request.
 *
 * Password reset needs an email provider, which is optional in this free-first
 * setup and disabled by default. The screen explains that instead of showing a
 * form that would silently do nothing.
 */
export function ForgotPasswordPage() {
  const { notify } = useToast()
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
    mode: 'onBlur',
  })

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="We will email you a single-use reset link."
      footer={
        <>
          Remembered it?{' '}
          <Link to="/login" className="font-medium text-accent hover:underline">
            Back to sign in
          </Link>
        </>
      }
    >
      <div className="space-y-4">
        <Alert tone="warning" title="Email delivery is off">
          <p>
            Password reset activates only when SMTP settings and{' '}
            <span className="font-mono text-[11px]">PASSWORD_RESET_ENABLED=true</span> are
            configured. In this local setup no reset email can be sent.
          </p>
        </Alert>

        {submitted ? (
          <Alert tone="info" title="Nothing was sent">
            <p>
              The reset endpoint is part of Phase 2. No email was queued and no token was created.
            </p>
          </Alert>
        ) : null}

        <form
          className="space-y-4"
          noValidate
          onSubmit={handleSubmit(() => {
            setSubmitted(true)
            notify('Password reset is not available until Phase 2.', 'info')
          })}
        >
          <Input
            label="Email address"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            leadingIcon={<AtSign className="size-4" aria-hidden="true" />}
            error={errors.email?.message}
            {...register('email')}
          />

          <Button type="submit" size="lg" fullWidth>
            Send reset link
          </Button>
        </form>
      </div>
    </AuthLayout>
  )
}
