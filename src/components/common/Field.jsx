import { forwardRef, useId, useState } from 'react'
import { AlertCircle, Check, ChevronDown, Eye, EyeOff } from 'lucide-react'
import cn from '@utils/cn'

/* -------------------------------------------------------------------------
   TextField — the underline-first input used across the site.
   ---------------------------------------------------------------------- */
export const TextField = forwardRef(function TextField(
  {
    label,
    id,
    error,
    hint,
    variant = 'line',
    tone = 'dark',
    className,
    inputClassName,
    icon: Icon,
    required,
    success,
    ...rest
  },
  ref,
) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const describedBy = [error && `${fieldId}-error`, hint && `${fieldId}-hint`]
    .filter(Boolean)
    .join(' ') || undefined

  const base =
    variant === 'box'
      ? 'mj-field-box'
      : tone === 'light'
        ? 'mj-field-line-light'
        : 'mj-field-line'

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label
          htmlFor={fieldId}
          className={cn('mj-field-label', tone === 'light' && 'text-ivory/60')}
        >
          {label}
          {required && <span className="ml-1 text-gold">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            className={cn(
              'pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2',
              variant === 'box' && 'left-4',
              tone === 'light' ? 'text-ivory/45' : 'text-charcoal-50',
            )}
            strokeWidth={1.4}
            aria-hidden="true"
          />
        )}
        <input
          ref={ref}
          id={fieldId}
          required={required}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          className={cn(
            base,
            Icon && (variant === 'box' ? 'pl-11' : 'pl-7'),
            error && '!border-error',
            success && '!border-success',
            inputClassName,
          )}
          {...rest}
        />
        {success && !error && (
          <Check
            className="absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-success"
            strokeWidth={2}
            aria-hidden="true"
          />
        )}
      </div>
      {hint && !error && (
        <p
          id={`${fieldId}-hint`}
          className={cn(
            'mt-2 font-sans text-body-xs',
            tone === 'light' ? 'text-ivory/50' : 'text-charcoal-50',
          )}
        >
          {hint}
        </p>
      )}
      {error && (
        <p id={`${fieldId}-error`} className="mj-field-error" role="alert">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={1.6} aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  )
})

/* -------------------------------------------------------------------------
   PasswordField — text field with a visibility toggle.
   ---------------------------------------------------------------------- */
export function PasswordField({ className, inputClassName, variant = 'line', ...props }) {
  const [visible, setVisible] = useState(false)
  return (
    <div className={cn('relative', className)}>
      <TextField
        {...props}
        variant={variant}
        type={visible ? 'text' : 'password'}
        inputClassName={cn('pr-10', inputClassName)}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-0 top-[2.3rem] rounded p-1 text-charcoal-50 transition-colors duration-300 hover:text-charcoal"
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? (
          <EyeOff className="h-4 w-4" strokeWidth={1.4} />
        ) : (
          <Eye className="h-4 w-4" strokeWidth={1.4} />
        )}
      </button>
    </div>
  )
}

/* -------------------------------------------------------------------------
   TextArea
   ---------------------------------------------------------------------- */
export const TextArea = forwardRef(function TextArea(
  { label, id, error, hint, rows = 5, className, required, ...rest },
  ref,
) {
  const generatedId = useId()
  const fieldId = id ?? generatedId

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label htmlFor={fieldId} className="mj-field-label">
          {label}
          {required && <span className="ml-1 text-gold">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={fieldId}
        rows={rows}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={cn('mj-field-line resize-none', error && '!border-error')}
        {...rest}
      />
      {hint && !error && <p className="mt-2 font-sans text-body-xs text-charcoal-50">{hint}</p>}
      {error && (
        <p id={`${fieldId}-error`} className="mj-field-error" role="alert">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={1.6} aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  )
})

/* -------------------------------------------------------------------------
   SelectField
   ---------------------------------------------------------------------- */
export const SelectField = forwardRef(function SelectField(
  { label, id, error, options = [], className, required, placeholder, ...rest },
  ref,
) {
  const generatedId = useId()
  const fieldId = id ?? generatedId

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label htmlFor={fieldId} className="mj-field-label">
          {label}
          {required && <span className="ml-1 text-gold">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={fieldId}
          required={required}
          aria-invalid={error ? 'true' : undefined}
          className={cn('mj-field-line appearance-none pr-8', error && '!border-error')}
          {...rest}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => {
            const value = typeof option === 'string' ? option : option.value
            const text = typeof option === 'string' ? option : option.label
            return (
              <option key={value} value={value}>
                {text}
              </option>
            )
          })}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-50"
          strokeWidth={1.4}
          aria-hidden="true"
        />
      </div>
      {error && (
        <p className="mj-field-error" role="alert">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={1.6} aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  )
})

/* -------------------------------------------------------------------------
   Checkbox & Radio
   ---------------------------------------------------------------------- */
export function Checkbox({ label, id, description, className, tone = 'dark', ...rest }) {
  const generatedId = useId()
  const fieldId = id ?? generatedId

  return (
    <div className={cn('flex items-start gap-3', className)}>
      <span className="relative mt-0.5 flex h-[1.05rem] w-[1.05rem] shrink-0">
        <input
          id={fieldId}
          type="checkbox"
          className="peer h-full w-full cursor-pointer appearance-none rounded-xs border border-charcoal/30 bg-transparent transition-all duration-300 ease-luxe checked:border-gold checked:bg-gold focus-visible:outline-2"
          {...rest}
        />
        <Check
          className="pointer-events-none absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 scale-0 text-espresso opacity-0 transition-all duration-200 peer-checked:scale-100 peer-checked:opacity-100"
          strokeWidth={3}
          aria-hidden="true"
        />
      </span>
      <label
        htmlFor={fieldId}
        className={cn(
          'cursor-pointer select-none font-sans text-body-sm leading-relaxed',
          tone === 'light' ? 'text-ivory/75' : 'text-charcoal-200',
        )}
      >
        {label}
        {description && (
          <span className="mt-0.5 block font-sans text-body-xs text-charcoal-50">{description}</span>
        )}
      </label>
    </div>
  )
}

export function RadioCard({ label, description, meta, checked, className, ...rest }) {
  const generatedId = useId()
  return (
    <label
      htmlFor={generatedId}
      className={cn(
        'flex cursor-pointer items-start gap-3.5 rounded-card border p-4 transition-all duration-400 ease-luxe',
        checked
          ? 'border-gold bg-gold/[0.06] shadow-hairline'
          : 'border-charcoal/12 bg-transparent hover:border-charcoal/25 hover:bg-ivory-50',
        className,
      )}
    >
      <span className="relative mt-0.5 flex h-[1.05rem] w-[1.05rem] shrink-0">
        <input
          id={generatedId}
          type="radio"
          checked={checked}
          className="peer h-full w-full cursor-pointer appearance-none rounded-full border border-charcoal/30 transition-all duration-300 checked:border-gold"
          {...rest}
        />
        <span className="pointer-events-none absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-gold transition-transform duration-200 peer-checked:scale-100" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="font-sans text-body-sm font-medium text-charcoal">{label}</span>
          {meta && <span className="font-sans text-body-xs text-charcoal-100">{meta}</span>}
        </span>
        {description && (
          <span className="mt-1 block font-sans text-body-xs leading-relaxed text-charcoal-100">
            {description}
          </span>
        )}
      </span>
    </label>
  )
}
