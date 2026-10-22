import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { Home } from "../pages/Home.jsx";
import { Login } from "../pages/Login.jsx"


function App() {
  const [userId, setUserId] = useState(null);

  return(
    <Router>
      <Routes>
        <Route path = "/" element = {<Login setUserId={setUserId}/>}/>
        <Route path = "/home" element = {<Home userId={userId}/>}/>
      </Routes>
    </Router>
  )


}

export default App
