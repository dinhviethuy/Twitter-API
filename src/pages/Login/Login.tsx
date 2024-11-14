import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Bounce, toast } from "react-toastify"

function Login() {
  const [params] = useSearchParams()
  const access_token = params.get('access_token')
  const refresh_token = params.get('refresh_token')
  const new_user = params.get('new_user')
  const navigate = useNavigate()
  useEffect(() => {
    if (access_token && refresh_token && new_user) {
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('refresh_token', refresh_token)
      if (new_user === 'false') {
        toast.success('Đăng nhập thành công', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          transition: Bounce,
        });
      }
      else {
        toast.success('Đăng ký thành công', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          transition: Bounce,
        });
      }
      navigate('/')
    }
  }, [access_token, refresh_token, new_user, navigate])
  return (
    <div className="flex bg-[#1F1F1F] h-[100vh] text-white justify-center items-center">
      <h1 className="text-4xl font-bold">Login</h1>
    </div>
  )
}

export default Login