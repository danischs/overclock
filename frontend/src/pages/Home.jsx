import Header from "../components/Header"
import PomodoroTimer from "../features/PomodoroTimer"
import TaskBoard from "../features/TaskBoard"
import Footer from "../components/Footer"
import '../styles/Home.css';

export function Home({ userId }){
  return(
    <>
      <div className="main-content">
        <Header />
        <PomodoroTimer userId={userId} />
        <TaskBoard userId={userId} />
      </div>
      <Footer />
    </>
  )

}

