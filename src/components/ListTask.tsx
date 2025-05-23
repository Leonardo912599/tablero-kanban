import { useEffect } from 'react'
import { Board } from '../interfaces/Board'
import Task from './Task'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../store/store'
import { getAllTaskByBoard } from '../store/taskSlice'
import { SortableContext } from '@dnd-kit/sortable'
import { verticalListSortingStrategy } from '@dnd-kit/sortable'
type Props = {
    id_column: number
    selectedBoardId: number
    board: Board
}

const ListTask = ({ id_column, selectedBoardId, board }: Props) => {

    const disptach = useDispatch<AppDispatch>()
    const tasks = useSelector((state: RootState) => state.tasks.tasks)

    useEffect(() => {

        disptach(getAllTaskByBoard(selectedBoardId))

    }, [disptach, selectedBoardId])

    const filterTask = tasks.filter(t => t.id_column === id_column)

    return (
        <>
            <SortableContext
                items={filterTask.map((task) => task.id_task)}
                strategy={verticalListSortingStrategy}
            >
                {
                    filterTask.map((task) => (
                        <Task
                            key={task.id_task}
                            task={task}
                            board={board}
                            selectedBoardId={selectedBoardId}
                        />
                    ))
                }
            </SortableContext>
        </>
    )
}

export default ListTask