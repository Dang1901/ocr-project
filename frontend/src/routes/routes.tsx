import type { RouteObject } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from '../components/layout/AppLayout';
import LoginPage from '../pages/auth/LoginPage';
import SigninPage from '../pages/auth/SigninPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import VerifyOTPPage from '../pages/auth/VerifyOTPPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import ActivityLogPage from '../pages/activity-log/ActivityLog';
import { ListUsers } from '../pages/iam/users';
import { ListRoles, DetailRole } from '../pages/iam/roles';
import { ListOrgs } from '../pages/iam/org';
import { ListDepartments } from '../pages/iam/departments';
import NotFoundPage from '../pages/not-found/NotFoundPage';
import { Dashboard } from '@/pages/overview/dashboard';
import { ListDocuments, DetailDocument } from '@/pages/my-document/documents';
import OCR from '@/pages/my-document/ocr/OCR';

export const publicRoutes: RouteObject[] = [
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <SigninPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/verify-otp',
    element: <VerifyOTPPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
];


export const protectedRoutes: RouteObject[] = [
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      // Overview routes
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      // IAM routes
      {
        path: 'users',
        element: <ListUsers />,
      },
      {
        path: 'roles',
        element: <ListRoles />,
      },
      {
        path: 'roles/:roleId',
        element: <DetailRole />,
      },
      {
        path: 'org',
        element: <ListOrgs />,
      },
      {
        path: 'departments',
        element: <ListDepartments />,
      },
      {
        path: 'documents',
        element: <ListDocuments />,
      },
      {
        path: 'documents/:documentId',
        element: <DetailDocument />,
      },
      // OCR route
      {
        path: 'ocr',
        element: <OCR />,
      },
      // Activity Log route
      {
        path: 'activity-log',
        element: <ActivityLogPage />,
      },
    ],
  },
];

/**
 * Tất cả routes
 */
export const allRoutes: RouteObject[] = [
  ...publicRoutes,
  ...protectedRoutes,
  {
    path: '*',
    element: <NotFoundPage />,
  },
];

