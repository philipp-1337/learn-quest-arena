import React from "react";

export function CustomToast({ message, type = "info" }: { message: React.ReactNode; type?: "info" | "success" | "error" }) {
  let bg = "bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 text-gray-900 dark:text-indigo-300";
  if (type === "success") bg = "bg-green-50 dark:bg-green-900/30 border border-green-200 text-green-900 dark:text-green-200";
  if (type === "error") bg = "bg-red-50 dark:bg-red-900/30 border border-red-200 text-red-900 dark:text-red-200";

  return (
    <div className={`${bg} rounded-lg p-4 shadow-sm text-base`}>
      {message}
    </div>
  );
}
