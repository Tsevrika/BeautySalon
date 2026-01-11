import Link from 'next/link';
import { useRouter } from 'next/router';
import { hasRole, useAuth } from './AuthContext';
import styles from '../styles/Layout.module.css';

export default function Layout({ children }) {
  const { user, signOut } = useAuth();
  const router = useRouter();

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <Link href="/">BeautySalon</Link>
        </div>
        <nav className={styles.nav}>
          <Link className={router.pathname === '/' ? styles.active : ''} href="/">Головна</Link>
          <Link className={router.pathname.startsWith('/services') ? styles.active : ''} href="/services">Послуги</Link>
          <Link className={router.pathname.startsWith('/masters') ? styles.active : ''} href="/masters">Майстри</Link>

          {}
          {user && hasRole(user, 'master') && (
            <Link
              className={router.pathname.startsWith('/master') ? styles.active : ''}
              href="/master"
            >
              Мої записи
            </Link>
          )}


          {}
          {!hasRole(user, 'admin') && !hasRole(user, 'master') && (
            <Link className={router.pathname.startsWith('/book') ? styles.active : ''} href="/book">
              Записатися
            </Link>
          )}

          {}
          {user && !hasRole(user, 'admin') && !hasRole(user, 'master') && (
            <Link className={router.pathname.startsWith('/profile') ? styles.active : ''} href="/profile">
              Профіль
            </Link>
          )}

          {}
          {user && hasRole(user, 'admin') && (
            <Link className={router.pathname.startsWith('/appointments') ? styles.active : ''} href="/appointments">
              Усі записи
            </Link>
          )}

        </nav>

        <div className={styles.auth}>
          {!user ? (
            <>
              <Link href="/login">Вхід</Link>
              <Link href="/register">Реєстрація</Link>
            </>
          ) : (
            <>
              <span className={styles.user}>{user.name || user.email} ({user.role})</span>
              <button className={styles.btn} onClick={() => { signOut(); router.push('/'); }}>Вихід</button>
            </>
          )}
        </div>
      </header>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        <div>© {new Date().getFullYear()} BeautySalon • Coursework</div>
      </footer>
    </div>
  );
}
