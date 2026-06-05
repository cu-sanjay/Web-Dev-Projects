import React,{useState, useEffect} from 'react'
import { Container,PostCard } from '../components'
import service from '../appwrite/confi'

function Home() {
    const [posts, setPosts] = useState([])

    
    useEffect(() => {
        service.getPosts().then((posts) => {
            if (posts) {
                setPosts(posts.documents)
            }
        })
    }, [])
  
    if (posts.length === 0) {
        return (
            <div className="w-full py-16">
                <Container>
                    <div className="mx-auto max-w-2xl rounded-lg border border-stone-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-sm font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">Welcome to NSoc Blog</p>
                        <h1 className="mt-3 text-3xl font-bold text-slate-950 dark:text-white">
                            Login to read posts
                        </h1>
                        <p className="mt-3 text-slate-600 dark:text-slate-400">
                            Fresh writing will appear here as soon as posts are available.
                        </p>
                    </div>
                </Container>
            </div>
        )
    }
    return (
        <div className='w-full py-10'>
            <Container>
                <div className='mb-8'>
                    <p className='text-sm font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300'>Latest stories</p>
                    <h1 className='mt-2 text-3xl font-bold text-slate-950 dark:text-white'>Read the newest posts</h1>
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

export default Home
