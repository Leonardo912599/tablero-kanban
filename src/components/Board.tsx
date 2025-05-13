import { useState } from "react"
import { Plus } from "lucide-react";
import Modal from "./Modal";
import Task from "./Task";
import FormEditBoard from "./FormEditBoard";
import { useContext } from 'react'
import { useSelector } from 'react-redux'
import { BoardContext } from '../context/BoardContext'
import { AppDispatch, RootState } from '../store/store'
import { Eye } from "lucide-react";
import { ModeContext } from "../context/ModeContext";
import { DndContext, closestCenter } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { DragEndEvent } from '@dnd-kit/core';
import { useDispatch } from "react-redux";
import { changeOrderTask } from "../store/boardSlice";

const Board = () => {

  const dispatch = useDispatch<AppDispatch>()
  const context = useContext(BoardContext);
  const boards = useSelector((state: RootState) => state.boards.boards)
  const contextMode = useContext(ModeContext)

  if (!context) {
    throw new Error("Sidebar must be used within a BoardProvider");
  }

  if (!contextMode) {
    throw new Error("Sidebar must be used within a ModeProvider")
  }
  const { selectedBoardIndex, hiddenSidebar, sethiddenSidebar } = context;
  const { enabled } = contextMode

  if (selectedBoardIndex === null) {
    return <div>No board selected</div>;
  }
  const board = boards[selectedBoardIndex]

  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
  }

  const handleDragEnd = (event: DragEndEvent,index:number) => {
    const { active, over } = event

    if (!over || active.id === over.id) return;

    console.log('Arrastrado:', active.id);
    console.log('Soltado sobre:', over.id);

    const column = board.columns[index]

    if (!column) return;

    const oldIndex = column.tasks.findIndex((_,i) => i === active.id);
    const newIndex = column.tasks.findIndex((_,i) => i === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newArray = arrayMove(column.tasks, oldIndex, newIndex);
  
    dispatch(changeOrderTask({indexBoard:selectedBoardIndex,indexColumn:index,newTasks:newArray}))
  }

  return (
    <div className={`${enabled ? 'bg-[#1e1e2f]' : 'bg-[#F4F7FD]'}  w-full sm:${hiddenSidebar ? 'w-full' : 'w-full sm:w-[77%]'} relative h-full overflow-x-auto p-5`}>
      {
        board.columns.length > 0 ? (
          <div className="flex flex-row gap-6 h-full min-w-fit">
            {
              board.columns.map((b, indx) => (
                <div key={indx} className="flex-shrink-0 flex flex-col justify-start items-center h-full w-[250px] sm:w-72">
                  <div className="flex flex-row justify-center items-center gap-2 w-full">
                    <p style={{ backgroundColor: b.color }} className="w-4 h-4 rounded-full"></p>
                    <h1 className="text-md text-start font-semibold text-[#828FA3]">{b.name.toUpperCase()} ({b.tasks.length})</h1>
                  </div>
                  <DndContext
                    collisionDetection={closestCenter}
                    onDragEnd={(e) => handleDragEnd(e,indx)}
                  >
                    <SortableContext
                      items={b.tasks.map((_, i) => i)}
                      strategy={verticalListSortingStrategy}
                    >
                      {b.tasks.map((t, i) => (
                        <Task
                          key={i}
                          task={t}
                          indexColumn={indx}
                          indexTask={i}
                          board={board}
                          selectedBoardIndex={selectedBoardIndex}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                </div>
              ))
            }
            <div className={`${enabled ? 'bg-[#2b2c3b]' : 'bg-[#EEF1F8]'} flex-shrink-0 flex flex-col justify-center items-center cursor-pointer h-full rounded-lg w-[250px] sm:w-72 transition-transform hover:-translate-y-1 hover:shadow-md`}
              onClick={openModal}>
              <h1 className="text-2xl font-bold text-[#828FA3]">
                <Plus className="inline-block" strokeWidth={3} /> New Column
              </h1>
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center h-full">
            <h1 className="text-xl text-[#828FA3] font-semibold mb-3">This board is empty. Create a new column to get started.</h1>
            <button onClick={openModal} className="w-44 px-2 py-3 cursor-pointer font-semibold bg-[#635FC7] rounded-3xl text-white"><Plus className="inline-block" /> Add Column</button>
          </div>
        )
      }
      <div className={`${hiddenSidebar ? 'block' : 'hidden'} absolute cursor-pointer flex justify-center items-center top-105 left-0 bg-[#635FC7] rounded-r-full w-16 h-12`}
        onClick={() => sethiddenSidebar(false)}>
        <Eye className="text-white" size={24} />
      </div>
      <Modal isOpen={isModalOpen} handleClose={closeModal} title="Edit Board">
        <FormEditBoard
          board={board}
          selectedBoardIndex={selectedBoardIndex}
          closeModal={closeModal}
        />
      </Modal>
    </div>
  )
}

export default Board