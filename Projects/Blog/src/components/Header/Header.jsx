import React from 'react'
import {Container,Logo, LogoutBtn} from '../index';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ThemeBtn from '../ThemeBtn';

function Header() {
  const authStatus = useSelector((state) => state.auth.status)
  const navigate = useNavigate();

  const naItems = [
    {
      name: "Home",
      slug: "/",
      active: true
    },
    {
      name: "Login",
      slug: "/login",
      active: !authStatus
    },
    {
      name: "Signup",
      slug: "/signup",
      active: !authStatus
    },
    {
      name: "Add Blog",
      slug: "/add-post",
      active: authStatus
    },
    {
      name: "All Blogs",
      slug: "/all-posts",
      active: authStatus
    }
  ]  
  return (
    <header className='sticky top-0 z-40 border-b border-stone-200 bg-stone-50/90 py-3 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/90'>
    <Container> 
      <nav className='flex flex-col gap-3 sm:flex-row sm:items-center'>
        <div className='mr-4 flex items-center gap-3'>
          <Link to='/'>
            <Logo width='70px' />
          </Link>
          <Link to='/' className='text-lg font-bold tracking-normal text-slate-900 dark:text-white'>
            NSoc Blog
          </Link>
        </div>
        <ul className='flex flex-wrap items-center gap-2 sm:ml-auto'>
          {naItems.map((item) => 
            item.active ? (
              <li key={item.name}>
                <button onClick={() => navigate(item.slug)} className='inline-block rounded-full px-4 py-2 text-sm font-medium cursor-pointer text-slate-700 duration-200 hover:bg-amber-100 hover:text-amber-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-amber-300'>{item.name}</button>
              </li>) : null
          )}
          {authStatus && (
            <li>
              <LogoutBtn />
            </li>
          )}
          <li>
            <ThemeBtn />
          </li>
        </ul>
      </nav>
    </Container>
  </header>
  )
}

export default Header
