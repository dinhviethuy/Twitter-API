import AllRouter from "./components/AllRoutes"
import './index.css'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
      <AllRouter />
      <ToastContainer />
    </>
  )
}

export default App
