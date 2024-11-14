import { useRoutes } from "react-router-dom"
import { route } from "../../routes/route"


const AllRouter = () => {
  const routes = useRoutes(route)
  return (
    <>{routes}</>
  )
}

export default AllRouter