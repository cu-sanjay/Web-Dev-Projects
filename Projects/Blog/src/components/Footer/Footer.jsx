import React from 'react'
import Logo from '../Logo'

function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-stone-200 bg-white py-8 dark:border-slate-800 dark:bg-slate-950">
            <div className="relative z-10 mx-auto max-w-7xl px-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="inline-flex items-center gap-3">
                        <Logo width="56px" />
                        <div>
                            <p className="font-semibold text-slate-900 dark:text-white">NSoc Blog</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Stories, notes, and ideas worth keeping.</p>
                        </div>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        &copy; Copyright 2026. All Rights Reserved.
                    </p>
                </div>
            </div>
        </footer>
  )
}

export default Footer
