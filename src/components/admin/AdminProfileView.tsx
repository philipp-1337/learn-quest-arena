import { useState, useEffect } from "react";
import { ArrowLeft, Save, Loader2, LogOut } from "lucide-react";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { toast } from "sonner";
import { CustomToast } from "../misc/CustomToast";

interface AdminProfileViewProps {
  onClose: () => void;
  onAbbreviationUpdated?: () => void;
  onLogout: () => void;
}

export default function AdminProfileView({ onClose, onAbbreviationUpdated, onLogout }: AdminProfileViewProps) {
  const [abbreviation, setAbbreviation] = useState("");
  const [originalAbbreviation, setOriginalAbbreviation] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  const userEmail = auth.currentUser?.email;

  // Load current abbreviation
  useEffect(() => {
    const loadAbbreviation = async () => {
      if (!userId) return;
      
      setLoading(true);
      try {
        const db = getFirestore();
        const authorDoc = await getDoc(doc(db, 'author', userId));
        
        if (authorDoc.exists()) {
          const abbrev = authorDoc.data().authorAbbreviation || "";
          setAbbreviation(abbrev);
          setOriginalAbbreviation(abbrev);
        }
      } catch (error) {
        console.error("Error loading abbreviation:", error);
        toast.custom(() => (
          <CustomToast message="Fehler beim Laden der Abkürzung" type="error" />
        ));
      } finally {
        setLoading(false);
      }
    };

    loadAbbreviation();
  }, [userId]);

  const handleSave = async () => {
    if (!userId) return;
    
    // Validate abbreviation
    const trimmed = abbreviation.trim();
    if (!trimmed) {
      toast.custom(() => (
        <CustomToast message="Bitte gib eine Abkürzung ein" type="error" />
      ));
      return;
    }

    if (trimmed.length > 10) {
      toast.custom(() => (
        <CustomToast message="Abkürzung darf max. 10 Zeichen lang sein" type="error" />
      ));
      return;
    }

    // Check if abbreviation is already taken (only if changed)
    if (trimmed !== originalAbbreviation) {
      setSaving(true);
      try {
        const db = getFirestore();
        const authorsRef = collection(db, 'author');
        const q = query(authorsRef, where('authorAbbreviation', '==', trimmed));
        const querySnapshot = await getDocs(q);
        
        // Check if any other user has this abbreviation
        const existingUser = querySnapshot.docs.find(doc => doc.id !== userId);
        if (existingUser) {
          toast.custom(() => (
            <CustomToast 
              message={`Die Abkürzung "${trimmed}" wird bereits verwendet`} 
              type="error" 
            />
          ));
          setSaving(false);
          return;
        }
      } catch (error) {
        console.error("Error checking abbreviation:", error);
        toast.custom(() => (
          <CustomToast message="Fehler beim Prüfen der Abkürzung" type="error" />
        ));
        setSaving(false);
        return;
      }
    }

    setSaving(true);
    try {
      const db = getFirestore();
      await setDoc(doc(db, 'author', userId), {
        authorAbbreviation: trimmed,
        updatedAt: Date.now(),
      }, { merge: true });

      setOriginalAbbreviation(trimmed);
      toast.custom(() => (
        <CustomToast message="Abkürzung gespeichert" type="success" />
      ));
      
      // Trigger refresh callback
      if (onAbbreviationUpdated) {
        onAbbreviationUpdated();
      }
    } catch (error) {
      console.error("Error saving abbreviation:", error);
      toast.custom(() => (
        <CustomToast message="Fehler beim Speichern" type="error" />
      ));
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = abbreviation.trim() !== originalAbbreviation;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 backdrop-blur-sm z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-2xl border border-gray-100 dark:border-gray-700 relative">
        {/* Back Button */}
        <button
          type="button"
          onClick={onClose}
          className="mb-6 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2 group"
          aria-label="Zurück"
          title="Zurück"
        >
          <ArrowLeft className="group-hover:-translate-x-1 transition-transform w-4 h-4" />
          Zurück
        </button>

        {/* Header */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2" lang="de">Admin-Profil</h1>
          <p className="text-gray-600 dark:text-gray-400" lang="de">Verwalte deine Profil-Einstellungen</p>
        </div>

        {/* Content */}
        <div className="mb-8">
          {loading ? (
            <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 py-8">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Lade Profil...</span>
            </div>
          ) : (
            <>
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  Diese Abkürzung wird bei allen Quizzen angezeigt, die du erstellt hast. 
                  Sie sollte kurz und eindeutig sein (z.B. Initialen).
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Angemeldet als
                  </label>
                  <input
                    type="text"
                    value={userEmail || ""}
                    disabled
                    className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Deine Abkürzung
                  </label>
                  <input
                    type="text"
                    value={abbreviation}
                    onChange={(e) => setAbbreviation(e.target.value)}
                    placeholder="z.B. mk, th, jd"
                    maxLength={10}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Max. 10 Zeichen
                  </p>
                </div>

                {originalAbbreviation && (
                  <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-3">
                    <p className="text-sm text-green-800 dark:text-green-300">
                      ✓ Deine aktuelle Abkürzung: <span className="font-semibold">{originalAbbreviation}</span>
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Action Button */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving || loading}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-colors ${
              hasChanges && !saving && !loading
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            }`}
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Speichere...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Speichern
              </>
            )}
          </button>
        </div>

        {/* Logout Section */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Abmelden
          </button>
        </div>
      </div>
    </div>
  );
}
