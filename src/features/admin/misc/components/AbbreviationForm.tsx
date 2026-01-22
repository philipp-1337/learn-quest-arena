import { useState, useEffect } from 'react';
import { Loader2, Save, AlertTriangle, Check, Tag } from 'lucide-react';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { toast } from 'sonner';
import { CustomToast } from '@shared/CustomToast';

interface AbbreviationFormProps {
  onAbbreviationUpdated?: () => void;
}

export default function AbbreviationForm({
  onAbbreviationUpdated,
}: AbbreviationFormProps) {
  const [abbreviation, setAbbreviation] = useState("");
  const [originalAbbreviation, setOriginalAbbreviation] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  // Load current abbreviation
  useEffect(() => {
    const loadAbbreviation = async () => {
      if (!userId) return;

      setLoading(true);
      try {
        const db = getFirestore();
        const authorDoc = await getDoc(doc(db, "author", userId));

        if (authorDoc.exists()) {
          const abbrev = authorDoc.data().authorAbbreviation || "";
          setAbbreviation(abbrev);
          setOriginalAbbreviation(abbrev);
        }
      } catch (error) {
        console.error("Error loading abbreviation:", error);
        toast.custom((t) => (
          <CustomToast message="Fehler beim Laden der Abkürzung" type="error" toastId={t} />
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
      toast.custom((t) => (
        <CustomToast message="Bitte gib eine Abkürzung ein" type="error" toastId={t} />
      ));
      return;
    }

    if (trimmed.length > 10) {
      toast.custom((t) => (
        <CustomToast
          message="Abkürzung darf max. 10 Zeichen lang sein"
          type="error"
          toastId={t}
        />
      ));
      return;
    }

    // Check if abbreviation is already taken (only if changed)
    if (trimmed !== originalAbbreviation) {
      setSaving(true);
      try {
        const db = getFirestore();
        const authorsRef = collection(db, "author");
        const q = query(authorsRef, where("authorAbbreviation", "==", trimmed));
        const querySnapshot = await getDocs(q);

        // Check if any other user has this abbreviation
        const existingUser = querySnapshot.docs.find(
          (doc) => doc.id !== userId
        );
        if (existingUser) {
          toast.custom((t) => (
            <CustomToast
              message={`Die Abkürzung "${trimmed}" wird bereits verwendet`}
              type="error"
              toastId={t}
            />
          ));
          setSaving(false);
          return;
        }
      } catch (error) {
        console.error("Error checking abbreviation:", error);
        toast.custom((t) => (
          <CustomToast
            message="Fehler beim Prüfen der Abkürzung"
            type="error"
            toastId={t}
          />
        ));
        setSaving(false);
        return;
      }
    }

    setSaving(true);
    try {
      const db = getFirestore();
      await setDoc(
        doc(db, "author", userId),
        {
          authorAbbreviation: trimmed,
          updatedAt: Date.now(),
        },
        { merge: true }
      );

      setOriginalAbbreviation(trimmed);
      toast.custom((t) => (
        <CustomToast message="Abkürzung gespeichert" type="success" toastId={t} dismissible={true}/>
      ));

      // Trigger refresh callback
      if (onAbbreviationUpdated) {
        onAbbreviationUpdated();
      }
    } catch (error) {
      console.error("Error saving abbreviation:", error);
      toast.custom((t) => (
        <CustomToast message="Fehler beim Speichern" type="error" toastId={t} />
      ));
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = abbreviation.trim() !== originalAbbreviation;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-4">
          <Tag className="w-5 h-5" />
          <h2 className="text-xl font-semibold">Abkürzung verwalten</h2>
        </div>
        <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 py-8">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Lade Abkürzung...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-4">
        <Tag className="w-5 h-5" />
        <h2 className="text-xl font-semibold">Abkürzung verwalten</h2>
      </div>

      <div className="space-y-4">
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
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-[16px]"
            disabled={saving}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Max. 10 Zeichen
          </p>
        </div>

        <div
          className={
            !originalAbbreviation
              ? "bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3"
              : "bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-3"
          }
        >
          <p
            className={`text-sm ${
              !originalAbbreviation
                ? "text-red-800 dark:text-red-300"
                : "text-green-800 dark:text-green-300"
            } flex items-center gap-2`}
          >
            {!originalAbbreviation ? (
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            ) : (
              <Check className="w-4 h-4 flex-shrink-0" />
            )}
            {!originalAbbreviation ? (
              <span>
                Du hast noch keine Abkürzung festgelegt. Bitte leg deine
                individuelle Abkürzung fest. Diese Abkürzung wird bei allen
                Quizzen angezeigt, die du erstellt hast. Sie sollte kurz und
                eindeutig sein (z.B. Initialen).
              </span>
            ) : (
              <span>
                Deine aktuelle Abkürzung:{" "}
                <span className="font-semibold">{originalAbbreviation}.</span>{" "}<br />
                Diese Abkürzung wird bei allen Quizzen angezeigt, die du
                erstellt hast.
              </span>
            )}
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-colors ${
            hasChanges && !saving
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
    </div>
  );
}
