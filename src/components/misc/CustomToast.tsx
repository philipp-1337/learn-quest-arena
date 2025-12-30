import React from "react";

export function CustomToast({ message, type = "info" }: { message: React.ReactNode; type?: "info" | "success" | "error" }) {
  let bg = "bg-indigo-100 dark:bg-indigo-800 border-2 border-indigo-300 dark:border-indigo-600 text-gray-900 dark:text-indigo-100";
  if (type === "success") bg = "bg-green-100 dark:bg-green-800 border-2 border-green-300 dark:border-green-600 text-green-900 dark:text-green-100";
  if (type === "error") bg = "bg-red-100 dark:bg-red-800 border-2 border-red-300 dark:border-red-600 text-red-900 dark:text-red-100";

  return (
    <div className={`${bg} rounded-lg p-4 shadow-lg text-base min-w-[280px] max-w-md`}>
      {message}
    </div>
  );
}
