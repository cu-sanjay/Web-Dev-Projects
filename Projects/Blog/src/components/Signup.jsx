import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login as authLogin } from '../store/authSlice'
import authService from '../appwrite/auth'
import { Button, Input, Logo } from './index'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'

function Signup() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { register, handleSubmit } = useForm()
    const [error, setError] = useState("")

    const signup = async (data) => {
        setError("")
        try {
            const userData = await authService.createAccount(data)
            if (userData) {
                const userData = await authService.getCurrentUser();
                if (userData) dispatch(authLogin({ userData }))
                navigate("/")
            }
        }
        catch (error) {
            setError(error.message)
        }
    }

    return (
        <div className="flex items-center justify-center px-4">
            <div className='mx-auto w-full max-w-lg rounded-lg border border-stone-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-10'>
                <div className="mb-2 flex justify-center">
                    <span className="inline-block w-full max-w-24">
                        <Logo width="100%" />
                    </span>
                </div>
                <h2 className="text-center text-2xl font-bold leading-tight text-slate-950 dark:text-white">Sign up to create account</h2>
                <p className="mt-2 text-center text-base text-slate-600 dark:text-slate-400">
                    Already have an account?&nbsp;
                    <Link
                        to="/login"
                        className="font-semibold text-amber-700 transition-all duration-200 hover:underline dark:text-amber-300"
                    >
                        Sign In
                    </Link>
                </p>
                {error && <p className="mt-8 rounded-lg bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</p>}

                <form onSubmit={handleSubmit(signup)} className='mt-8'>
                    <div className='space-y-5'>
                        <Input
                            label="Name"
                            type="text"
                            placeholder="Enter your name"
                            {...register("name", { required: true })}
                        />
                        <Input
                            label="Email"
                            type="email"
                            placeholder="Enter your email"
                            {...register("email", { required: true })}
                        />
                        <Input
                            label="Password"
                            type="password"
                            placeholder="Enter your password"
                            {...register("password", { required: true })}
                        />
                        <Input
                            label="Confirm Password"
                            type="password"
                            placeholder="Re-enter your password"
                            {...register("confirmPassword", { required: true })}
                        />
                        <Button type="submit" variant="primary" className="w-full"> Create Account </Button>
                    </div>
                </form >
            </div>
        </div>
    )
}

export default Signup
