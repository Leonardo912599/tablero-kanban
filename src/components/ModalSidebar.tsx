import { useState } from 'react';
import { Plus, PanelsTopLeft, X, Sun, Moon } from 'lucide-react';
import Modal from './Modal';
import { Column } from '../interfaces/Board';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { addBoard } from '../store/boardSlice';
import { useContext } from 'react';
import { BoardContext } from '../context/BoardContext';
import { seleccionarColorAleatorio } from '../utils/colores';
import WarningModal from './WarningModal';
import { ModeContext } from '../context/ModeContext';

const ModalSidebar = () => {

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

    const { enabled, setEnabled } = contextMode
    const { selectedBoardIndex, setSelectedBoardIndex } = context;

    const list_columns: Column[] = [
        {
            name: "todo",
            color: seleccionarColorAleatorio(),
            tasks: []
        },
        {
            name: 'doing',
            color: seleccionarColorAleatorio(),
            tasks: []
        }
    ]

    const [formValues, setFormValues] = useState({
        name: '',
        columns: list_columns || []
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

    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const [isModalWarningOpen, setIsModalWarningOpen] = useState(false);
    const openModalWarning = () => setIsModalWarningOpen(true);
    const closeModalWarning = () => setIsModalWarningOpen(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const errors: typeof formErrors = {};

        let hasError = false;

        if (formValues.name?.trim() === '') {
            errors.name = 'Please enter a name'
            hasError = true
        }

        errors.columns = formValues.columns.map((c) =>
            c.name.trim() === '' ? 'Column cannot be empty' : ''
        );
        if (errors.columns.some(err => err !== '')) {
            hasError = true;
        }

        setFormErrors(errors)

        if (hasError) return

        const nombres = formValues.columns.map((col) => col.name.trim().toLowerCase());
        const nombresUnicos = new Set(nombres);

        if (nombres.length !== nombresUnicos.size) {
            openModalWarning();
            return;
        }

        dispatch(addBoard(formValues))
        closeModal();
        setFormValues(({ name: '', columns: list_columns }))
    };

    const agregarColumna = () => {
        const column = {
            name: '',
            color: seleccionarColorAleatorio(),
            tasks: []
        }
        setFormValues(prev => (
            {
                ...prev,
                columns: [...prev.columns, column]
            }
        ))
    }

    const eliminarColumna = (index: number) => {
        setFormValues(prev => {
            const newColumns = prev.columns.filter((_, i) => i !== index)
            return ({ ...prev, columns: newColumns })
        })
    }
    return (
        <>
            <div className={`${enabled ? 'bg-[#2b2c3b]' : 'bg-white'} flex flex-col justify-between items-start w-full h-full`}>
                <div className='flex flex-col justify-start items-center h-full overflow-hidden w-full gap-3'>
                    <p className='text-start text-[17px] w-9/10 px-7 text-[#828FA3] font-semibold py-4'>All Boards ({boards.length})</p>
                    <div className='flex flex-col overflow-y-auto w-full'>
                        {
                            boards.map((b, i) => (
                                <div key={i} className={`${i === selectedBoardIndex ? 'bg-[#635FC7] text-white' : enabled ? 'bg-[#2b2c3b] text-[#828FA3]' : 'bg-white text-[#828FA3]'} flex flex-row justify-start items-center cursor-pointer rounded-r-2xl 
                   w-9/10 px-7 gap-2 py-4`}
                                    onClick={() => {
                                        setSelectedBoardIndex(i)
                                        localStorage.setItem("boardIndex", JSON.stringify(i))
                                    }}>
                                    <PanelsTopLeft />
                                    <p className='font-semibold'>{b.name}</p>
                                </div>
                            )
                            )
                        }
                    </div>
                    <div className='flex flex-col items-start justify-center w-full'>
                        <div className='flex flex-row justify-start items-center  w-9/10  px-7 gap-2 py-2'>
                            <PanelsTopLeft className='text-[#828FA3]' />
                            <p className='text-[#635FC7] font-bold cursor-pointer' onClick={() => {
                                openModal()
                            }}><Plus size={15} className='inline-block' /> Create New Board</p>
                        </div>
                    </div>
                </div>
                <div className='flex flex-col items-center justify-center w-full my-4'>
                    <label className={`${enabled ? 'bg-[#1e1e2f]' : 'bg-white'} flex flex-row w-8/10 rounded-lg mb-2 items-center justify-center cursor-pointer py-4.5 px-2 gap-2`}>
                        <Sun className="w-5 h-5 text-[#828FA3]" />

                        <input
                            type="checkbox"
                            checked={enabled}
                            onChange={() => {
                                setEnabled(!enabled)
                                localStorage.setItem("enabled", JSON.stringify(!enabled))
                            }}
                            className="sr-only peer"
                        />

                        <div className="relative w-11 h-6 bg-[#635FC7] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] 
            after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#635FC7]"></div>

                        <Moon className="w-5 h-5 text-[#828FA3]" />
                    </label>
                </div>
            </div>
            <Modal isOpen={isModalOpen} handleClose={closeModal} title="Add New Board">
                <form onSubmit={handleSubmit}>
                    <div className='mb-5'>
                        <label htmlFor="board-name" className={`${enabled ? 'text-white' : 'text-[#828FA3]'} block mb-2 text-sm font-bold`} >Board Name</label>
                        <input type="text" id="board-name" name='name'
                            className={`${enabled ? 'bg-[#2b2c3b] text-white border-gray-600' : 'text-black border-gray-300 bg-gray-50'} ${formErrors.name ? 'border border-red-300' : ''} border rounded-lg outline-none text-sm p-2 w-full`}
                            placeholder='e.g Web Development'
                            value={formValues.name}
                            onChange={handleInputChange}
                        />
                        {formErrors.name && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="board-columns" className={`${enabled ? 'text-white' : 'text-[#828FA3]'} block mb-2 text-sm font-bold text-[#828FA3]`} >Board Columns</label>
                        {
                            formValues.columns.map((c, i) => (
                                <div key={i}>
                                    <div className='flex flex-row justify-center items-center mb-2'>
                                        <input
                                            onChange={(e) => handleColumnChange(i, e.target.value)}
                                            type="text"
                                            className={`${enabled ? 'bg-[#2b2c3b] text-white border-gray-600' : 'text-black border-gray-300 bg-gray-50'} border rounded-lg text-sm outline-none p-2 w-9/10`}
                                            value={c.name}
                                        />
                                        <X onClick={() => eliminarColumna(i)} className='text-[#828FA3] w-1/10 cursor-pointer' />
                                    </div>
                                    {
                                        formErrors.columns?.[i] && (
                                            <p className="text-red-500 text-xs my-1">{formErrors.columns[i]}</p>
                                        )
                                    }
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
                        Create New Board
                    </button>
                </form>
            </Modal>
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

export default ModalSidebar