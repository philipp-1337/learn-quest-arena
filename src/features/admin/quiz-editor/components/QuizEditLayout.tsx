import { Outlet } from 'react-router-dom';
import { QuizEditLockProvider } from '@admin';

export default function QuizEditLayout() {
  return (
    <QuizEditLockProvider>
      <Outlet />
    </QuizEditLockProvider>
  );
}
