import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

export function useUserRole() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) {
          setUserRole(null);
          setLoading(false);
          return;
        }

        const db = getFirestore();
        const authorDoc = await getDoc(doc(db, "author", currentUser.uid));
        
        if (authorDoc.exists()) {
          const data = authorDoc.data();
          setUserRole(data.role || null);
        } else {
          setUserRole(null);
        }
      } catch (err) {
        console.error("Error fetching user role:", err);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  return { userRole, loading };
}
