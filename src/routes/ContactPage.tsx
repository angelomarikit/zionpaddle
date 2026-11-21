import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { SectionShell } from '../components/tempo/SectionShell'
import { Button } from '../components/ui/Button'
import { submitContactInquiry } from '../services/contact'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  topic: z.enum(['general', 'orders', 'warranty', 'wholesale']),
  message: z.string().min(10),
})

type FormValues = z.infer<typeof schema>

const fieldClass =
  'mt-1 w-full rounded border border-black/15 bg-white px-3 py-2 text-sm focus:border-accent-coral focus:outline-none'

export function ContactPage() {
  const [sent, setSent] = useState<{ store: string } | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { topic: 'general' },
  })

  const onSubmit = handleSubmit(async (values) => {
    const result = await submitContactInquiry(values)
    setSent({ store: result.store })
  })

  return (
    <SectionShell surface="cream" className="min-h-[60vh] pt-28" wide>
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-cream-muted">Contact</p>
      <h1 className="mt-2 text-4xl font-bold">Talk to ZION</h1>
      <p className="mt-3 max-w-xl text-cream-muted">
        Orders, grip fit, wholesale, and warranty — we reply within 2 business days.
      </p>

      {sent ? (
        <p className="mt-10 rounded-lg border border-black/10 bg-white/80 p-6 text-sm">
          Message received. {sent.store === 'supabase' ? 'Stored in Supabase.' : 'Stored locally until Supabase is connected.'}
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-10 grid max-w-xl gap-4">
          <label>
            Name
            <input className={fieldClass} {...register('name')} />
            {errors.name ? <span className="text-xs text-accent-coral">{errors.name.message}</span> : null}
          </label>
          <label>
            Email
            <input type="email" className={fieldClass} {...register('email')} />
            {errors.email ? <span className="text-xs text-accent-coral">{errors.email.message}</span> : null}
          </label>
          <label>
            Phone (optional)
            <input className={fieldClass} {...register('phone')} />
          </label>
          <label>
            Topic
            <select className={fieldClass} {...register('topic')}>
              <option value="general">General</option>
              <option value="orders">Orders</option>
              <option value="warranty">Warranty</option>
              <option value="wholesale">Wholesale</option>
            </select>
          </label>
          <label>
            Message
            <textarea className={`${fieldClass} min-h-[120px]`} {...register('message')} />
            {errors.message ? <span className="text-xs text-accent-coral">{errors.message.message}</span> : null}
          </label>
          <Button type="submit" variant="coral" className="w-fit" disabled={isSubmitting}>
            {isSubmitting ? 'Sending…' : 'Send message'}
          </Button>
        </form>
      )}
    </SectionShell>
  )
}