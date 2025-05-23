import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Task, TaskRegister } from "../interfaces/Board";
import axios from "axios";

type ChangeStatusSubtaskPayload = {
    id: number;
    isCompleted: boolean;
};

type changeCurrentStatusPayload = {
    id: number;
    id_column: number,
}


interface TaskState {
    tasks: Task[],
    status: 'idle' | 'loading' | 'succeeded' | 'failed',
    error: string | null;
}

const initialState: TaskState = {
    tasks: [],
    status: 'idle',
    error: null
}

export const getAllTaskByBoard = createAsyncThunk("tasks/getAllTaskByColumn", async (id_board: number) => {
    try {
        const response = await axios.get(`http://localhost:3000/tasks/${id_board}`)
        return response.data
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message)
        }
    }
})

export const addNewTask = createAsyncThunk("tasks/addNewTask", async (task: TaskRegister) => {
    try {
        const response = await axios.post('http://localhost:3000/tasks', task)
        console.log(response.data)
        return response.data
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message)
        }
    }
})

export const changeStatusSubtask = createAsyncThunk("tasks/changeStatusSubtask", async ({ id, isCompleted }: ChangeStatusSubtaskPayload) => {
    try {
        const response = await axios.put(`http://localhost:3000/subtasks/${id}`, {
            isCompleted
        })
        return response.data
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message)
        }
    }
})

export const changeCurrentStatus = createAsyncThunk("tasks/changeCurrentStatus", async ({ id, id_column }: changeCurrentStatusPayload) => {
    try {
        const response = await axios.put(`http://localhost:3000/tasks/${id}`, {
            id_column
        })
        return response.data
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message)
        }
    }
})

export const deleteTask = createAsyncThunk("tasks/deleteTask", async (id: number) => {
    try {
        const response = await axios.delete(`http://localhost:3000/tasks/${id}`)
        return response.data
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message)
        }
    }
})

export const editTask = createAsyncThunk("tasks/editTask", async (task: Task) => {
    try {
        const response = await axios.put(`http://localhost:3000/tasks`, task)
        return response.data
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message)
        }
    }
})

export const changeOrderTasks = createAsyncThunk("tasks/changeOrderTasks", async (tasks: Task[]) => {
    try {
        const response = await axios.put("http://localhost:3000/tasks/change-order", {tasks})
        return response.data
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message)
        }
    }
})

export const taskSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {

    },
    extraReducers: (builder) => {
        builder.
            addCase(getAllTaskByBoard.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.tasks = action.payload
            })
            .addCase(addNewTask.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.tasks.push(action.payload)
            })
            .addCase(changeStatusSubtask.fulfilled, (state, action) => {
                state.status = 'succeeded'
                const updatedSubtask = action.payload;

                const task = state.tasks.find(t => t.id_task === updatedSubtask.task.id_task)
                const subtask = task?.subtasks.find(s => s.id_subtask === updatedSubtask.id_subtask)
                if (subtask) {
                    subtask.isCompleted = updatedSubtask.isCompleted
                }
            })
            .addCase(changeCurrentStatus.fulfilled, (state) => {
                state.status = 'succeeded'
            })
            .addCase(editTask.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.tasks = state.tasks.map(t =>
                    t.id_task === action.payload.id_task ? action.payload : t
                )
            })
            .addCase(deleteTask.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.tasks = state.tasks.filter(t => t.id_task !== action.payload.id_task)
            })
            .addCase(changeOrderTasks.fulfilled, (state) => {
                state.status = 'succeeded';
                // const updatedTasks = action.payload; 
                // state.tasks = state.tasks.map(task => {
                //     const updated = updatedTasks.find((t:Task) => t.id_task === task.id_task);
                //     return updated ? updated : task;
                // });
            });
    },
})

export default taskSlice.reducer