
import Board from "./components/Board"
import Header from "./components/Header"
import Sidebar from "./components/Sidebar"


const App = () => {
  // localStorage.clear()
  return (
    <div className="w-full h-[100dvh] flex flex-col overflow-hidden">
      <div className="h-20 flex-shrink-0">
        <Header />
      </div>
      <div className="flex flex-row w-full flex-1 overflow-hidden">
        <Sidebar />
        <Board />
      </div>
    </div>
  )
}

export default App