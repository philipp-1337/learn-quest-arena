import { useState, useEffect } from "react";
import { X, User, Save, Loader2 } from "lucide-react";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { toast } from "sonner";
import { CustomToast } from "../misc/CustomToast";

interface AdminProfileModalProps {
  onClose: () => void;
  onAbbreviationUpdated?: () => void;
}

export default function AdminProfileModal({ onClose, onAbbreviationUpdated }: AdminProfileModalProps) {
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
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Admin-Profil</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Schließen"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center gap-2 text-gray-500 py-8">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Lade Profil...</span>
            </div>
          ) : (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  Diese Abkürzung wird bei allen Quizzen angezeigt, die du erstellt hast. 
                  Sie sollte kurz und eindeutig sein (z.B. Initialen).
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Angemeldet als
                  </label>
                  <input
                    type="text"
                    value={userEmail || ""}
                    disabled
                    className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deine Abkürzung
                  </label>
                  <input
                    type="text"
                    value={abbreviation}
                    onChange={(e) => setAbbreviation(e.target.value)}
                    placeholder="z.B. MK, TH, JD"
                    maxLength={10}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Max. 10 Zeichen
                  </p>
                </div>

                {originalAbbreviation && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800">
                      ✓ Deine aktuelle Abkürzung: <span className="font-semibold">{originalAbbreviation}</span>
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving || loading}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-semibold transition-colors ${
              hasChanges && !saving && !loading
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
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
      </div>
    </div>
  );
}
