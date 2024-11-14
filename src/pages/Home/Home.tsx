import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Bounce, toast } from "react-toastify"

interface Query {
  client_id: string
  redirect_uri: string
  response_type: string
  scope: string
  prompt: string
  [key: string]: string
  access_type: string
}

const getGoogleAuthUrl = () => {
  const { VITE_GOOGLE_CLIENT_ID, VITE_GOOGLE_GOOGLE_REDIRECT_URI } = import.meta.env
  const url = `https://accounts.google.com/o/oauth2/v2/auth`
  const query: Query = {
    client_id: VITE_GOOGLE_CLIENT_ID,
    redirect_uri: VITE_GOOGLE_GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ].join(' '),
    prompt: 'consent',
    access_type: 'offline'
  }
  const queryString = new URLSearchParams(query).toString()
  return `${url}?${queryString}`
}

const googleOauthUrl = getGoogleAuthUrl()

function Home() {
  const [isLogin, setIsLogin] = useState<boolean>(Boolean(localStorage.getItem('access_token')))
  useEffect(() => {

  }, [isLogin])
  const handleLogout = () => {
    localStorage.clear()
    setIsLogin(false)
    toast.success('Đăng xuất thành công', {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      transition: Bounce,
    })
  }
  return (
    <div className="flex justify-center items-center flex-col h-[100vh] bg-[#1F1F1F] text-white" >
      <h1 className="text-4xl font-bold mb-8">Google OAuth 2.0</h1>
      {isLogin ? <button className="bg-red-400 px-4 py-2 rounded-md hover:bg-red-500" onClick={handleLogout}>Logout</button> :
        <Link to={googleOauthUrl} className="bg-red-400 px-4 py-2 rounded-md hover:bg-red-500">Login with Google </Link>}
    </div >
  )
}

export default Home