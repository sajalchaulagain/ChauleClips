import { zodResolver } from '@hookform/resolvers/zod'
import { AtSign, User } from 'lucide-react'
import { useState } from 'react'
import { useController, useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'

import { AuthLayout } from '@/components/auth/AuthLayout'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { passwordStrength, signupSchema, type SignupValues } from '@/services/validation'
import { registerAccount, toApiError } from '@/services/api'
import { cn } from '@/utils/cn'

const STRENGTH_COLORS = ['bg-[#2b3240]', 'bg-danger', 'bg-warning', 'bg-success']

export function SignupPage() {
  const { notify } = useToast()
  const [serverError, setServerError] = useState('')
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
    mode: 'onBlur',
  })

  // Both password fields are controlled: the strength meter reads one, the
  // match rule compares the other, and PasswordInput needs a value + setter.
  const passwordField = useController({ control, name: 'password' })
  const confirmField = useController({ control, name: 'confirmPassword' })
  const strength = passwordStrength(passwordField.field.value ?? '')

  async function onSubmit(values: SignupValues) {
    setServerError('')
    try {
      await registerAccount(values)
      notify('Your account is ready.', 'success')
      navigate('/dashboard', { replace: true })
    } catch (error) {
      const message = toApiError(error).message
      setServerError(message)
      notify(message, 'error')
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start turning long videos into clips worth posting."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-accent hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        {serverError ? <Alert tone="danger" title="Could not create account">{serverError}</Alert> : null}

        <Input
          label="Full name"
          autoComplete="name"
          placeholder="Sajal Chaulagain"
          leadingIcon={<User className="size-4" aria-hidden="true" />}
          error={errors.fullName?.message}
          {...register('fullName')}
        />

        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          leadingIcon={<AtSign className="size-4" aria-hidden="true" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <div className="space-y-1.5">
          <PasswordInput
            label="Password"
            value={passwordField.field.value ?? ''}
            onChange={(value) => passwordField.field.onChange(value)}
            onBlur={passwordField.field.onBlur}
            error={errors.password?.message}
            hint="At least 8 characters. Your password is stored as a secure Argon2id hash."
            autoComplete="new-password"
          />
          {passwordField.field.value ? (
            <div className="flex items-center gap-2">
              <div className="flex flex-1 gap-1" aria-hidden="true">
                {[0, 1, 2].map((index) => (
                  <span
                    key={index}
                    className={cn(
                      'h-1 flex-1 rounded-full transition-colors',
                      index < strength.score ? STRENGTH_COLORS[strength.score] : STRENGTH_COLORS[0],
                    )}
                  />
                ))}
              </div>
              <span className="text-[11px] text-fg-subtle">{strength.label}</span>
            </div>
          ) : null}
        </div>

        <PasswordInput
          label="Confirm password"
          value={confirmField.field.value ?? ''}
          onChange={(value) => confirmField.field.onChange(value)}
          onBlur={confirmField.field.onBlur}
          error={errors.confirmPassword?.message}
          autoComplete="new-password"
          name="confirmPassword"
        />

        <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
          Create account
        </Button>

        <p className="text-center text-[11px] leading-relaxed text-fg-subtle">
          By creating an account you agree to use ChauleClips only with video you own or have
          permission to edit.
        </p>
      </form>
    </AuthLayout>
  )
}
