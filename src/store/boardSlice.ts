import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { Board, BoardRegister } from '../interfaces/Board'
import axios from 'axios'
import { RootState } from './store'

interface BoardState {
    boards: Board[]
    status: 'idle' | 'loading' | 'succeeded' | 'failed',
    error: string | null;
}

export const getAllBoards = createAsyncThunk("boards/getAllBoards", async () => {
    try {
        const response = await axios.get('http://localhost:3000/boards')
        return response.data
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message)
        }
    }
})

export const createBoard = createAsyncThunk("boards/createBoard", async (board: BoardRegister) => {
    try {
        const response = await axios.post('http://localhost:3000/boards', board)
        return response.data
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message)
        }
    }
})

export const editBoard = createAsyncThunk("boards/editBoard", async (board: Board) => {
    try {
        const response = await axios.put('http://localhost:3000/boards', board)
        return response.data
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message)
        }
    }
})

export const clearBoard = createAsyncThunk("boards/clearBoard", async (id: number) => {
    try {
        const response = await axios.put(`http://localhost:3000/boards/${id}`)
        return response.data
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message)
        }
    }
})

export const deleteBoard = createAsyncThunk("boards/deleteBoard", async (id: number) => {
    try {
        const response = await axios.delete(`http://localhost:3000/boards/delete/${id}`)
        return response.data
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message)
        }
    }

})

export const resetBoardsThunk = createAsyncThunk("boards/resetBoardsThunk", async () => {
    try {
        const response = await axios.delete('http://localhost:3000/boards/reset');
        console.log(response.data)
        return response.data;
    } catch (error: any) {

        if (error instanceof Error) {
            console.log(error.message)
        }
    }
});


export const selectMinBoardId = (state: RootState): number | null => {
  const boards = state.boards.boards;
  if (boards.length === 0) return null;
  return Math.min(...boards.map(b => b.id_board));
};


const initialState: BoardState = {
    boards: [],
    status: 'idle',
    error: null
}
export const boardSlice = createSlice({
    name: 'boards',
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAllBoards.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.boards = action.payload
            })
            .addCase(createBoard.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.boards.push(action.payload)
            })
            .addCase(editBoard.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.boards = state.boards.map((b) =>
                    b.id_board === action.payload.id_board ? action.payload : b
                );
            })
            .addCase(clearBoard.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.boards = state.boards.map(b =>
                    b.id_board === action.payload.id_board ? action.payload : b
                )
            })
            .addCase(deleteBoard.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.boards = state.boards.filter(b => b.id_board !== action.payload.id_board)
            })
            .addCase(resetBoardsThunk.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.boards = action.payload
            })

    }
})

export default boardSlice.reducer