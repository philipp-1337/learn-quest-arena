import { Sword, UserRoundCheck, UserRoundX, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import AppHeader from '@shared/AppHeader';

interface AdminHeaderProps {
  onProfileClick: () => void;
}

export default function AdminHeader({ onProfileClick }: AdminHeaderProps) {
  const navigate = useNavigate();
  const [hasAbbreviation, setHasAbbreviation] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  // Check if user has an author abbreviation & role
  useEffect(() => {
    const checkAbbreviationAndRole = async () => {
      if (!userId) return;
      try {
        const db = getFirestore();
        const authorDoc = await getDoc(doc(db, 'author', userId));
        if (authorDoc.exists()) {
          setHasAbbreviation(!!authorDoc.data().authorAbbreviation?.trim());
          setIsAdmin(authorDoc.data().role === "admin");
        } else {
          setHasAbbreviation(false);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error checking abbreviation/role:", error);
        setHasAbbreviation(true);
        setIsAdmin(false);
      }
    };
    checkAbbreviationAndRole();
  }, [userId]);

  const menuItems = [
    {
      icon: hasAbbreviation ? UserRoundCheck : UserRoundX,
      label: "Profil",
      onClick: onProfileClick,
      hasNotification: !hasAbbreviation,
      variant: undefined,
      className: "cursor-pointer",
    },
    ...(isAdmin
      ? [
          {
            icon: Users,
            label: "Rollen verwalten",
            onClick: () => navigate("/admin/roles"),
            variant: 'default' as const,
            className: "cursor-pointer",
          },
        ]
      : []),
    {
      icon: Sword,
      label: "Zum Quiz",
      onClick: () => navigate("/"),
      variant: 'primary' as const,
      className: "cursor-pointer",
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
