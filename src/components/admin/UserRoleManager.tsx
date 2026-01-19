import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { toast } from "sonner";
import { CustomToast } from "../misc/CustomToast";

const ROLE_OPTIONS = [
  { value: "admin", label: "Administration" },
  { value: "teacher", label: "Lehrer:in" },
  { value: "supporter", label: "Unterstützer:in" },
];

export const UserRoleManager: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // Firebase Auth: Hole aktuellen User und dessen Rolle
    const fetchCurrentUserRole = async () => {
      setAuthLoading(true);
      try {
        const auth = await import("firebase/auth");
        const db = getFirestore();
        const firebaseAuth = auth.getAuth();
        const user = firebaseAuth.currentUser;
        if (!user) {
          setCurrentUserRole(null);
          setAuthLoading(false);
          return;
        }
        const authorRef = doc(db, "author", user.uid);
        const authorSnap = await (
          await import("firebase/firestore")
        ).getDoc(authorRef);
        if (authorSnap.exists()) {
          setCurrentUserRole(authorSnap.data().role || null);
        } else {
          setCurrentUserRole(null);
        }
      } catch (err) {
        setCurrentUserRole(null);
      } finally {
        setAuthLoading(false);
      }
    };
    fetchCurrentUserRole();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const db = getFirestore();
        const querySnapshot = await getDocs(collection(db, "author"));
        const userList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(userList);
      } catch (err) {
        setError("Fehler beim Laden der Nutzer");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const db = getFirestore();
      await updateDoc(doc(db, "author", userId), { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      );
      toast.custom(() => (
        <CustomToast message="Rolle erfolgreich geändert" type="success" />
      ));
    } catch (err) {
      toast.custom(() => (
        <CustomToast message="Fehler beim Ändern der Rolle" type="error" />
      ));
    }
  };

  if (authLoading) {
    return <div>Lade Berechtigungen...</div>;
  }
  if (currentUserRole !== "admin") {
    return null;
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">User & Rollen verwalten</h2>
      {loading ? (
        <div>Lade Nutzer...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="border px-2 py-1">Name</th>
              <th className="border px-2 py-1">E-Mail</th>
              <th className="border px-2 py-1">Rolle</th>
              <th className="border px-2 py-1">Aktion</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="border px-2 py-1">
                  {u.displayName || u.name || "-"}
                </td>
                <td className="border px-2 py-1">{u.email || "-"}</td>
                <td className="border px-2 py-1">{u.role}</td>
                <td className="border px-2 py-1">
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    {ROLE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
