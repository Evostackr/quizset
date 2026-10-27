import { createBrowserRouter, Navigate } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { ModePlaceholderPage } from '../pages/ModePlaceholderPage';

/**
 * QuizSet Router Configuration
 * 
 * Defines lightweight application routes for Phase 1:
 * - `/`: Responsive test-set selection homepage
 * - `/practice/:setId/:mode`: Placeholder route confirming selected set and mode
 * - `*`: Fallback redirect to homepage
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/practice/:setId/:mode',
    element: <ModePlaceholderPage />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

