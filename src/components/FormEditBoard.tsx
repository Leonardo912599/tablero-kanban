import { useState } from 'react'
import { Board, Column } from '../interfaces/Board'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../store/store'
import { X } from 'lucide-react'
import { useContext } from 'react';
import { ModeContext } from '../context/ModeContext';
import { seleccionarColorAleatorio } from '../utils/colores'
import { editBoard } from '../store/boardSlice'
import { Plus } from 'lucide-react'
import WarningModal from './WarningModal'
import { getColumnsByBoard } from '../store/columnSlice'

type Props = {
    board: Board
    selectedBoardId: number | null
    closeModal: () => void
}

const FormEditBoard = ({ board, selectedBoardId, closeModal }: Props) => {

    const contextMode = useContext(ModeContext)
    if (!contextMode) {
        throw new Error("Sidebar must be used within a ModeProvider")
    }
    const { enabled } = contextMode

    const dispatch = useDispatch<AppDispatch>()

    const [isModalWarningOpen, setIsModalWarningOpen] = useState(false);
    const openModalWarning = () => setIsModalWarningOpen(true);
    const closeModalWarning = () => setIsModalWarningOpen(false);

    const [formValues, setFormValues] = useState({
        name: board.name,
        columns: board.columns || []
    });

    const [formErrors, setFormErrors] = useState<{
        name?: string;
        columns?: string[]
    }>({});

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({ ...prev, [name]: value }));
        setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    const handleColumnChange = (index: number, value: string) => {
        const updatedStaks = [...formValues.columns];
        updatedStaks[index].name = value;

        setFormValues((prev) => ({ ...prev, columns: updatedStaks }));

        const updatedErrors = formErrors.columns ? [...formErrors.columns] : [];
        updatedErrors[index] = '';
        setFormErrors((prev) => ({ ...prev, columns: updatedErrors }));
    };

    const agregarColumna = () => {
        const column: Column = {
            id_column: 0,
            name: '',
            color: seleccionarColorAleatorio(),
            tasks: []
        }
        setFormValues(prev => (
            { ...prev, columns: [...prev.columns, column] }
        ))
    }
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const errors: typeof formErrors = {};
        let hasError = false;
        if (formValues.name.trim() === '') {
            errors.name = 'Please enter a name'
            hasError = true
        }
        errors.columns = formValues.columns.map((c) =>
            c.name.trim() === '' ? 'Column cannot be empty' : ''
        );
        if (errors.columns.some(err => err !== '')) {
            hasError = true;
        }

        setFormErrors(errors);

        if (hasError) return

        const nombres = formValues.columns.map((col) => col.name.trim().toLowerCase());
        const nombresUnicos = new Set(nombres);

        if (nombres.length !== nombresUnicos.size) {
            openModalWarning()
            return
        }
        const cleanColumns = formValues.columns.map(col => ({
            ...col,
            tasks: [],
        }));

        if (selectedBoardId) {
            const result = await dispatch(editBoard({
                id_board: selectedBoardId,
                name: formValues.name,
                columns: cleanColumns,
            }));
            console.log(result)
            if (editBoard.fulfilled.match(result)) {
                dispatch(getColumnsByBoard(selectedBoardId));
            }
        }
        closeModal()
    }

    const eliminarColumna = (index: number) => {
        setFormValues(prev => {
            const newColumns = prev.columns.filter((_, i) => i !== index)
            return ({ ...prev, columns: [...newColumns] })
        })
    }

    return (
        <>
            <form onSubmit={handleSubmit}>
                <div className='mb-5'>
                    <label htmlFor="board-name" className={`${enabled ? 'text-white' : 'text-[#828FA3]'} block mb-2 text-sm font-bold`}>Board Name</label>
                    <input type="text" id="board-name" name='name'
                        className={`${enabled ? 'bg-[#2b2c3b] text-white border-gray-600' : 'bg-gray-50 text-black border-gray-300'} ${formErrors.name ? 'border border-red-300' : ''} border rounded-lg outline-none text-sm p-2 w-full`}
                        placeholder='e.g Web Development'
                        value={formValues.name}
                        onChange={handleInputChange}
                    />
                    {formErrors.name && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                    )}
                </div>
                <div>
                    <label htmlFor="board-columns" className={`${enabled ? 'text-white' : 'text-[#828FA3]'} block mb-2 text-sm font-bold`}>Board Columns</label>
                    {
                        formValues.columns.map((c, i) => (
                            <div key={i}>
                                <div className='flex flex-row justify-center items-center mb-2'>
                                    <input
                                        onChange={(e) => handleColumnChange(i, e.target.value)}
                                        type="text"
                                        className={`${enabled ? 'bg-[#2b2c3b] text-white border-gray-600' : 'bg-gray-50 text-black border-gray-300'} border rounded-lg text-sm outline-none p-2 w-9/10`}
                                        value={c.name}
                                    />
                                    <X onClick={() => eliminarColumna(i)}
                                        className='text-[#828FA3] w-1/10 cursor-pointer' />

                                </div>
                                {formErrors.columns?.[i] && (
                                    <p className="text-red-500 text-xs my-1">{formErrors.columns[i]}</p>
                                )}
                            </div>
                        ))
                    }
                </div>

                <button
                    type="button"
                    className='w-full py-2 px-3 mt-3 mb-4 font-bold text-[#635FC7] hover:bg-white cursor-pointer bg-purple-100 rounded-xl'
                    onClick={agregarColumna}
                >
                    <Plus size={16} className='inline-block' />
                    Add New Column
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

export default FormEditBoard