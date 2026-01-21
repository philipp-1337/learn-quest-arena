import { Outlet } from "react-router-dom";
import { QuizEditLockProvider } from "../../../../features/admin/quiz-editor/context/QuizEditLockContext";

export default function QuizEditLayout() {
  return (
    <QuizEditLockProvider>
      <Outlet />
    </QuizEditLockProvider>
  );
}
