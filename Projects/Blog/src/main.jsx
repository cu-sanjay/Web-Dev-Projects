import { Children, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Provider } from 'react-redux'
import App from './App.jsx'
import store from './store/store.js'
import { createBrowserRouter } from 'react-router-dom'
import Home from './pages/Home.jsx'
import AllPost from './pages/AllPost.jsx'
import AddPost from './pages/AddPost.jsx'
import EditPost from './pages/EditPost.jsx'
import Post from './pages/Post.jsx'
import Signup from './pages/Signup.jsx'
import { RouterProvider } from 'react-router-dom'
import {AuthLayout , Login} from './components/index.js'

const router = createBrowserRouter([{
  path: '/',
  element: <App />,
  children: [
    {
      path: '/',
      element: <Home />
    },
    {
      path: "/login",
      element: (
        <AuthLayout authentication={false}>
          <Login />
        </AuthLayout>
      )
    },
    {
      path: "/signup",
      element: (
        <AuthLayout authentication={false}>
          <Signup />
        </AuthLayout>
      ),
    },
    {
      path: "/all-posts",
      element: (
        <AuthLayout authentication>
          {" "}
          <AllPost />
        </AuthLayout>
      ),
    },
    {
      path: "/add-post",
      element: (
        <AuthLayout authentication>
          {" "}
          <AddPost />
        </AuthLayout>
      ),
    },
    {
      path: "/edit-post/:slug",
      element: (
        <AuthLayout authentication>
          {" "}
          <EditPost />
        </AuthLayout>
      ),
    },
    {
      path: "/post/:slug",
      element: <Post />,
    },
  ]
}])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
)
