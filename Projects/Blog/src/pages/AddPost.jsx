import React from 'react'
import { PostForm,Container } from '../components'

function AddPost() {
  return (
    <div className='py-10'>
        <Container>
            <div className='mb-8'>
                <p className='text-sm font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300'>Create</p>
                <h1 className='mt-2 text-3xl font-bold text-slate-950 dark:text-white'>Write a new post</h1>
            </div>
            <PostForm />
        </Container>
    </div>
  )
}

export default AddPost
