import { Sword, UserCog } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import AppHeader, { type MenuItem } from "../shared/AppHeader";

interface AdminHeaderProps {
  onProfileClick: () => void;
}

export default function AdminHeader({ onProfileClick }: AdminHeaderProps) {
  const navigate = useNavigate();
  const [hasAbbreviation, setHasAbbreviation] = useState(true);
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  // Check if user has an author abbreviation
  useEffect(() => {
    const checkAbbreviation = async () => {
      if (!userId) return;
      
      try {
        const db = getFirestore();
        const authorDoc = await getDoc(doc(db, 'author', userId));
        
        if (authorDoc.exists() && authorDoc.data().authorAbbreviation?.trim()) {
          setHasAbbreviation(true);
        } else {
          setHasAbbreviation(false);
        }
      } catch (error) {
        console.error("Error checking abbreviation:", error);
        // Assume abbreviation exists to avoid false notifications
        setHasAbbreviation(true);
      }
    };

    checkAbbreviation();
  }, [userId]);

  const menuItems: MenuItem[] = [
    {
      icon: UserCog,
      label: "Profil",
      onClick: onProfileClick,
      hasNotification: !hasAbbreviation,
    },
    {
      icon: Sword,
      label: "Zum Quiz",
      onClick: () => navigate("/"),
      variant: "primary",
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
