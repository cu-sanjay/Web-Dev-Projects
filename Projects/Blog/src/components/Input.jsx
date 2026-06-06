import React, { forwardRef, useId } from 'react'

const Input = forwardRef(function Input(
  { label, type = 'text', className = '', ...props },
  ref
) {
  const id = useId()

  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 inline-block text-sm font-semibold text-slate-700 dark:text-slate-200" htmlFor={id}>
          {label}
        </label>
      )}
      <input
        type={type}
        className={`w-full rounded-lg border border-stone-200 bg-white px-4 py-2 text-slate-900 outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 ${className}`}
        ref={ref}
        id={id}
        {...props}
      />
    </div>
  )
})

export default Input
