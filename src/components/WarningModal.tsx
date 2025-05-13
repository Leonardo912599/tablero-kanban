import { AlertTriangle } from 'lucide-react';
import { useContext } from 'react';
import { ModeContext } from '../context/ModeContext';

type WarningModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

const WarningModal = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}: WarningModalProps) => {
  if (!isOpen) return null;

  const contextMode = useContext(ModeContext)

  if (!contextMode) {
    throw new Error("Sidebar must be used within a ModeProvider")
  }
  
  const { enabled } = contextMode

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-40 p-4"
      onClick={onCancel}
    >
      <div
        className={`${enabled ? 'bg-[#2b2c3b]' : 'bg-white'} relative rounded-lg shadow-lg p-6 w-full max-w-sm`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center mb-4 text-yellow-600">
          <AlertTriangle className="w-6 h-6 mr-2" />
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        <p className="text-sm text-[#828FA3] mb-6">{message}</p>
        <div className="flex justify-center">   
          <button
            onClick={onConfirm}
            className="px-4 py-2 font-semibold rounded-lg bg-yellow-500 text-white hover:bg-yellow-600"
          >
            Ok
          </button>
        </div>
      </div>
    </div>
  );
};

export default WarningModal;
