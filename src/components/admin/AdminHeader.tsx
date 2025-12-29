import { Sword, UserCog } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppHeader, { type MenuItem } from "../shared/AppHeader";

interface AdminHeaderProps {
  onProfileClick: () => void;
}

export default function AdminHeader({ onProfileClick }: AdminHeaderProps) {
  const navigate = useNavigate();

  const menuItems: MenuItem[] = [
    {
      icon: UserCog,
      label: "Profil",
      onClick: onProfileClick,
    },
    {
      icon: Sword,
      label: "Zum Quiz",
      onClick: () => navigate("/"),
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
