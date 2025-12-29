import { Sword, LogOut, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppHeader, { type MenuItem } from "../shared/AppHeader";

interface AdminHeaderProps {
  onLogout: () => void;
  onProfileClick: () => void;
}

export default function AdminHeader({ onLogout, onProfileClick }: AdminHeaderProps) {
  const navigate = useNavigate();

  const menuItems: MenuItem[] = [
    {
      icon: Sword,
      label: "Zum Quiz",
      onClick: () => navigate("/"),
    },
    {
      icon: UserCircle,
      label: "Profil",
      onClick: onProfileClick,
      variant: 'primary',
    },
    {
      icon: LogOut,
      label: "Abmelden",
      onClick: onLogout,
      variant: 'danger',
    },
  ];

  return (
    <AppHeader
      title="Administration"
      subtitle="Für Lehrerkräfte von morgen."
      menuItems={menuItems}
    />
  );
}
