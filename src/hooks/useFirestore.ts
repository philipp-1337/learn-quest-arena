import { collection, doc, getFirestore, setDoc, getDocs } from "firebase/firestore";
import { useState } from "react";

const useFirestore = () => {
  const db = getFirestore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveDocument = async (path: string, data: any) => {
    setLoading(true);
    setError(null);
    try {
      await setDoc(doc(db, path), data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchCollection = async (path: string) => {
    setLoading(true);
    setError(null);
    try {
      const querySnapshot = await getDocs(collection(db, path));
      setLoading(false);
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      return [];
    }
  };

  return { saveDocument, fetchCollection, loading, error };
};

export default useFirestore;