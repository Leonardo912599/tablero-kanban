import { useState } from 'react';
import { Board, Task as Tarea } from '../interfaces/Board'
import { EllipsisVertical } from 'lucide-react';
import Modal from './Modal';
import { useContext } from 'react';
import { ModeContext } from '../context/ModeContext';
import { useRef } from "react";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';
import { changeCurrentStatus, changeStatusSubtask, deleteTask } from '../store/taskSlice';
import FormEditTask from './FormEditTask';
import { getAllTaskByBoard } from '../store/taskSlice';
import ModalComfirm from './ModalComfirm';
import { getColumnsByBoard } from '../store/columnSlice';
import { useClickOutside } from '../hooks/useClickOutside';

type Props = {
    task: Tarea
    board: Board
    selectedBoardId: number
}

const Task = ({ task, board, selectedBoardId }: Props) => {

    const dispatch = useDispatch<AppDispatch>()
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeModal, setActiveModal] = useState<boolean>(false);
    const contextMode = useContext(ModeContext)
    const isDragged = useRef(false);

    if (!contextMode) {
        throw new Error("Sidebar must be used within a ModeProvider")
    }

    const { enabled } = contextMode

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
    }
    const openActiveModal = () => setActiveModal(true)
    const closeActiveModal = () => setActiveModal(false)

    const openModalWithMenu = () => setIsOpen(true);
    const closeModalWithMenu = () => {
        setIsOpen(false);
    }
    const modalRef = useRef<HTMLDivElement | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);

    useClickOutside(modalRef, () => {
        setIsOpen(false)
        setIsMenuOpen(false)
    }, isOpen);
    useClickOutside(menuRef, () => setIsMenuOpen(false), isMenuOpen);

    const toggleMenu = () => setIsMenuOpen((prev) => !prev);


    const toggleSubtask = (id: number, isCompleted: boolean) => {

        dispatch(changeStatusSubtask({ id, isCompleted: !isCompleted }))
    }

    const handleTaskChangeOfcolumn = async (id_column: string) => {
        await dispatch(changeCurrentStatus({ id: task.id_task, id_column: Number(id_column) })).unwrap()

        await dispatch(getAllTaskByBoard(selectedBoardId)).unwrap()

        await dispatch(getColumnsByBoard(selectedBoardId)).unwrap()


    }
    const handleDelete = () => {
        dispatch(deleteTask(task.id_task))
        closeModal()
    }

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,

    } = useSortable({ id: task.id_task });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    }

    return (
        <>
            <div
                ref={setNodeRef}
                {...attributes}
                {...listeners}
                style={style}
                className={`${enabled ? 'bg-[#2b2c3b]' : 'bg-white'} cursor-pointer rounded-lg p-5 w-full my-3`}
                onMouseDown={() => {
                    isDragged.current = false;
                }}
                onMouseMove={() => {
                    isDragged.current = true;
                }}
                onMouseUp={(e) => {
                    if (!isDragged.current) {
                        openModalWithMenu();
                    }
                    e.stopPropagation();
                }}
            >
                <h4 className={`${enabled ? 'text-white' : 'text-black'} font-semibold text-md`}>{task.title}</h4>
                <p className='text-[#828FA3] text-sm'>
                    {task.subtasks?.filter(s => s.isCompleted).length} of {task.subtasks?.length} Subtasks
                </p>
            </div>
            <>
                {isOpen && (

                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 p-3"
                    >
                        <div ref={modalRef}
                            className={`${enabled ? 'bg-[#2b2c3b]' : 'bg-white'} relative rounded-lg shadow-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto`}

                        >
                            <div className='flex flex-row justify-between items-center w-full mb-4'>
                                <h2 className={`${enabled ? 'text-white' : 'text-black'} text-xl font-bold`}>{task.title}</h2>
                                <div className="relative">
                                    <EllipsisVertical
                                        size={24}
                                        onClick={toggleMenu}
                                        className="text-[#828FA3] cursor-pointer"
                                    />

                                    {isMenuOpen && (
                                        <div ref={menuRef} className={`${enabled ? 'bg-[#2b2c3b]' : 'bg-white'} absolute right-0 top-10 rounded-md shadow-lg z-50 p-2 w-44`}>
                                            <p
                                                onClick={openModal}
                                                className="text-sm text-[#828FA3]  hover:bg-gray-100 cursor-pointer px-2 py-1"
                                            >
                                                Edit Task
                                            </p>
                                            <p
                                                onClick={openActiveModal}
                                                className="text-sm text-red-500 hover:bg-red-100 cursor-pointer px-2 py-1"
                                            >
                                                Delete Task
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <p className='text-[#828FA3] text-sm'>
                                Subtasks ({task.subtasks?.filter(s => s.isCompleted).length} of {task.subtasks?.length})
                            </p>
                            {
                                task.subtasks?.map((s, i) => (
                                    <div key={i} className='flex flex-row bg-[#625FC74B] rounded-lg my-3 px-3 py-2 gap-3'>
                                        <input
                                            type="checkbox"
                                            checked={s.isCompleted}
                                            onChange={() => toggleSubtask(s.id_subtask, s.isCompleted)}
                                        />
                                        <label className={`${s.isCompleted ? 'line-through text-gray-800' : ''} ${enabled ? 'text-white' : 'text-black'}`}>{s.title}</label>
                                    </div>
                                ))
                            }
                            <div className='mb-5'>
                                <label htmlFor="title" className='block mb-2 text-sm font-bold text-[#828FA3]'>Current Status</label>
                                <select
                                    name='status'
                                    value={task.id_column}
                                    className={`${enabled ? 'bg-[#2b2c3b] border-gray-600 text-white' : 'bg-gray-50 text-black border-gray-300'} border rounded-lg outline-none text-sm p-2 w-full`}
                                    onChange={(e) => {
                                        handleTaskChangeOfcolumn(e.target.value);
                                    }}
                                >
                                    {board.columns.map((b, i) => (
                                        <option key={i} className='text-[#828FA3] text-md' value={b.id_column}>
                                            {b.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </>
            <Modal isOpen={isModalOpen} handleClose={closeModal} title="Edit Task">
                <FormEditTask task={task} closeModal={closeModal} closeModalWithMenu={closeModalWithMenu} />
            </Modal>
            <ModalComfirm isOpen={activeModal} handleClose={closeActiveModal} title="Clear this Task?">
                <p className='text-[#828FA3] text-[15px]'>Are you sure you want to clear this task? This action will remove the task and subtasks.</p>
                <div className='flex flex-row justify-center items-center my-5 gap-2'>
                    <button className='rounded-3xl w-1/2 font-semibold text-white bg-red-500 py-2 px-3 cursor-pointer'
                        onClick={() => {
                            closeActiveModal()
                            handleDelete()
                        }}>Clear</button>
                    <button className={`${enabled ? 'bg-white' : 'bg-[#625FC721]'} font-semibold rounded-3xl w-1/2 text-[#635FC7] bg-[#625FC721] py-2 px-3 cursor-pointer`}
                        onClick={() => {
                            closeActiveModal()
                            closeModalWithMenu()
                        }}>Cancel</button>
                </div>
            </ModalComfirm>
        </>
    )
}

export default Task