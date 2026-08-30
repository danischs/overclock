import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { Home } from "../pages/Home.jsx";
import { Login } from "../pages/Login.jsx"


function App() {
  return(
    <Router>
      <Routes>
        <Route path = "/" element = {<Login/>}/>
        <Route path = "/home" element = {<Home/>}/>
      </Routes>
    </Router>
  )


}

export default App
