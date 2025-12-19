import { collection, doc, getFirestore, setDoc, getDocs, deleteDoc } from "firebase/firestore";
import { useCallback } from "react";

const useFirestore = () => {
  const db = getFirestore();

  const saveDocument = useCallback(async (path: string, data: any) => {
    try {
      console.log(`Saving document to ${path}:`, data);
      await setDoc(doc(db, path), data);
      console.log(`Success: Document saved successfully to ${path}`);
      return { success: true, error: null };
    } catch (err: any) {
      console.error(`Error saving document to ${path}:`, err);
      return { success: false, error: err.message };
    }
  }, [db]);

  const fetchCollection = useCallback(async (path: string) => {
    try {
      console.log(`Fetching collection: ${path}`);
      const querySnapshot = await getDocs(collection(db, path));
      const docs = querySnapshot.docs.map((doc) => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      console.log(`Success: Fetched ${docs.length} documents from ${path}`);
      return docs;
    } catch (err: any) {
      console.error(`Error fetching collection ${path}:`, err);
      // Return empty array instead of throwing
      return [];
    }
  }, [db]);

  const deleteDocument = useCallback(async (path: string) => {
    try {
      console.log(`Deleting document at ${path}`);
      await deleteDoc(doc(db, path));
      console.log(`Success: Document deleted successfully at ${path}`);
      return { success: true, error: null };
    } catch (err: any) {
      console.error(`Error deleting document at ${path}:`, err);
      return { success: false, error: err.message };
    }
  }, [db]);

  return { saveDocument, fetchCollection, deleteDocument };
};

export default useFirestore;