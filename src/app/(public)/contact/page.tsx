'use client'

import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { CheckCircle2, Loader2, Send, TriangleAlert } from 'lucide-react'
import { NBButton } from '@/components/site/NBButton'
import { Badge, StickerCard, StatusPill } from '@/components/site/primitives'

const TOPICS = ['Printing problem', 'Payment issue', 'Kiosk location', 'Partnership', 'Other'] as const

interface FormValues {
  name: string
  email: string
  topic: string
  message: string
}

type FormErrors = Partial<Record<keyof FormValues, string>>

const EMPTY: FormValues = { name: '', email: '', topic: '', message: '' }
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {}
  if (!values.name.trim()) errors.name = 'Please tell us your name.'
  if (!values.email.trim()) errors.email = 'Please enter your email so we can reply.'
  else if (!EMAIL_RE.test(values.email.trim())) errors.email = 'That email address does not look valid.'
  if (!values.topic) errors.topic = 'Please choose a topic.'
  if (!values.message.trim()) errors.message = 'Please write a short message.'
  return errors
}

function FieldError({ message, id }: { message: string; id: string }) {
  return (
    <StatusPill tone="error" icon={TriangleAlert} className="mt-2">
      <span id={id}>{message}</span>
    </StatusPill>
  )
}

export default function ContactPage() {
  const [values, setValues] = useState<FormValues>(EMPTY)
  const [errors, setErrors] = useState<FormErrors>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    update(e.target.name as keyof FormValues, e.target.value)
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const found = validate(values)
    setErrors(found)
    if (Object.keys(found).length > 0) return
    setStatus('sending')
    window.setTimeout(() => setStatus('sent'), 800)
  }

  function sendAnother() {
    setValues(EMPTY)
    setErrors({})
    setStatus('idle')
  }

  return (
    <>
      {/* Hero */}
      <section className="border-b-[3px] border-black bg-kpaper">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <Badge tone="lime">Contact</Badge>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
            Talk to a human.
          </h1>
          <p className="mt-5 max-w-2xl text-base font-medium text-black/70 sm:text-lg">
            Printing problem, payment question, or a place you think needs a kiosk — write to us and our
            team replies within one working day.
          </p>
        </div>
      </section>

      {/* Form / success */}
      <section className="bg-white">
        <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          {status === 'sent' ? (
            <StickerCard tone="lime" className="flex flex-col items-center gap-4 p-8 text-center sm:p-12">
              <span className="flex size-20 items-center justify-center rounded-full border-[3px] border-black bg-white">
                <CheckCircle2 className="size-10" strokeWidth={2.5} aria-hidden />
              </span>
              <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Message received — our team replies within one working day.
              </h2>
              <p className="max-w-md font-semibold text-black/70">
                We sent nothing to spam, and we never share your email. Keep an eye on your inbox for the
                reply.
              </p>
              <NBButton onClick={sendAnother} tone="white" size="lg">
                Send another message
              </NBButton>
            </StickerCard>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className="mb-2 block font-display text-sm font-bold uppercase tracking-wide">
                    Name
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={values.name}
                    onChange={handleChange}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'error-name' : undefined}
                    className="kb-input"
                    placeholder="Juan Dela Cruz"
                  />
                  {errors.name ? <FieldError message={errors.name} id="error-name" /> : null}
                </div>
                <div>
                  <label htmlFor="contact-email" className="mb-2 block font-display text-sm font-bold uppercase tracking-wide">
                    Email
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={values.email}
                    onChange={handleChange}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'error-email' : undefined}
                    className="kb-input"
                    placeholder="you@example.com"
                  />
                  {errors.email ? <FieldError message={errors.email} id="error-email" /> : null}
                </div>
              </div>

              <div>
                <label htmlFor="contact-topic" className="mb-2 block font-display text-sm font-bold uppercase tracking-wide">
                  Topic
                </label>
                <select
                  id="contact-topic"
                  name="topic"
                  value={values.topic}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.topic)}
                  aria-describedby={errors.topic ? 'error-topic' : undefined}
                  className="kb-input"
                >
                  <option value="">Choose a topic…</option>
                  {TOPICS.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
                {errors.topic ? <FieldError message={errors.topic} id="error-topic" /> : null}
              </div>

              <div>
                <label htmlFor="contact-message" className="mb-2 block font-display text-sm font-bold uppercase tracking-wide">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={6}
                  value={values.message}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? 'error-message' : undefined}
                  className="kb-input resize-y"
                  placeholder="Tell us what happened — kiosk name, time, and what went wrong helps a lot."
                />
                {errors.message ? <FieldError message={errors.message} id="error-message" /> : null}
              </div>

              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <NBButton
                  type="submit"
                  size="lg"
                  disabled={status === 'sending'}
                  icon={
                    status === 'sending' ? (
                      <Loader2 className="size-5 animate-spin" strokeWidth={2.5} aria-hidden />
                    ) : (
                      <Send className="size-5" strokeWidth={2.5} aria-hidden />
                    )
                  }
                >
                  {status === 'sending' ? 'Sending…' : 'Send message'}
                </NBButton>
                <p className="text-sm font-semibold text-black/55">
                  Required fields are checked before anything is sent.
                </p>
              </div>
            </form>
          )}
        </div>
      </section>
    </>
  )
}
