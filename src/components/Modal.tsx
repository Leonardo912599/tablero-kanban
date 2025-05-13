import React from 'react';
import { ModeContext } from '../context/ModeContext';
import { useContext } from 'react';

type Props = {
  isOpen: boolean;
  title?: string;
  children: React.ReactNode;
  handleClose: () => void;
};

const Modal = ({ isOpen, title, children, handleClose }: Props) => {

  const contextMode = useContext(ModeContext)

  if (!contextMode) {
    throw new Error("Sidebar must be used within a ModeProvider")
  }

  const { enabled } = contextMode

  return (
    <>
      {isOpen && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 p-3'
          onClick={handleClose}
        >
          <div
            className={`${enabled ? 'bg-[#2b2c3b]' : 'bg-white'} relative rounded-lg shadow-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            {
              title && (
                <h2 className={`${enabled ? 'text-white' : 'text-black'} text-xl font-bold mb-4`}>{title}</h2>
              )
            }
            {children}
          </div>
        </div>
      )}
    </>
  );
};

export default Modal;
