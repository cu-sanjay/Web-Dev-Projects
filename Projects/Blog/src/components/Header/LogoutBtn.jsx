import React from 'react'
import authService from '../../appwrite/auth';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';

function LogoutBtn() {
    const dispatch = useDispatch()
    const logoutHandler = () => {
        authService.logout().then(() => {
            dispatch(logout())
        })
    }
  return (
    <button
    className='inline-block rounded-full px-4 py-2 text-sm font-medium text-slate-700 duration-200 hover:bg-red-50 hover:text-red-700 dark:text-slate-200 dark:hover:bg-red-950/50 dark:hover:text-red-300'
    onClick={logoutHandler}
    >Logout</button>
  )
}

export default LogoutBtn
