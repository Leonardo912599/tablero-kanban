import { createSlice } from '@reduxjs/toolkit'
import { Board, Task } from '../interfaces/Board'
import type { PayloadAction } from '@reduxjs/toolkit'
import { seleccionarColorAleatorio } from '../utils/colores'

export interface Boards {
    boards: Board[]
}

const list_boards: Board[] = [
    {
        name: 'Example Board',
        columns: [
            {
                name: 'todo',
                color: seleccionarColorAleatorio(),
                tasks: []
            },
            {
                name: 'doing',
                color: seleccionarColorAleatorio(),
                tasks: []
            }
        ]
    }
]
const loadState = () => {
    try {
        const savedState = localStorage.getItem("boards");
        return savedState ? JSON.parse(savedState) : list_boards;
    } catch (error) {
        console.error("Error loading boards from localStorage:", error);
        return [];
    }
};

const saveState = (boards: Board[]) => {
    try {
        localStorage.setItem("boards", JSON.stringify(boards));
    } catch (error) {
        console.error("Error saving boards to localStorage:", error);
    }
};

const initialState: Boards = {
    boards: loadState()
}
export const boardSlice = createSlice({
    name: 'boards',
    initialState,
    reducers: {
        addBoard: (state, action: PayloadAction<Board>) => {
            state.boards.push(action.payload)
            saveState(state.boards)
        },
        editBoard: (state, action: PayloadAction<{ index: number, board: Board }>) => {
            const { index, board } = action.payload;
            state.boards[index] = board;
            saveState(state.boards)
        },
        addNewTask: (state, action: PayloadAction<{ index: number, task: Task }>) => {
            const { index, task } = action.payload
            const column = state.boards[index].columns.find(b => b.name == task.status)
            column?.tasks.push(task)
            saveState(state.boards)
        },
        changeOrderTask: (state, action: PayloadAction<{ indexBoard: number, indexColumn: number, newTasks: Task[] }>) => {
            const { indexBoard, indexColumn, newTasks } = action.payload

            state.boards[indexBoard].columns[indexColumn].tasks = newTasks
            saveState(state.boards)
        },
        editTask: (state, action: PayloadAction<{ indexBoard: number; indexTask: number; prevStatus: string; task: Task; }>) => {
            const { indexBoard, indexTask, prevStatus, task } = action.payload;

            const board = state.boards[indexBoard];
            const prevColumn = board.columns.find(c => c.name === prevStatus);
            const newColumn = board.columns.find(c => c.name === task.status);

            if (!prevColumn || !newColumn) return;

            if (prevColumn === newColumn) {
                newColumn.tasks[indexTask] = task;
                saveState(state.boards)
                return;
            }

            const [removedTask] = prevColumn.tasks.splice(indexTask, 1);
            newColumn.tasks.push({ ...removedTask, ...task });
            saveState(state.boards)
        },
        changeStatusSubtask: (state, action: PayloadAction<{ indexBoard: number; indexColumn: number; indexTask: number; indexSubtask: number }>) => {
            const { indexBoard, indexColumn, indexTask, indexSubtask } = action.payload;

            const task = state.boards[indexBoard].columns[indexColumn].tasks[indexTask];
            if (!task) return;

            task.subtasks[indexSubtask].isCompleted = !task.subtasks[indexSubtask].isCompleted;
            saveState(state.boards)
        },
        changeStatusTask: (state, action: PayloadAction<{ indexBoard: number; indexColumn: number; indexTask: number; newNameColumn: string; }>) => {
            const { indexBoard, indexColumn, indexTask, newNameColumn } = action.payload;

            const board = state.boards[indexBoard];
            const currentColumn = board.columns[indexColumn];
            if (!currentColumn) return;

            const [taskToMove] = currentColumn.tasks.splice(indexTask, 1);
            if (!taskToMove) return;

            taskToMove.status = newNameColumn;

            const newColumn = board.columns.find((c) => c.name === newNameColumn);
            if (!newColumn) return;

            newColumn.tasks.push(taskToMove);
            saveState(state.boards)
        },
        deleteTask: (state, action: PayloadAction<{ indexBoard: number; task: Task }>) => {
            const { indexBoard, task } = action.payload
            const currentColumn = state.boards[indexBoard].columns.find(c => c.name === task.status);
            if (!currentColumn) return;

            currentColumn.tasks = currentColumn.tasks.filter(t => t.title !== task.title);
            saveState(state.boards)
        },
        clearBoard: (state, action: PayloadAction<number>) => {
            const indexBoard = action.payload
            const board = state.boards[indexBoard]
            if (!board) return
            board.columns = []
            saveState(state.boards)
        },
        deleteBoard: (state, action: PayloadAction<number>) => {
            const indexBoard = action.payload

            if (state.boards.length > 1) {
                state.boards = state.boards.filter((_, i) => i !== indexBoard)
                saveState(state.boards)
            }
        },
        resetBoards: (state) => {
            state.boards = state.boards.filter((_, i) => i == 0)
            saveState(state.boards)
        }

    }
})

export const { addBoard, editBoard, addNewTask, editTask, changeStatusSubtask, changeStatusTask, deleteTask, clearBoard, deleteBoard, resetBoards,changeOrderTask } = boardSlice.actions

export default boardSlice.reducer