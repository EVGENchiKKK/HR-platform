import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Auth } from '../pages/Auth';
import { Dashboard } from '../pages/Dashboard';
import { Employees } from '../pages/Employees';
import { Analytics } from '../pages/Analytics';
import { Departments } from '../pages/Departments';
import { Tasks } from '../pages/Tasks';
import { Surveys } from '../pages/Surveys';
import { Appeals } from '../pages/Appeals';
import { Training } from '../pages/Training';
import { Forum } from '../pages/Forum';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Layout } from '../components/Layout';
import './../style/App.css';

export const App = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<Navigate to="/auth" replace />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="employees" element={<Employees />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="departments" element={<Departments />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="surveys" element={<Surveys />} />
            <Route path="appeals" element={<Appeals />} />
            <Route path="training" element={<Training />} />
            <Route path="forum" element={<Forum />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
