import { useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { PeriodKey, Role } from '../api/types';
import { useAuth } from '../auth/useAuth';
import { Segmented } from '../components/Segmented';
import {
  CollectionIcon,
  MenuIcon,
  OverviewIcon,
  RemittanceIcon,
  SettingsIcon,
  SignOutIcon,
  TradeIcon,
  USFlagIcon,
} from '../components/icons';

export interface ShellContext {
  period: PeriodKey;
  setPeriod: (p: PeriodKey) => void;
}

export type PageKey =
  | 'overview'
  | 'collection'
  | 'remittance'
  | 'trade'
  | 'settings';

interface PageMeta {
  key: PageKey;
  nav: string;
  title: string;
  sub: string;
  icon: ReactNode;
  roles: Role[];
  group: 'Revenue' | 'System';
}

const PAGE_KEYS: PageKey[] = ['overview', 'collection', 'remittance', 'trade', 'settings'];

function pageFromPath(path: string): PageKey {
  const p = path.replace(/^\//, '') as PageKey;
  return PAGE_KEYS.includes(p) ? p : 'overview';
}

const periodOptions: { value: PeriodKey; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'd7', label: '7D' },
  { value: 'mtd', label: 'MTD' },
  { value: 'ytd', label: 'YTD' },
];

export function AppShell() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [period, setPeriod] = useState<PeriodKey>('mtd');

  if (!user) return <Navigate to="/login" replace />;

  const admin = user.role === 'admin';
  const page = pageFromPath(location.pathname);

  const all: PageMeta[] = [
    {
      key: 'overview',
      nav: 'Overview',
      title: 'Overview',
      sub: 'Global revenue across all three streams',
      icon: <OverviewIcon />,
      roles: ['admin'],
      group: 'Revenue',
    },
    {
      key: 'collection',
      nav: 'Collection Platform',
      title: 'Collection Platform',
      sub: 'Pay in, pay out, settlement and FX gains',
      icon: <CollectionIcon />,
      roles: ['admin'],
      group: 'Revenue',
    },
    {
      key: 'remittance',
      nav: 'Remittance',
      title: 'Remittance',
      sub: 'Transaction count and revenue',
      icon: <RemittanceIcon />,
      roles: ['admin'],
      group: 'Revenue',
    },
    {
      key: 'trade',
      nav: 'Trade Desk',
      title: 'Trade Desk (OTC)',
      sub: 'Manually logged trades, spread and revenue',
      icon: <TradeIcon />,
      roles: ['admin', 'treasury'],
      group: 'Revenue',
    },
    {
      key: 'settings',
      nav: 'Settings',
      title: 'Settings',
      sub: 'Roles, invites and data sources',
      icon: <SettingsIcon />,
      roles: ['admin'],
      group: 'System',
    },
  ];

  const navBtn = (m: PageMeta) => (
    <button
      key={m.key}
      className={'nav-btn' + (page === m.key ? ' active' : '')}
      onClick={() => {
        setMenuOpen(false);
        navigate('/' + m.key);
      }}
    >
      {m.icon} {m.nav}
    </button>
  );

  const current = all.find((m) => m.key === page) ?? all[0];

  return (
    <div className="shell">
      {menuOpen && (
        <div className="sidebar-backdrop" onClick={() => setMenuOpen(false)} />
      )}

      <aside className={menuOpen ? 'sidebar open' : 'sidebar'}>
        <div style={{ padding: '0 8px' }}>
          <img
            src="/logo-light.png"
            alt="Banffpay"
            style={{ height: 26, width: 'auto', display: 'block' }}
          />
          <div
            style={{
              fontSize: 11,
              letterSpacing: '.2em',
              textTransform: 'uppercase',
              opacity: 0.85,
              marginTop: 10,
            }}
          >
            Performance
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <span className="nav-group">Revenue</span>
          {all
            .filter((m) => m.group === 'Revenue' && m.roles.includes(user.role))
            .map(navBtn)}
          {admin && (
            <>
              <span className="nav-group" style={{ paddingTop: 18 }}>
                System
              </span>
              {navBtn(all.find((m) => m.key === 'settings')!)}
            </>
          )}
          </nav>

        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 8px 4px',
            borderTop: '1px solid rgba(255,255,255,.28)',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              flex: 'none',
              display: 'grid',
              placeItems: 'center',
              background: '#fff',
              color: 'var(--color-accent-700)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: 13,
              borderRadius: '50%',
            }}
          >
            {user.email[0]?.toUpperCase()}
            {user.email[1]?.toUpperCase()}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: 13,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user.email}
            </div>
            <span
              style={{
                display: 'inline-block',
                fontSize: 11,
                letterSpacing: '.08em',
                textTransform: 'uppercase',
                background: 'rgba(255,255,255,.22)',
                padding: '1px 7px',
                borderRadius: 3,
                marginTop: 3,
              }}
            >
              {admin ? 'Admin' : 'Treasury'}
            </span>
          </div>
          <button
            title="Sign out"
            style={{
              width: 30,
              height: 30,
              flex: 'none',
              display: 'grid',
              placeItems: 'center',
              border: 0,
              borderRadius: 6,
              background: 'transparent',
              color: '#fff',
              cursor: 'pointer',
            }}
            onClick={() => {
              signOut();
              navigate('/login');
            }}
          >
            <SignOutIcon size={16} />
          </button>
        </div>
      </aside>

      <main className="shell-main">
        <header className="shell-header">
          <button
            className="menu-toggle"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <MenuIcon size={18} />
          </button>
          <div style={{ minWidth: 0 }}>
            <h4 style={{ margin: 0 }}>{current.title}</h4>
            <div className="text-muted" style={{ fontSize: 13 }}>
              {current.sub}
            </div>
          </div>
          <div
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              flexWrap: 'wrap',
            }}
          >
            <Segmented options={periodOptions} value={period} onChange={setPeriod} />
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                fontSize: 15,
                borderLeft: '1px solid var(--color-neutral-200)',
                paddingLeft: 14,
              }}
            >
              <USFlagIcon />USD
            </span>
          </div>
        </header>

        <div className="shell-content">
          <Outlet context={{ period, setPeriod } satisfies ShellContext} />
        </div>
      </main>
    </div>
  );
}