import React, { useId } from 'react'

function Select({
    options,
    label,
    className,
    ...props
}, ref) {
    const id = useId()
  return (
    <div className='w-full'>
        {label && <label htmlFor={id} className='mb-1.5 inline-block text-sm font-semibold text-slate-700 dark:text-slate-200'>{label}</label>}
        <select {...props} id={id} ref={ref} className={`w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-slate-900 outline-none duration-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 ${className}`} >
            {options?.map((option) => 
            <option key={option} value={option}>{option}</option>
            )}
        </select>
    </div>
  )
}

export default React.forwardRef(Select)
