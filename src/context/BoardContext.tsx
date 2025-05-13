import { useState, createContext, ReactNode } from "react";

interface BoardContextType {
  selectedBoardIndex: number | null;
  hiddenSidebar:boolean;
  setSelectedBoardIndex: (index: number) => void;
  sethiddenSidebar:(value:boolean) => void;
}

export const BoardContext = createContext<BoardContextType | undefined>(undefined);

interface BoardProviderProps {
  children: ReactNode;
}

export const BoardProvider = ({ children }: BoardProviderProps) => {

  const boardIndexStorage = localStorage.getItem('boardIndex')
  const boardIndexParse = boardIndexStorage !== null ? JSON.parse(boardIndexStorage) : 0

  const [selectedBoardIndex, setSelectedBoardIndex] = useState<number>(boardIndexParse);
  const [hiddenSidebar, sethiddenSidebar] = useState<boolean>(false)

  return (
    <BoardContext.Provider value={{ selectedBoardIndex, setSelectedBoardIndex,hiddenSidebar,sethiddenSidebar }}>
      {children}
    </BoardContext.Provider>
  );
};
