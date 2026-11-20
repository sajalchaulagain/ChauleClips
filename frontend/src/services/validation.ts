/**
 * Form validation rules shared by the auth screens.
 *
 * Zod schemas live in one place so the login and signup screens cannot drift
 * apart, and so the same rules can be mirrored on the backend later (the
 * backend is always the authority — client validation is only for fast feedback).
 */
import { z } from 'zod'

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Enter a valid email address')

export const passwordSchema = z
  .string()
  .min(8, 'Use at least 8 characters')
  .max(128, 'That password is too long')

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export type LoginValues = z.infer<typeof loginSchema>

export const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Enter your full name')
      .max(80, 'That name is too long'),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })

export type SignupValues = z.infer<typeof signupSchema>

export const forgotPasswordSchema = z.object({ email: emailSchema })
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

/** Cheap, honest strength signal for the signup form (not a security control). */
export function passwordStrength(password: string): {
  score: 0 | 1 | 2 | 3
  label: string
} {
  let score = 0
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (/[^A-Za-z0-9]/.test(password) && /\d/.test(password)) score += 1

  const labels = ['Too short', 'Weak', 'Fair', 'Strong'] as const
  return { score: Math.min(score, 3) as 0 | 1 | 2 | 3, label: labels[Math.min(score, 3)] }
}
