import { zodResolver } from '@hookform/resolvers/zod'
import { AtSign } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'

import { AuthLayout } from '@/components/auth/AuthLayout'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { loginSchema, type LoginValues } from '@/services/validation'
import { loginAccount, toApiError } from '@/services/api'

/**
 * Sign-in screen backed by the cookie-based authentication API.
 */
export function LoginPage() {
  const { notify } = useToast()
  const [serverError, setServerError] = useState('')
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onBlur',
  })

  async function onSubmit(values: LoginValues) {
    setServerError('')
    try {
      await loginAccount(values)
      notify('Signed in successfully.', 'success')
      navigate('/dashboard', { replace: true })
    } catch (error) {
      const message = toApiError(error).message
      setServerError(message)
      notify(message, 'error')
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue clipping your videos."
      footer={
        <>
          New to ChauleClips?{' '}
          <Link to="/signup" className="font-medium text-accent hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        {serverError ? <Alert tone="danger" title="Could not sign in">{serverError}</Alert> : null}

        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          leadingIcon={<AtSign className="size-4" aria-hidden="true" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <PasswordInput
          label="Password"
          value={watch('password')}
          onChange={(value) => setValue('password', value, { shouldValidate: true })}
          onBlur={() => undefined}
          error={errors.password?.message}
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between gap-3">
          <label className="flex cursor-not-allowed items-center gap-2 text-[12px] text-fg-subtle">
            <input
              type="checkbox"
              disabled
              className="size-3.5 rounded border-line bg-inlay accent-accent"
            />
            Remember me
            <span className="text-[10px]">(needs sessions)</span>
          </label>

          <Link to="/forgot-password" className="text-[12px] font-medium text-accent hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
          Sign in
        </Button>
      </form>
    </AuthLayout>
  )
}
