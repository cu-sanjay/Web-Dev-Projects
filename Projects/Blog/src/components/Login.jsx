import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login as authLogin } from '../store/authSlice'
import { Button, Input, Logo } from './index'
import { useDispatch } from 'react-redux'
import authService from '../appwrite/auth'
import { useForm } from 'react-hook-form'

function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { register, handleSubmit } = useForm()
  const [error, setError] = useState("")

  const login = async (data) => {
    setError("")
    try {
      const session = await authService.login(data)
      if (session) {
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
    <div className='flex w-full items-center justify-center px-4'>
      <div className='mx-auto w-full max-w-lg rounded-lg border border-stone-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-10'>
        <div className="mb-2 flex justify-center">
          <span className="inline-block w-full max-w-24">
            <Logo width="100%" />
          </span>
        </div>
        <h2 className="text-center text-2xl font-bold leading-tight text-slate-950 dark:text-white">Sign in to your account</h2>
        <p className="mt-2 text-center text-base text-slate-600 dark:text-slate-400">
          Don&apos;t have any account?&nbsp;
          <Link
            to="/signup"
            className="font-semibold text-amber-700 transition-all duration-200 hover:underline dark:text-amber-300"
          >
            Sign Up
          </Link>
        </p>
        {error && <p className="mt-8 rounded-lg bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</p>}
        <form onSubmit={handleSubmit(login)} className='mt-8'>
          <div className='space-y-5'>
            <Input
              label="Email: "
              placeholder="Enter your email"
              type="email"
              {...register("email", {
                required: true,
                validate: {
                  matchPatern: (value) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                    "Email address must be a valid address",
                }
              })}
            />
            <Input
              label="Password: "
              type="password"
              placeholder="Enter your password"
              {...register("password", {
                required: true,
              })}
            />
            <Button
              type="submit"
              className="w-full"
            >Login</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
