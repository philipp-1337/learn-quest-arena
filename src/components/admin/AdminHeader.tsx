import { BookOpen, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AdminHeaderProps {
  onLogout: () => void;
}

export default function AdminHeader({ onLogout }: AdminHeaderProps) {
  const navigate = useNavigate();
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex gap-4">
            <button
              onClick={() => {
                navigate("/"); // Navigate to home
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-200"
            >
              <BookOpen className="w-4 h-4" />
              <span className="max-[640px]:hidden">Zum Quiz</span>
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="max-[640px]:hidden">Abmelden</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
