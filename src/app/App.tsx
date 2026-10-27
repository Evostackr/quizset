import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';

/**
 * QuizSet Root App Component
 */
export const App: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default App;

