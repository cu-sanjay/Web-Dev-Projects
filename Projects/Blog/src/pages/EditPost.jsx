import React,{useState, useEffect} from 'react'
import { Container, PostForm } from '../components'
import service from '../appwrite/confi'
import { useParams, useNavigate } from 'react-router-dom'

function EditPost() {
    const [post, setPosts] = useState(null)
    const {slug} = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        if (slug) {
            service.getPost(slug).then((post) => {
                if (post) {
                    setPosts(post)
                }
            })
        } else {
            navigate('/')
        }
    }, [slug, navigate])
  return post ? (
    <div className='py-10'>
        <Container>
            <div className='mb-8'>
                <p className='text-sm font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300'>Edit</p>
                <h1 className='mt-2 text-3xl font-bold text-slate-950 dark:text-white'>Update your post</h1>
            </div>
            <PostForm post={post} />
        </Container>
    </div>
  ) : null
}

export default EditPost
