import Header from "../components/Header"
import PomodoroTimer from "../features/PomodoroTimer"
import Footer from "../components/Footer"
import '../styles/Home.css';

export function Home(){
  return(
    <>
      <div className="main-content">
        <Header />
        <PomodoroTimer />
      </div>
      <Footer />   
    </>
  )

}

