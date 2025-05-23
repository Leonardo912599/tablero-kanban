import { useState, useEffect } from "react"
import { Plus } from "lucide-react";
import Modal from "./Modal";
import FormEditBoard from "./FormEditBoard";
import { useContext } from 'react'
import { useSelector } from 'react-redux'
import { BoardContext } from '../context/BoardContext'
import { Eye } from "lucide-react";
import { ModeContext } from "../context/ModeContext";
import { DndContext, closestCenter } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core';
import { AppDispatch, RootState } from "../store/store";
import { useDispatch } from "react-redux";
import { getColumnsByBoard } from "../store/columnSlice";
import ListTask from "./ListTask";
import { changeOrderTasks, getAllTaskByBoard } from "../store/taskSlice";
import Droppable from "./Droppable";

const Board = () => {

  const disptach = useDispatch<AppDispatch>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const context = useContext(BoardContext);
  const contextMode = useContext(ModeContext);
  const boards = useSelector((state: RootState) => state.boards.boards);
  const columns = useSelector((state: RootState) => state.columns.columns);
  const tasks = useSelector((state: RootState) => state.tasks.tasks)


  if (!context) {
    throw new Error("Sidebar must be used within a BoardProvider");
  }

  if (!contextMode) {
    throw new Error("Sidebar must be used within a ModeProvider");
  }

  const { selectedBoardId, hiddenSidebar, sethiddenSidebar } = context;
  const { enabled } = contextMode;

  useEffect(() => {

    if (selectedBoardId) {
      disptach(getColumnsByBoard(selectedBoardId));
      disptach(getAllTaskByBoard(selectedBoardId));
    }

  }, [disptach, selectedBoardId]);


  const board = boards.find(b => b.id_board === selectedBoardId);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const activeTaskId = Number(active.id);
    const activeTask = tasks.find((t) => t.id_task === activeTaskId);

    if (!activeTask) return;

    let toColumnId: number;
    let overTaskId: number | null = null;

    if (String(over.id).startsWith("column-")) {
      toColumnId = Number(String(over.id).replace("column-", ""));
    } else {
      overTaskId = Number(over.id);
      const overTask = tasks.find((t) => t.id_task === overTaskId);
      if (!overTask) return;
      toColumnId = overTask.id_column;
    }

    const fromColumnId = activeTask.id_column;

    let toTasks = tasks.filter(
      (t) => t.id_column === toColumnId && t.id_task !== activeTaskId
    );

    const overIndex = overTaskId
      ? toTasks.findIndex((t) => t.id_task === overTaskId)
      : toTasks.length;

    toTasks.splice(overIndex, 0, { ...activeTask, id_column: toColumnId });

    const updatedToTasks = toTasks.map((t, index) => ({
      ...t,
      order: index,
      id_column: toColumnId,
    }));

    let updatedTasks: typeof tasks = [];

    if (fromColumnId === toColumnId) {
      updatedTasks = updatedToTasks;
    } else {
      const fromTasks = tasks
        .filter((t) => t.id_column === fromColumnId && t.id_task !== activeTaskId)
        .map((t, index) => ({
          ...t,
          order: index,
          id_column: fromColumnId,
        }));

      updatedTasks = [...fromTasks, ...updatedToTasks];
    }

    try {
      await disptach(changeOrderTasks(updatedTasks)).unwrap();
      await disptach(getAllTaskByBoard(selectedBoardId!)).unwrap();
      await disptach(getColumnsByBoard(selectedBoardId!)).unwrap();
    } catch (error) {
      console.error("Error actualizando orden:", error);
    }
  };


  return (
    <div className={`${enabled ? 'bg-[#1e1e2f]' : 'bg-[#F4F7FD]'}  w-full sm:${hiddenSidebar ? 'w-full' : 'w-full sm:w-[77%]'} relative h-full overflow-x-auto p-5`}>
      {
        columns.length > 0 ? (
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={(e) => handleDragEnd(e)}
          >
            <div className="flex flex-row gap-6 h-full min-w-fit">
              {
                columns.map((c, indx) => (
                  <Droppable key={c.id_column} id={`column-${c.id_column}`} className="flex-shrink-0 flex flex-col justify-start items-center h-full w-[250px] sm:w-72">
                    <div className="flex flex-row justify-center items-center gap-2 w-full">
                      <p style={{ backgroundColor: c.color }} className="w-4 h-4 rounded-full"></p>
                      <h1 className="text-md text-start font-semibold text-[#828FA3]">{c.name.toUpperCase()} ({c.tasks.length})</h1>
                    </div>
                    <ListTask key={indx} id_column={c.id_column} board={board!} selectedBoardId={selectedBoardId!} />
                  </Droppable>
                ))
              }
              <div className={`${enabled ? 'bg-[#2b2c3b]' : 'bg-[#EEF1F8]'} flex-shrink-0 flex flex-col justify-center items-center cursor-pointer h-full rounded-lg w-[250px] sm:w-72 transition-transform hover:-translate-y-1 hover:shadow-md`}
                onClick={openModal}>
                <h1 className="text-2xl font-bold text-[#828FA3]">
                  <Plus className="inline-block" strokeWidth={3} /> New Column
                </h1>
              </div>
            </div>
          </DndContext>
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
          board={board!}
          selectedBoardId={selectedBoardId}
          closeModal={closeModal}
        />
      </Modal>
    </div>
  )
}

export default Board