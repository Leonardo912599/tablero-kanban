import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { Column } from '../interfaces/Board'
import axios from 'axios';


interface ColumnState {
    columns: Column[]
    status: 'idle' | 'loading' | 'succeeded' | 'failed',
    error: string | null;
}

const initialState: ColumnState = {
    columns: [],
    status: 'idle',
    error: null
}

export const getColumnsByBoard = createAsyncThunk("columns/getColumnsByBoard", async (id_column: number) => {
    try {
        const response = await axios.get(`http://localhost:3000/columns/${id_column}`)
        return response.data
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message)
        }
    }
})


export const columnSlice = createSlice({
    name: 'columns',
    initialState,
    reducers: {

    },
    extraReducers: (builder) => {
        builder.
            addCase(getColumnsByBoard.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.columns = action.payload
            })
    }
})
 
export default columnSlice.reducer