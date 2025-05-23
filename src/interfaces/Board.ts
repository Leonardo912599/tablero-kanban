export type Subtask = {
    id_subtask: number;
    title: string;
    isCompleted: boolean;
};

export type Task = {
    id_task: number;
    title: string;
    description?: string;
    subtasks: Subtask[];
    id_column:number;
    status: string;
    order?:number
};

export type TaskRegister = Omit<Task,"id_task">

export type Column = {
    id_column:number;
    name: string;
    color:string;
    tasks: Task[];
};

export type ColumnRegister = Omit<Column,'id_column'>

export type Board = {
    id_board:number;
    name: string;
    columns: Column[];
};

export type BoardRegister = Omit<Board,'id_board'>