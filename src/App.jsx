import React, { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import './App.css';
import { AppProvider, useAppContext } from './context/AppContext';
import ShellLayout from './components/layout/ShellLayout';
import LoadingBlock from './components/ui/LoadingBlock';
import { analyticsAPI, attendanceAPI, studentAPI } from './db';
import { authService } from './services/authService';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';

const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const StudentsPage = lazy(() => import('./pages/StudentsPage'));
const AttendancePage = lazy(() => import('./pages/AttendancePage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const ParentViewPage = lazy(() => import('./pages/ParentViewPage'));

function AppShell() {
  const { state, dispatch } = useAppContext();
  const [screen, setScreen] = useState('landing');
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [activity, setActivity] = useState([]);
  const demoCredentials = authService.getDemoCredentials();

  const showToast = useCallback(
    (payload) => {
      dispatch({ type: 'SET_TOAST', payload });
      window.clearTimeout(window.__toastTimer__);
      window.__toastTimer__ = window.setTimeout(() => {
        dispatch({ type: 'SET_TOAST', payload: null });
      }, 2800);
    },
    [dispatch]
  );

  const loadTenantData = useCallback(async (instituteId) => {
    if (!instituteId) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const [allStudents, allAttendance, recent] = await Promise.all([
        studentAPI.getAllStudents(instituteId),
        attendanceAPI.getAllAttendance(instituteId),
        analyticsAPI.getRecentActivity(instituteId),
      ]);

      setStudents(allStudents);
      setAttendance(allAttendance);
      setActivity(recent);
    } catch (error) {
      showToast({ type: 'error', text: error.message || 'Could not load institute data.' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [dispatch, showToast]);

  useEffect(() => {
    const bootstrap = async () => {
      await authService.bootstrap();
      const session = authService.getSession();
      if (session) {
        dispatch({ type: 'SET_SESSION', payload: session });
      }
    };

    bootstrap();
  }, [dispatch]);

  useEffect(() => {
    const instituteId = state.session?.instituteId;
    if (!instituteId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTenantData(instituteId);
  }, [state.session?.instituteId, loadTenantData]);

  const login = async (payload) => {
    const session = await authService.login(payload);
    dispatch({ type: 'SET_SESSION', payload: session });
    dispatch({ type: 'SET_PAGE', payload: 'dashboard' });
    setScreen('app');
    showToast({ type: 'success', text: 'Signed in successfully.' });
  };

  const signup = async (payload) => {
    const session = await authService.signup(payload);
    dispatch({ type: 'SET_SESSION', payload: session });
    dispatch({ type: 'SET_PAGE', payload: 'dashboard' });
    setScreen('app');
    showToast({ type: 'success', text: 'Workspace created. Welcome aboard.' });
  };

  const handleDemoLogin = async () => {
    await login(demoCredentials);
  };

  const logout = () => {
    authService.logout();
    dispatch({ type: 'SET_SESSION', payload: null });
    setStudents([]);
    setAttendance([]);
    setActivity([]);
    setScreen('landing');
  };

  const addStudent = async ({ name, batch }) => {
    await studentAPI.addStudent({ instituteId: state.session.instituteId, name, batch });
    await loadTenantData(state.session.instituteId);
    showToast({ type: 'success', text: 'Student added successfully.' });
  };

  const updateStudent = async (studentId, updates) => {
    await studentAPI.updateStudent(studentId, updates);
    await loadTenantData(state.session.instituteId);
    showToast({ type: 'success', text: 'Student updated successfully.' });
  };

  const deleteStudent = async (studentId) => {
    await studentAPI.deleteStudent(studentId);
    await loadTenantData(state.session.instituteId);
    showToast({ type: 'success', text: 'Student deleted successfully.' });
  };

  const saveAttendance = async (date, payload) => {
    await attendanceAPI.bulkMarkAttendance({
      instituteId: state.session.instituteId,
      date,
      payload,
    });
    await loadTenantData(state.session.instituteId);
    showToast({ type: 'success', text: 'Attendance saved successfully.' });
  };

  const renderPage = () => {
    if (state.loading) {
      return <LoadingBlock label="Refreshing workspace..." />;
    }

    switch (state.activePage) {
      case 'students':
        return (
          <StudentsPage
            students={students}
            onAddStudent={addStudent}
            onUpdateStudent={updateStudent}
            onDeleteStudent={deleteStudent}
          />
        );
      case 'attendance':
        return (
          <AttendancePage students={students} attendance={attendance} onSaveAttendance={saveAttendance} />
        );
      case 'reports':
        return <ReportsPage students={students} attendance={attendance} />;
      case 'parent':
        return <ParentViewPage students={students} attendance={attendance} />;
      case 'dashboard':
      default:
        return (
          <DashboardPage
            students={students}
            attendance={attendance}
            activity={activity}
            onOpenAttendance={() => dispatch({ type: 'SET_PAGE', payload: 'attendance' })}
          />
        );
    }
  };

  if (!state.session && screen === 'landing') {
    return <LandingPage onStart={() => setScreen('auth')} onDemoLogin={handleDemoLogin} />;
  }

  if (!state.session && screen === 'auth') {
    return (
      <AuthPage
        onLogin={login}
        onSignup={signup}
        onBack={() => setScreen('landing')}
        demoCredentials={demoCredentials}
      />
    );
  }

  if (!state.session) {
    return <LoadingBlock label="Loading session..." />;
  }

  return (
    <>
      <ShellLayout
        session={state.session}
        activePage={state.activePage}
        onNavigate={(page) => dispatch({ type: 'SET_PAGE', payload: page })}
        onLogout={logout}
      >
        <Suspense fallback={<LoadingBlock />}>
          {renderPage()}
        </Suspense>
      </ShellLayout>

      {state.toast ? <div className={`toast toast-${state.toast.type}`}>{state.toast.text}</div> : null}
    </>
  );
}

function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

export default App;
