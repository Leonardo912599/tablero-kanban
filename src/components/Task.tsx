import { useState } from 'react';
import { Board, Task as Tarea } from '../interfaces/Board'
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';
import { changeStatusSubtask, changeStatusTask, deleteTask } from '../store/boardSlice';
import { EllipsisVertical } from 'lucide-react';
import Modal from './Modal';
import FormEditTask from './FormEditTask';
import { useContext } from 'react';
import { ModeContext } from '../context/ModeContext';
import { useRef } from "react";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type Props = {
    task: Tarea
    board: Board
    selectedBoardIndex: number,
    indexTask: number,
    indexColumn: number
}

const Task = ({ task, board, selectedBoardIndex, indexTask, indexColumn }: Props) => {

    const contextMode = useContext(ModeContext)
    const menuRef = useRef<HTMLDivElement | null>(null);
    const isDragged = useRef(false);
    if (!contextMode) {
        throw new Error("Sidebar must be used within a ModeProvider")
    }

    const { enabled } = contextMode

    const dispatch = useDispatch<AppDispatch>()
    const [isOpen, setIsOpen] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        closeModalWithMenu()
    }

    const openModalWithMenu = () => setIsOpen(true);
    const closeModalWithMenu = () => {
        setIsOpen(false);
        closeModal();
    }

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen((prev) => !prev);

    const toggleSubtask = (index: number) => {
        dispatch(changeStatusSubtask({ indexBoard: selectedBoardIndex, indexColumn, indexTask, indexSubtask: index }))
    }

    const handleTaskChangeOfcolumn = (name: string) => {
        dispatch(changeStatusTask({ indexBoard: selectedBoardIndex, indexColumn, indexTask, newNameColumn: name }))
    }
    const handleDelete = () => {
        dispatch(deleteTask({ indexBoard: selectedBoardIndex, task }))
    }

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        
    } = useSortable({ id: indexTask });


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
                    {task.subtasks.filter(s => s.isCompleted).length} of {task.subtasks.length} Subtasks
                </p>
            </div>
            <>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 p-3"
                        onClick={closeModalWithMenu}
                    >
                        <div
                            className={`${enabled ? 'bg-[#2b2c3b]' : 'bg-white'} relative rounded-lg shadow-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto`}
                            onClick={(e) => {
                                if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                                    setIsMenuOpen(false);
                                }
                                e.stopPropagation();
                            }}
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
                                                onClick={handleDelete}
                                                className="text-sm text-red-500 hover:bg-red-100 cursor-pointer px-2 py-1"
                                            >
                                                Delete Task
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <p className='text-[#828FA3] text-sm'>
                                Subtasks ({task.subtasks.filter(s => s.isCompleted).length} of {task.subtasks.length})
                            </p>
                            {
                                task.subtasks.map((s, i) => (
                                    <div className='flex flex-row bg-[#625FC74B] rounded-lg my-3 px-3 py-2 gap-3'>
                                        <input
                                            type="checkbox"
                                            checked={s.isCompleted}
                                            onChange={() => toggleSubtask(i)}
                                        />
                                        <label className={`${enabled ? 'text-white' : 'text-black'}`}>{s.title}</label>
                                    </div>
                                ))
                            }
                            <div className='mb-5'>
                                <label htmlFor="title" className='block mb-2 text-sm font-bold text-[#828FA3]'>Current Status</label>
                                <select
                                    name='status'
                                    value={task.status}
                                    className={`${enabled ? 'bg-[#2b2c3b] border-gray-600 text-white' : 'bg-gray-50 text-black border-gray-300'} border rounded-lg outline-none text-sm p-2 w-full`}
                                    onChange={(e) => handleTaskChangeOfcolumn(e.target.value)}
                                >
                                    {board.columns.map((b, i) => (
                                        <option key={i} className='text-[#828FA3] text-md' value={b.name}>
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
                <FormEditTask task={task} closeModal={closeModal} indexTask={indexTask} />
            </Modal>
        </>
    )
}

export default Task