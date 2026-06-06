import React from 'react'
import appwriteService from "../appwrite/confi"
import {Link} from 'react-router-dom'

function PostCard({$id, title, featuredImage}) {
    
  return (
    <Link to={`/post/${$id}`}>
        <article className='group h-full w-full overflow-hidden rounded-lg border border-stone-200 bg-white p-3 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-amber-500/60'>
            <div className='mb-4 aspect-16/10 w-full overflow-hidden rounded-md bg-stone-100 dark:bg-slate-800'>
                <img src={appwriteService.getFileView(featuredImage)} alt={title}
                className='h-full w-full object-cover transition duration-300 group-hover:scale-105' />

            </div>
            <h2
            className='line-clamp-2 text-lg font-bold text-slate-900 dark:text-white'
            >{title}</h2>
        </article>
    </Link>
  )
}


export default PostCard
