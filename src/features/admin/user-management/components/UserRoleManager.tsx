import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { toast } from "sonner";
import { CustomToast } from "../../../misc/CustomToast";
import { Shield, Loader2, Pencil, Check, X } from "lucide-react";

interface AuthorUser {
  id: string;
  role: string;
  authorAbbreviation?: string;
  displayName?: string;
  name?: string;
  email?: string;
}

const ROLE_OPTIONS = [
  { value: "admin", label: "Administration", color: "red" },
  { value: "teacher", label: "Lehrer:in", color: "blue" },
  { value: "supporter", label: "Unterstützer:in", color: "green" },
];

export const UserRoleManager: React.FC = () => {
  const [users, setUsers] = useState<AuthorUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [editingNameUserId, setEditingNameUserId] = useState<string | null>(
    null,
  );
  const [nameInput, setNameInput] = useState<string>("");

  // Name ändern
  const handleNameEdit = (userId: string, currentName: string) => {
    setEditingNameUserId(userId);
    setNameInput(currentName || "");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameInput(e.target.value);
  };

  const handleNameSave = async (userId: string) => {
    setUpdatingUserId(userId);
    try {
      const db = getFirestore();
      await updateDoc(doc(db, "author", userId), { name: nameInput });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, name: nameInput } : u)),
      );
      toast.custom(() => (
        <CustomToast message="Name erfolgreich geändert" type="success" />
      ));
      setEditingNameUserId(null);
    } catch (err) {
      toast.custom(() => (
        <CustomToast message="Fehler beim Ändern des Namens" type="error" />
      ));
    } finally {
      setUpdatingUserId(null);
    }
  };

  useEffect(() => {
    // Firebase Auth: Hole aktuellen User und dessen Rolle
    const fetchCurrentUserRole = async () => {
      setAuthLoading(true);
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          setCurrentUserRole(null);
          setCurrentUserId(null);
          setAuthLoading(false);
          return;
        }
        setCurrentUserId(user.uid);
        const db = getFirestore();
        const authorRef = doc(db, "author", user.uid);
        const { getDoc } = await import("firebase/firestore");
        const authorSnap = await getDoc(authorRef);
        if (authorSnap.exists()) {
          setCurrentUserRole(authorSnap.data().role || null);
        } else {
          setCurrentUserRole(null);
        }
      } catch (err) {
        setCurrentUserRole(null);
        setCurrentUserId(null);
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
        const userList: AuthorUser[] = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            role: doc.data().role || "",
            authorAbbreviation: doc.data().authorAbbreviation,
            displayName: doc.data().displayName,
            name: doc.data().name,
            email: doc.data().email,
          }))
          .sort((a, b) => {
            // Sortiere nach authorAbbreviation oder displayName
            const nameA = a.authorAbbreviation || a.displayName || a.name || "";
            const nameB = b.authorAbbreviation || b.displayName || b.name || "";
            return nameA.localeCompare(nameB);
          });
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
    setUpdatingUserId(userId);
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
    } finally {
      setUpdatingUserId(null);
    }
  };

  const getRoleColor = (role: string) => {
    const roleOption = ROLE_OPTIONS.find((opt) => opt.value === role);
    return roleOption?.color || "gray";
  };

  const getRoleBadgeClasses = (role: string) => {
    const color = getRoleColor(role);
    const colorMap = {
      red: "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300",
      blue: "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300",
      green:
        "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300",
      gray: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300",
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.gray;
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Lade Berechtigungen...
          </p>
        </div>
      </div>
    );
  }

  if (currentUserRole !== "admin") {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Users count */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {users.length} {users.length === 1 ? "Nutzer" : "Nutzer"}
      </div>

      {/* User List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Lade Nutzer...
          </p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400 text-center">{error}</p>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">
            Keine Nutzer gefunden
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user) => {
            const isCurrentUser = user.id === currentUserId;
            const isUpdating = updatingUserId === user.id;
            const isEditingName = editingNameUserId === user.id;

            return (
              <div
                key={user.id}
                className={`relative bg-white dark:bg-gray-800 border rounded-lg p-3 sm:p-4 transition-all ${
                  isCurrentUser
                    ? "border-indigo-300 dark:border-indigo-700 ring-2 ring-indigo-100 dark:ring-indigo-900/40"
                    : "border-gray-300 dark:border-gray-600 hover:shadow-md"
                }`}
              >
                {/* Loading Overlay */}
                {isUpdating && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 rounded-lg backdrop-blur-sm z-10">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-indigo-600 dark:text-indigo-400" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        Speichert...
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  {/* User Info */}
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1 space-y-2">
                        {/* Name anzeigen oder bearbeiten */}
                        {isEditingName ? (
                          <div className="flex flex-col gap-2">
                            <input
                              type="text"
                              value={nameInput}
                              onChange={handleNameChange}
                              className="w-full px-3 py-2.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              disabled={isUpdating}
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <button
                                className="flex-1 px-4 py-2.5 rounded bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => handleNameSave(user.id)}
                                disabled={isUpdating || nameInput.trim() === ""}
                                title="Speichern"
                              >
                                <Check className="w-5 h-5" />
                              </button>
                              <button
                                className="flex-1 px-4 py-2.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => setEditingNameUserId(null)}
                                disabled={isUpdating}
                                title="Abbrechen"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white truncate flex-1">
                                {user.displayName || user.name || "Unbekannt"}
                              </h3>
                              <button
                                className="p-2.5 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition flex items-center justify-center shrink-0"
                                onClick={() =>
                                  handleNameEdit(user.id, user.name || "")
                                }
                                disabled={isUpdating}
                                title="Name bearbeiten"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {user.authorAbbreviation && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 shrink-0">
                                  {user.authorAbbreviation}
                                </span>
                              )}
                              {user.email && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 shrink-0 whitespace-nowrap">
                                  {user.email}
                                </span>
                              )}
                              {isCurrentUser && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 shrink-0">
                                  Du
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Role Selection */}
                  <div className="flex items-center gap-3 sm:shrink-0">
                    {/* Current Role Badge (Desktop only) */}
                    <span
                      className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeClasses(user.role)}`}
                    >
                      {ROLE_OPTIONS.find((opt) => opt.value === user.role)
                        ?.label || user.role}
                    </span>

                    {/* Role Selector */}
                    <div className="relative w-full sm:w-auto">
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(user.id, e.target.value)
                        }
                        disabled={isCurrentUser || isUpdating}
                        className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                          isCurrentUser
                            ? "border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed"
                            : "border-gray-300 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-700"
                        }`}
                        title={
                          isCurrentUser
                            ? "Du kannst deine eigene Rolle nicht ändern"
                            : "Rolle ändern"
                        }
                      >
                        {ROLE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Self-edit warning */}
                {isCurrentUser && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Du kannst deine eigene Rolle nicht ändern
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
