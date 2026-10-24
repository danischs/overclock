import Header from "../components/Header";
import PomodoroTimer from "../features/PomodoroTimer";
import TaskBoard from "../features/TaskBoard";
import Footer from "../components/Footer";
import "../styles/Home.css";

export function Home({ userId }) {
  return (
    <>
      <Header />
      <main className="home">
        <h1 className="sr-only">Focus</h1>
        <PomodoroTimer userId={userId} />
        <TaskBoard userId={userId} />
      </main>
      <Footer />
    </>
  );
}
