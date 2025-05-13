import { useState } from "react";
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { BoardContext } from "../context/BoardContext";
import { useContext } from "react";
import { Task, Subtask } from "../interfaces/Board";
import { X } from "lucide-react";
import { useDispatch } from "react-redux";
import { editTask } from "../store/boardSlice";
import { ModeContext } from "../context/ModeContext";
import { Plus } from "lucide-react";
import WarningModal from "./WarningModal";

type Props = {
    task: Task
    indexTask: number
    closeModal: () => void
}

const FormEditTask = ({ task, indexTask, closeModal }: Props) => {

    const dispatch = useDispatch<AppDispatch>()
    const boards = useSelector((state: RootState) => state.boards.boards)
    const context = useContext(BoardContext);
    const contextMode = useContext(ModeContext)

    if (!contextMode) {
        throw new Error("Sidebar must be used within a ModeProvider")
    }

    if (!context) {
        throw new Error("Sidebar must be used within a BoardProvider");
    }
    const { selectedBoardIndex } = context;
    const { enabled } = contextMode

    const board = boards[selectedBoardIndex!]

    const [isModalWarningOpen, setIsModalWarningOpen] = useState(false);
    const openModalWarning = () => setIsModalWarningOpen(true);
    const closeModalWarning = () => setIsModalWarningOpen(false);


    const [formValues, setFormValues] = useState(() => ({
        title: task.title,
        description: task.description || '',
        status: task.status,
        subtasks: task.subtasks || []
    }));


    const [formErrors, setFormErrors] = useState<{
        title?: string;
        status?: string;
        subtask?: string[]
    }>({});

    const agregarSubtask = () => {
        const nuevaSubtask: Subtask = {
            title: '',
            isCompleted: false
        };
        setFormValues(prev => ({
            ...prev,
            subtasks: [...prev.subtasks, nuevaSubtask]
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const errors: typeof formErrors = {};
        let hasError = false;

        if (formValues.title.trim() === '') {
            errors.title = 'Please enter a name'
            hasError = true
        }
        if (formValues.status.trim() === '') {
            errors.status = 'Please enter a status'
            hasError = true
        }

        errors.subtask = formValues.subtasks.map((s) =>
            s.title.trim() === '' ? 'Subtask cannot be empty' : ''
        );
        if (errors.subtask.some(err => err !== '')) {
            hasError = true;
        }

        setFormErrors(errors);

        if (hasError) return;

        const nombres = formValues.subtasks.map((col) => col.title.trim().toLowerCase());
        const nombresUnicos = new Set(nombres);

        if (nombres.length !== nombresUnicos.size) {
            openModalWarning()
            return
        }

        dispatch(editTask({ indexBoard: selectedBoardIndex!, indexTask, prevStatus: task.status, task: formValues }))

        closeModal()
    }

    const handleSubtaskChange = (index: number, value: string) => {
        const updatedStaks = formValues.subtasks.map((subtask, i) =>
            i === index ? { ...subtask, title: value } : subtask
        );

        setFormValues((prev) => ({ ...prev, subtasks: updatedStaks }));

        const updatedErrors = formErrors.subtask ? [...formErrors.subtask] : [];
        updatedErrors[index] = '';
        setFormErrors((prev) => ({ ...prev, subtask: updatedErrors }));
    };

    const eliminarSubtask = (index: number) => {
        const newSubtasks = formValues.subtasks.filter((_, i) => i !== index)
        setFormValues(prev => ({ ...prev, subtasks: newSubtasks }))
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({ ...prev, [name]: value }));
        setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <div className='mb-5'>
                    <label htmlFor="title" className={`${enabled ? 'text-white' : 'text-[#828FA3]'} block mb-2 text-sm font-bold`}>Title</label>
                    <input type="text" id='title' name='title'
                        className={`${enabled ? 'bg-[#2b2c3b] text-white border-gray-600' : 'bg-gray-50 text-black border-gray-300'} ${formErrors.title ? 'border border-red-300' : ''} border rounded-lg outline-none text-sm p-2 w-full`}
                        placeholder='e.g Start learning Things '
                        value={formValues.title}
                        onChange={handleInputChange}
                    />
                    {formErrors.title && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>
                    )}
                </div>
                <div className='mb-5'>
                    <label htmlFor="title" className={`${enabled ? 'text-white' : 'text-[#828FA3]'} block mb-2 text-sm font-bold`}>Description(optional)</label>
                    <textarea id="description" name="description"
                        className={`${enabled ? 'bg-[#2b2c3b] text-white border-gray-600' : 'bg-gray-50 text-black border-gray-300'} border rounded-lg outline-none text-sm p-2 w-full`}
                        placeholder='e.g Start learning Things '
                        value={formValues.description}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label htmlFor="board-columns" className='block mb-2 text-sm font-bold text-[#828FA3]'>Subtasks</label>
                    {
                        formValues.subtasks.map((s, i) => (
                            <div>
                                <div key={i} className='flex flex-row justify-center items-center mb-2'>
                                    <input
                                        onChange={(e) => handleSubtaskChange(i, e.target.value)}
                                        type="text"
                                        placeholder="e.g. Make coffee"
                                        className={`${enabled ? 'bg-[#2b2c3b] text-white border-gray-600' : 'bg-gray-50 text-black border-gray-300'} border rounded-lg text-sm outline-none p-2 w-9/10 ${formErrors.subtask?.[i] ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        value={s.title}
                                    />
                                    <X
                                        onClick={() => eliminarSubtask(i)}
                                        className='text-[#828FA3] w-1/10 cursor-pointer' />
                                </div>
                                {formErrors.subtask?.[i] && (
                                    <p className="text-red-500 text-xs my-1">{formErrors.subtask[i]}</p>
                                )}
                            </div>
                        ))
                    }
                </div>
                <div className='mb-5'>
                    <label htmlFor="title" className='block mb-2 text-sm font-bold text-[#828FA3]'>Status</label>
                    <select
                        name='status'
                        value={formValues.status}
                        className={`${enabled ? 'bg-[#2b2c3b] text-white border-gray-600' : 'bg-gray-50 text-black border-gray-300'} ${formErrors.status ? 'border border-red-500' : ''} border rounded-lg outline-none text-sm p-2 w-full`}
                        onChange={handleInputChange}
                    >
                        <option value="">Select column</option>
                        {board.columns.map((b, i) => (
                            <option key={i} className='text-[#828FA3] text-md' value={b.name}>
                                {b.name}
                            </option>
                        ))}
                    </select>

                </div>
                <button
                    type="button"
                    className='w-full font-bold text-[#635FC7] py-2 px-3 mt-3 mb-4 hover:bg-white cursor-pointer bg-purple-100 rounded-xl'
                    onClick={agregarSubtask}
                >
                    <Plus size={16} className='inline-block' />
                    Add New Subtask
                </button>
                <button
                    type="submit"
                    className='w-full py-2 px-3 mt-2 mb-4 text-white font-bold cursor-pointer bg-[#635FC7] rounded-xl'
                >
                    Save Changes
                </button>
            </form>
            <WarningModal
                isOpen={isModalWarningOpen}
                title="Repeated Elements"
                message="The column names are duplicated."
                onConfirm={closeModalWarning}
                onCancel={closeModalWarning}
            />
        </>
    )
}

export default FormEditTask