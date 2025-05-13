export type Subtask = {
    title: string;
    isCompleted: boolean;
};

export type Task = {
    title: string;
    description?: string;
    subtasks: Subtask[];
    status: string;
};

export type Column = {
    name: string;
    color:string;
    tasks: Task[];
};

export type Board = {
    name: string;
    columns: Column[];
};
