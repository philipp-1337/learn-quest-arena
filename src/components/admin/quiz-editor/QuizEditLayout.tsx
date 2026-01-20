import { Outlet } from "react-router-dom";
import { QuizEditLockProvider } from "../../../contexts/QuizEditLockContext";

export default function QuizEditLayout() {
  return (
    <QuizEditLockProvider>
      <Outlet />
    </QuizEditLockProvider>
  );
}
