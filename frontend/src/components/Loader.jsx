import { FaSpinner } from 'react-icons/fa';

export default function Loader({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[20vh]">
      <FaSpinner className="animate-spin text-2xl text-blue-400 mb-2" />
      <div className="text-gray-500">{message}</div>
    </div>
  );
}
