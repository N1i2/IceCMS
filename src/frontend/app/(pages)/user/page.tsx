'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { userApi } from '@/app/services/api';
import { UserModel } from '@/app/models/userModel';
import { sendSuccess, sendError } from '@/helpModule/Massages';
import styles from './page.module.css';
import { Button } from '@/components/ui/button';
import { Toaster } from 'sonner';
import { AdminRole, UserRole } from './const/userRoles';

export default function UsersPage() {
  const [users, setUsers] = useState<UserModel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingRows, setLoadingRows] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');

    if (!token) {
      router.push('/login');
      return;
    } else if (role !== AdminRole) {
      router.push('/home');
      return;
    }

    loadUsers();
    document.title = 'Users';
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await userApi.getAll();
      const filteredUsers = res.data.filter(
        (user: UserModel) => user.email !== 'nikola@gmail.com',
      );
      setUsers(filteredUsers);
    } catch (err: any) {
      setError(`Failed to load users: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLockToggle = async (id: string, currentLock: boolean) => {
    setLoadingRows((prev) => [...prev, id]);
    try {
      await userApi.update(id, { lock: !currentLock });
      loadUsers();
      sendSuccess(
        'Success',
        `User has been ${!currentLock ? 'locked' : 'unlocked'} successfully!`,
      );
    } catch (err: any) {
      sendError('Error', `Failed to update lock status. ${err.message}`);
    } finally {
      setLoadingRows((prev) => prev.filter((rowId) => rowId !== id));
    }
  };

  const handleResetPassword = async (id: string) => {
    setLoadingRows((prev) => [...prev, id]);
    try {
      const defaultPassword = 'default123';
      await userApi.update(id, { passwordHash: defaultPassword });
      loadUsers();
      sendSuccess('Success', 'Password reset successfully!');
    } catch (err: any) {
      sendError('Error', `Failed to reset password. ${err.message}`);
    } finally {
      setLoadingRows((prev) => prev.filter((rowId) => rowId !== id));
    }
  };

  const handleAdminToggle = async (id: string, currentRole: string) => {
    setLoadingRows((prev) => [...prev, id]);
    try {
      const updatedRole = currentRole === AdminRole ? UserRole : AdminRole;
      await userApi.update(id, { role: updatedRole });
      loadUsers();
      sendSuccess(
        'Success',
        `User has been ${
          updatedRole === AdminRole ? 'granted' : 'revoked'
        } administrator rights successfully!`,
      );
    } catch (err: any) {
      sendError(
        'Error',
        `Failed to update administrator rights. ${err.message}`,
      );
    } finally {
      setLoadingRows((prev) => prev.filter((rowId) => rowId !== id));
    }
  };

  return (
    <div>
      <div>
        <Button
          onClick={() => router.push('/home')}
          className={styles.buttonBack}
        >
          Go back to Home
        </Button>
        <h1 className={styles.title}>Users</h1>
      </div>

      <div className="p-6">
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.tableWrapper}>
          {loading ? (
            <p className="text-white text-center py-10">Loading users...</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id} className={styles.fadeIn}>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td className="text-center">
                        {loadingRows.includes(user.id!) ? (
                          <div className={styles.loadingIndicator}>
                            Loading...
                          </div>
                        ) : (
                          <div className={styles.actions}>
                            <Button
                              onClick={() =>
                                handleLockToggle(user.id!, user.lock)
                              }
                              className={styles.changeButton}
                            >
                              {user.lock ? 'Unlock' : 'Lock'}
                            </Button>
                            <Button
                              onClick={() => handleResetPassword(user.id!)}
                              className={styles.changeButton}
                            >
                              Reset Password
                            </Button>
                            <Button
                              onClick={() =>
                                handleAdminToggle(user.id!, user.role)
                              }
                              className={styles.changeButton}
                            >
                              {user.role === AdminRole
                                ? 'Revoke Admin Rights'
                                : 'Grant Admin Rights'}
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center py-10 text-gray-400">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <Toaster />
    </div>
  );
}
