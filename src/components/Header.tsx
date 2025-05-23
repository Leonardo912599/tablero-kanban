import { Plus, EllipsisVertical } from 'lucide-react';
import { useContext, useState, useRef } from 'react';
import { BoardContext } from '../context/BoardContext';
import { useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import Modal from './Modal';
import { useDispatch } from 'react-redux';
import FormAddNewTask from './FormAddNewTask';
import ModalComfirm from './ModalComfirm';
import FormEditBoard from './FormEditBoard';
import { Columns3 } from 'lucide-react';
import { ModeContext } from '../context/ModeContext';
import { ChevronDown, ChevronUp } from 'lucide-react';
import ModalSidebar from './ModalSidebar';
import { clearBoard, deleteBoard, resetBoardsThunk, selectMinBoardId } from '../store/boardSlice';
import { getColumnsByBoard } from '../store/columnSlice';
import { useClickOutside } from '../hooks/useClickOutside';

type ModalName = 'add-new-task' | 'edit-board' | 'sidebar-movil' | null;

type ModalNameConfirm = 'clear-board' | 'reset-boards' | 'delete-board' | null

const Header = () => {

  const dispatch = useDispatch<AppDispatch>();
  const context = useContext(BoardContext);
  const contextMode = useContext(ModeContext);
  if (!context) throw new Error("Sidebar must be used within a BoardProvider");
  if (!contextMode) throw new Error("Sidebar must be used within a ModeProvider");

  const { selectedBoardId, setSelectedBoardId, hiddenSidebar } = context;
  const { enabled } = contextMode;

  const boards = useSelector((state: RootState) => state.boards.boards);
  const [isModalOpen, setIsModalOpen] = useState<ModalNameConfirm>(null);
  const [activeModal, setActiveModal] = useState<ModalName>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const boardId = useSelector(selectMinBoardId)

  const board = boards.find(b => b.id_board === selectedBoardId);

  const menuRef = useRef<HTMLDivElement | null>(null);

  useClickOutside(menuRef, () => setIsMenuOpen(false), isMenuOpen);

  const openModalConfirm = (modalNameConfirm: Exclude<ModalNameConfirm, null>) =>
    setIsModalOpen(modalNameConfirm);
  const closeModalConfirm = () => setIsModalOpen(null);

  const openModal = (modalName: Exclude<ModalName, null>) =>
    setActiveModal(modalName);
  const closeModal = () => setActiveModal(null);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  return (
    <div className={`${enabled ? 'bg-[#2b2c3b]' : 'bg-white'} flex flex-row justify-center items-center w-full h-full`}>
      <div className={`${enabled ? 'border-r-gray-700 border-b-gray-700' : 'border-r-gray-300 border-b-gray-300'} ${hiddenSidebar ? 'border-b-1' : 'border-b-0'} hidden display sm:flex justify-center items-center gap-2 border-r-0 border-b-1 sm:border-r-1 sm:w-[23%] h-full`}>
        <Columns3 className='text-[#635FC7]' size={30} />
        <h3 className={`${enabled ? 'text-white' : 'text-black'} text-3xl hidden md:block font-bold`}>Kanban</h3>
      </div>
      <div className={`${enabled ? 'border-b-gray-700' : 'border-b-gray-300'} flex flex-row justify-between items-center border-b-1 w-full sm:w-[77%] px-3 h-full`}>
        <div className='flex flex-row justify-center items-center gap-2'>
          <Columns3 className='block sm:hidden text-[#635FC7] translate-y-[2px]' size={30} />
          <h4 className={`${enabled ? 'text-white' : 'text-black'} text-2xl font-bold leading-none`}>
            {board?.name || ''}
          </h4>
          {
            activeModal === 'sidebar-movil' ? (
              <ChevronUp size={15} strokeWidth={3} className="block sm:hidden mt-3 text-[#635FC7]"
                onClick={() => closeModal()} />
            ) : (
              <ChevronDown size={15} strokeWidth={3} className="block sm:hidden mt-3 text-[#635FC7]"
                onClick={() => openModal('sidebar-movil')} />
            )
          }
        </div>
        <div className='flex flex-row justify-center items-center gap-2'>
          <button className={`${board?.columns?.length == 0 ? 'cursor-not-allowed bg-[#A8A4FF]' : 'cursor-pointer bg-[#635FC7]'} py-3 px-4 rounded-2xl text-white`}
            onClick={() => {
              if (board!.columns.length > 0) openModal('add-new-task')
            }}>
            <Plus size={18} className='inline-block' /> <span className='hidden sm:inline-block '>Add New Task</span>
          </button>
          <div className="relative">
            <EllipsisVertical
              size={24}
              onClick={toggleMenu}
              className="text-[#828FA3] cursor-pointer"
            />

            {isMenuOpen && (
              <div ref={menuRef} className={`${enabled ? 'bg-[#2b2c3b]' : 'bg-white'} absolute right-0 top-17 rounded-md shadow-lg z-50 p-2 w-44`}>
                <p className="text-md text-[#828FA3] cursor-pointer px-2 py-2"
                  onClick={() => {
                    setIsMenuOpen(false)
                    openModal('edit-board')
                  }}>
                  Edit Board
                </p>
                <p className="text-[15px] text-[#828FA3] cursor-pointer px-2 py-2"
                  onClick={() => {
                    setIsMenuOpen(false)
                    openModalConfirm('clear-board')
                  }}>
                  Clear Board
                </p>
                <p className="text-[15px] text-red-500 cursor-pointer px-2 py-2"
                  onClick={() => {
                    setIsMenuOpen(false)
                    openModalConfirm('delete-board')
                  }}>
                  Delete Board
                </p>
                <p className="text-[15px] text-red-500 cursor-pointer px-2 py-2"
                  onClick={() => {
                    setIsMenuOpen(false)
                    openModalConfirm('reset-boards')
                  }}>
                  Reset Boards
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Modal isOpen={activeModal === 'add-new-task'} handleClose={closeModal} title="Add New Task">
        <FormAddNewTask
          closeModal={closeModal}
          board={board!}
        />
      </Modal>
      {activeModal === 'sidebar-movil' && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 p-3'
          onClick={closeModal}
        >
          <div className={`${enabled ? 'bg-[#2b2c3b]' : 'bg-white'} block sm:hidden relative rounded-xl shadow-lg w-full max-w-[270px] max-h-[80vh] overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
          >

            <ModalSidebar />
          </div>
        </div>
      )}
      <Modal isOpen={activeModal === 'edit-board'} handleClose={closeModal} title="Edit Board">
        <FormEditBoard
          selectedBoardId={selectedBoardId}
          closeModal={closeModal}
          board={board!}
        />
      </Modal>
      <ModalComfirm isOpen={isModalOpen === 'clear-board'} handleClose={closeModalConfirm} title="Clear this Board?">
        <p className='text-[#828FA3] text-[15px]'>Are you sure you want to clear the "rehry" board? This action will remove all columns and tasks and cannot be reversed.</p>
        <div className='flex flex-row justify-center items-center my-5 gap-2'>
          <button className='rounded-3xl w-1/2 font-semibold text-white bg-red-500 py-2 px-3 cursor-pointer'
            onClick={async () => {
              if (selectedBoardId) {
                const result = await dispatch(clearBoard(selectedBoardId))
                if (clearBoard.fulfilled.match(result)) {
                  dispatch(getColumnsByBoard(selectedBoardId))
                }
              }
              closeModalConfirm()
            }}>Clear</button>
          <button className={`${enabled ? 'bg-white' : 'bg-[#625FC721]'} font-semibold rounded-3xl w-1/2 text-[#635FC7] bg-[#625FC721] py-2 px-3 cursor-pointer`}
            onClick={closeModalConfirm}>Cancel</button>
        </div>
      </ModalComfirm>
      <ModalComfirm isOpen={isModalOpen === 'delete-board'} handleClose={closeModalConfirm} title="Delete this Board?">
        <p className='text-[#828FA3] text-[15px]'>Are you sure you want to delete the "rehry" board? This action will remove all columns and tasks and cannot be reversed</p>
        <div className='flex flex-row justify-center items-center my-5 gap-2'>
          <button className='rounded-3xl w-1/2 font-semibold text-white bg-red-500 py-2 px-3 cursor-pointer'
            onClick={() => {
              if (selectedBoardId) dispatch(deleteBoard(selectedBoardId))
              if (boardId) setSelectedBoardId(boardId)
              closeModalConfirm()
            }}>Delete</button>
          <button className={`${enabled ? 'bg-white' : 'bg-[#625FC721]'} font-semibold rounded-3xl w-1/2 text-[#635FC7] bg-[#625FC721] py-2 px-3 cursor-pointer`}
            onClick={closeModalConfirm}>Cancel</button>
        </div>
      </ModalComfirm>
      <ModalComfirm isOpen={isModalOpen === 'reset-boards'} handleClose={closeModalConfirm} title="Reset all Boards?">
        <p className='text-[#828FA3] text-[15px]'>Are you sure you want to reset all boards? This action will remove all boards, columns, tasks etc which where created by you.
          This action can't be reversed!</p>
        <div className='flex flex-row justify-center items-center my-5 gap-2'>
          <button className='rounded-3xl w-1/2 font-semibold text-white bg-red-500 py-2 px-3 cursor-pointer'
            onClick={async () => {
              const result = await dispatch(resetBoardsThunk())
              if (resetBoardsThunk.fulfilled.match(result)) {
                if (selectedBoardId) await dispatch(getColumnsByBoard(selectedBoardId))
              }
              if (boardId) setSelectedBoardId(boardId)
              closeModalConfirm()
            }}>Reset</button>
          <button className={`${enabled ? 'bg-white' : 'bg-[#625FC721]'} font-semibold rounded-3xl w-1/2 text-[#635FC7] bg-[#625FC721] py-2 px-3 cursor-pointer`}
            onClick={closeModalConfirm}>Cancel</button>
        </div>
      </ModalComfirm>
    </div>
  )
}

export default Header