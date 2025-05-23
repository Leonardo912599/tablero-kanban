import { configureStore } from '@reduxjs/toolkit'
import boardReducer from './boardSlice'
import columnReducer from './columnSlice'
import taskReducer from './taskSlice'

export const store = configureStore({
  reducer: {
    boards:boardReducer,
    columns:columnReducer,
    tasks:taskReducer
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch