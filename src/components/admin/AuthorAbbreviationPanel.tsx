import { useState, useEffect } from "react";
import { User, Save, Loader2 } from "lucide-react";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { toast } from "sonner";
import { CustomToast } from "../misc/CustomToast";

export default function AuthorAbbreviationPanel() {
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

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mt-6">
        <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Lade Autoren-Info...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mt-6">
      <div className="flex items-center gap-3 mb-4">
        <User className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Autoren-Abkürzung</h3>
      </div>

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
            placeholder="z.B. MK, TH, JD"
            maxLength={10}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Max. 10 Zeichen
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-colors ${
            hasChanges && !saving
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
              Abkürzung speichern
            </>
          )}
        </button>

        {originalAbbreviation && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <p className="text-sm text-green-800 dark:text-green-300">
              ✓ Deine aktuelle Abkürzung: <span className="font-semibold">{originalAbbreviation}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
