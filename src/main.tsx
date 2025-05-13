import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { Provider } from 'react-redux'
import { store } from './store/store.ts'
import { BoardProvider } from './context/BoardContext.tsx'
import { ModeProvider } from './context/ModeContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ModeProvider>
        <BoardProvider>
          <App />
        </BoardProvider>
      </ModeProvider>
    </Provider>
  </StrictMode>,
)
