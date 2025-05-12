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
import { AxiosError } from 'axios';

type RoleFilterType = 'all' | 'user' | 'admin';
type LockedFilterType = 'all' | 'lock' | 'unlock';
type SortDirectionType = 'asc' | 'desc' | null;

export default function UsersPage() {
  const [users, setUsers] = useState<UserModel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingRows, setLoadingRows] = useState<string[]>([]);
  const [search, setSearch] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<SortDirectionType>(null);
  const [roleFilter, setRoleFilter] = useState<RoleFilterType>('all');
  const [lockedFilter, setLockedFilter] = useState<LockedFilterType>('all');

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');

    if (!token) {
      router.push('/login');
    } else if (role !== AdminRole) {
      router.push('/home');
    } else {
      loadUsers();
      document.title = 'Users';
    }
  }, [router]);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userApi.getAll();
      const filteredUsers = response.data.filter(
        (user: UserModel) => user.email !== 'nikola@gmail.com'
      );
      setUsers(filteredUsers);
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      setError(`Failed to load users: ${error.message}`);
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
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      sendError('Error', `Failed to update lock status. ${error.message}`);
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
        } administrator rights!`,
      );
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      sendError(
        'Error',
        `Failed to update administrator rights. ${error.message}`,
      );
    } finally {
      setLoadingRows((prev) => prev.filter((rowId) => rowId !== id));
    }
  };

  const filteredUsers = users
    .filter((user) => user.email.toLowerCase().includes(search.toLowerCase()))
    .filter((user) => {
      if (roleFilter === 'admin') return user.role === AdminRole;
      if (roleFilter === 'user') return user.role === UserRole;
      return true;
    })
    .filter((user) => {
      if (lockedFilter === 'lock') return user.lock === true;
      if (lockedFilter === 'unlock') return user.lock === false;
      return true;
    })
    .sort((a, b) => {
      if (sortDirection === 'asc') return a.email.localeCompare(b.email);
      if (sortDirection === 'desc') return b.email.localeCompare(a.email);
      return 0;
    });

  return (
    <div className={styles.page}>
      <Toaster />
      <header className={styles.header}>
        <Button onClick={() => router.push('/home')} className={styles.backBtn}>
          Go back to Home
        </Button>
        <h1 className={styles.title}>User Management</h1>
      </header>

      <section className={styles.controls}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search by email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className={styles.filters}>
          <div>
            <label>Sort:</label>
            <select
              value={sortDirection || ''}
              onChange={(e) =>
                setSortDirection(e.target.value as SortDirectionType)
              }
            >
              <option value="">None</option>
              <option value="asc">A → Z</option>
              <option value="desc">Z → A</option>
            </select>
          </div>
          <div>
            <label>Role:</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as RoleFilterType)}
            >
              <option value="all">All</option>
              <option value="user">Users</option>
              <option value="admin">Admins</option>
            </select>
          </div>
          <div>
            <label>Lock:</label>
            <select
              value={lockedFilter}
              onChange={(e) => setLockedFilter(e.target.value as LockedFilterType)}
            >
              <option value="all">All</option>
              <option value="lock">Locked</option>
              <option value="unlock">Unlocked</option>
            </select>
          </div>
        </div>
      </section>

      {error && <div className={styles.error}>{error}</div>}

      <section className={styles.tableWrapper}>
        {loading ? (
          <p className={styles.loading}>Loading users...</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className={styles.fadeIn}>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{user.lock ? 'Locked' : 'Unlocked'}</td>
                    <td>
                      {loadingRows.includes(user.id!) ? (
                        <span className={styles.loadingIndicator}>
                          Processing...
                        </span>
                      ) : (
                        <div className={styles.actions}>
                          <Button
                            onClick={() =>
                              handleLockToggle(user.id!, user.lock)
                            }
                            className={styles.actionBtn}
                          >
                            {user.lock ? 'Unlock' : 'Lock'}
                          </Button>
                          <Button
                            onClick={() =>
                              handleAdminToggle(user.id!, user.role)
                            }
                            className={styles.actionBtn}
                          >
                            {user.role === AdminRole
                              ? 'Revoke Admin'
                              : 'Grant Admin'}
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className={styles.noData}>
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}