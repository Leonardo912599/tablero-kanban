import { useState } from 'react';
import { Board, Subtask } from '../interfaces/Board';
import { useDispatch } from 'react-redux';
import { addNewTask } from '../store/boardSlice';
import { Plus, X } from 'lucide-react';
import { useContext } from 'react';
import { ModeContext } from '../context/ModeContext';
import WarningModal from './WarningModal';

type Props = {
    selectedBoardIndex: number | null
    closeModal: () => void
    board: Board
}

const FormAddNewTask = ({ selectedBoardIndex, closeModal, board }: Props) => {

    const contextMode = useContext(ModeContext)
    if (!contextMode) {
        throw new Error("Sidebar must be used within a ModeProvider")
    }
    const { enabled } = contextMode

    const [isModalWarningOpen, setIsModalWarningOpen] = useState(false);
    const openModalWarning = () => setIsModalWarningOpen(true);
    const closeModalWarning = () => setIsModalWarningOpen(false);

    const dispatch = useDispatch()
    const list_subtasks: Subtask[] = [
        {
            title: 'Make coffee',
            isCompleted: false
        }
    ]

    const [formValues, setFormValues] = useState({
        title: '',
        description: '',
        status: '',
        subtasks: list_subtasks || []
    });

    const [formErrors, setFormErrors] = useState<{
        title?: string;
        status?: string;
        subtask?: string[]
    }>({});

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({ ...prev, [name]: value }));
        setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    const handleSubtaskChange = (index: number, value: string) => {
        const updatedStaks = [...formValues.subtasks];
        updatedStaks[index].title = value;

        setFormValues((prev) => ({ ...prev, subtasks: updatedStaks }));

        const updatedErrors = formErrors.subtask ? [...formErrors.subtask] : [];
        updatedErrors[index] = '';
        setFormErrors((prev) => ({ ...prev, subtask: updatedErrors }));
    };

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

    const eliminarSubtask = (index: number) => {
        const newSubtasks = formValues.subtasks.filter((_, i) => i !== index)
        setFormValues(prev => ({ ...prev, subtasks: newSubtasks }))
    }

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

        dispatch(addNewTask({ index: selectedBoardIndex!, task: formValues }))
        closeModal()
    }

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
                    <label htmlFor="board-columns" className={`${enabled ? 'text-white' : 'text-[#828FA3]'} block mb-2 text-sm font-bold`}>Subtasks</label>
                    {
                        formValues.subtasks.map((s, i) => (
                            <div key={i}>
                                <div className='flex flex-row justify-center items-center mb-2'>
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
                    <label htmlFor="title" className={`${enabled ? 'text-white' : 'text-[#828FA3]'} block mb-2 text-sm font-bold`}>Status</label>
                    <select
                        name='status'
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
                    className='w-full py-2 px-3 mt-3 mb-4 text-[#635FC7] font-bold hover:bg-white cursor-pointer bg-purple-100 rounded-xl'
                    onClick={agregarSubtask}
                >
                    <Plus size={16} className='inline-block' />
                    Add New Subtask
                </button>
                <button
                    type="submit"
                    className='w-full py-2 px-3 mt-2 mb-4 text-white font-bold cursor-pointer bg-[#635FC7] rounded-xl'
                >
                    Create Task
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

export default FormAddNewTask