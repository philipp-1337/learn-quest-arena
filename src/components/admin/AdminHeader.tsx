import { BowArrow, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AdminHeaderProps {
  onLogout: () => void;
}

export default function AdminHeader({ onLogout }: AdminHeaderProps) {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex flex-row gap-2 items-end">
          {/* Quiz Button */}
          <button
            onClick={() => {
              navigate("/"); // Navigate to home
            }}
            className="relative group p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Zum Quiz"
            title="Zum Quiz"
          >
            <BowArrow className="w-6 h-6" />
            {/* Tooltip */}
            <span className="absolute -bottom-8 right-1/2 translate-x-1/2 scale-0 group-hover:scale-100 transition-transform bg-gray-800 text-white text-xs rounded px-2 py-1 pointer-events-none z-10 whitespace-nowrap shadow-lg">
              Zum Quiz
            </span>
          </button>
          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="relative group p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title="Abmelden"
            aria-label="Abmelden"
          >
            <LogOut className="w-6 h-6" />
            {/* Tooltip */}
            <span className="absolute -bottom-8 right-1/2 translate-x-1/2 scale-0 group-hover:scale-100 transition-transform bg-gray-800 text-white text-xs rounded px-2 py-1 pointer-events-none z-10 whitespace-nowrap shadow-lg">
              Abmelden
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
