import React,{useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

export default function Protected({children, authentication = true}) {
    const navigate = useNavigate()
    const authStatus = useSelector(state => state.auth.status)
     useEffect(() => {
      if(authentication && !authStatus){
        navigate("/login")
      }
      else if(!authentication && authStatus){
        navigate("/")
      }
    }, [authStatus, navigate, authentication])

  return children
  
}
