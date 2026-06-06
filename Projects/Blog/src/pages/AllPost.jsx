import React, {useState, useEffect} from 'react'
import { Container, PostCard } from '../components'
import appwriteService from "../appwrite/confi";

function AllPosts() {
    const [posts, setPosts] = useState([])
    useEffect(() => {
        appwriteService.getPosts([]).then((posts) => {
            if (posts) {
                setPosts(posts.documents)
            }
        })
    }, [])
  return (
    <div className='w-full py-10'>
        <Container>
            <div className='mb-8'>
                <p className='text-sm font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300'>Library</p>
                <h1 className='mt-2 text-3xl font-bold text-slate-950 dark:text-white'>All blog posts</h1>
            </div>
            <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                {posts.map((post) => (
                    <div key={post.$id}>
                        <PostCard {...post} />
                    </div>
                ))}
            </div>
            </Container>
    </div>
  )
}

export default AllPosts
