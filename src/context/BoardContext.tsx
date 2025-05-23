import { useState, useEffect, createContext, ReactNode } from "react";
import { useSelector } from 'react-redux';
import { selectMinBoardId } from "../store/boardSlice";

interface BoardContextType {
  selectedBoardId: number | null;
  hiddenSidebar: boolean;
  setSelectedBoardId: (index: number) => void;
  sethiddenSidebar: (value: boolean) => void;
}

export const BoardContext = createContext<BoardContextType | undefined>(undefined);

interface BoardProviderProps {
  children: ReactNode;
}

export const BoardProvider = ({ children }: BoardProviderProps) => {
  const minBoardId = useSelector(selectMinBoardId);

  const storedId = localStorage.getItem('boardId');
  const parsedId = storedId !== null ? Number(JSON.parse(storedId)) : null;

  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(parsedId);
  const [hiddenSidebar, sethiddenSidebar] = useState<boolean>(false);

  useEffect(() => {
    if (selectedBoardId === null && minBoardId !== null) {
      setSelectedBoardId(minBoardId);
    }
  }, [minBoardId, selectedBoardId]);

  useEffect(() => {
    if (selectedBoardId !== null) {
      localStorage.setItem('boardId', JSON.stringify(selectedBoardId));
    }
  }, [selectedBoardId]);

  return (
    <BoardContext.Provider value={{ selectedBoardId, setSelectedBoardId, hiddenSidebar, sethiddenSidebar }}>
      {children}
    </BoardContext.Provider>
  );
};
