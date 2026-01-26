import type { ReactNode } from 'react';
import { useSwipeToDelete } from '@hooks/useSwipeToDelete';
import { Trash } from 'lucide-react';

interface SwipeableListItemProps {
  itemId: string;
  onDelete: () => void;
  children: ReactNode;
  deleteButtonText?: string;
  deleteButtonClassName?: string;
  containerClassName?: string;
}

export function SwipeableListItem({
  itemId,
  onDelete,
  children,
  deleteButtonText = "Löschen",
  deleteButtonClassName = "bg-red-500 text-white font-semibold",
  containerClassName = "bg-white dark:bg-gray-900 rounded px-3 py-2 border border-gray-200 dark:border-gray-700"
}: SwipeableListItemProps) {
  const { isMobile, getSwipeProps, resetSwipe } = useSwipeToDelete();

  const handleDelete = () => {
    onDelete();
    resetSwipe(itemId);
  };

  return (
    <li className="relative overflow-hidden rounded">
      <div className="relative">
        {/* Delete Button Background (mobile only) */}
        {isMobile && (
          <div className="absolute inset-0 bg-red-500 flex items-center justify-end pr-4">
            <button
              className={deleteButtonClassName}
              onClick={handleDelete}
              type="button"
            >
              {deleteButtonText}
            </button>
          </div>
        )}
        
        {/* Main Content */}
        <div
          className={`flex items-center justify-between relative ${containerClassName}`}
          {...getSwipeProps(itemId)}
        >
          <div className="flex-1 min-w-0">
            {children}
          </div>
          
          {/* Desktop Delete Button (not on mobile) */}
          {!isMobile && (
            <button
              className="ml-4 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded shadow flex-shrink-0"
              onClick={handleDelete}
              type="button"
            >
              {/* Show icon on small screens, text otherwise */}
              <span className="block sm:hidden">
                <Trash className="w-5 h-5" />
              </span>
              <span className="hidden sm:block">
                {deleteButtonText}
              </span>
            </button>
          )}
        </div>
      </div>
    </li>
  );
}