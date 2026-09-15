import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import type { Member } from '../api/types';
import { SkeletonBar } from '../components/Skeleton';

type InviteRole = 'admin' | 'treasury';

const EMAIL_RE = /.+@.+\..+/;
const ROLE_NAME: Record<InviteRole, Member['role']> = { admin: 'Admin', treasury: 'Treasury' };

const ROLE_TAGLINE: Record<InviteRole, string> = {
  admin: 'Full access — global revenue, all three streams, settings and invites.',
  treasury: 'Restricted — the OTC trade log only. No revenue dashboards, no settings.',
};

const PERMISSIONS = [
  ['Overview — global revenue', 'Full', 'No access'],
  ['Collection Platform', 'Full', 'No access'],
  ['Remittance', 'Full', 'No access'],
  ['Trade Desk — summary metrics', 'Full', 'Hidden'],
  ['Trade Desk — transaction log', 'View', 'View and log trades'],
  ['Settings, roles and invites', 'Full', 'No access'],
].map((p) => ({
  area: p[0],
  admin: p[1],
  treasury: p[2],
  adminFg: 'var(--color-accent-800)',
  treasuryFg: p[2].indexOf('No access') === 0 || p[2] === 'Hidden' ? 'var(--color-neutral-600)' : 'var(--color-accent-800)',
}));

export default function Settings() {
  const [members, setMembers] = useState<Member[] | null>(null);
  const [lastSync, setLastSync] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<InviteRole>('admin');
  const [inviteNote, setInviteNote] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const d = await api.getSettings();
    setMembers(d.members);
    setLastSync(d.lastSync);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onInvite = async () => {
    if (busy) return;
    if (!EMAIL_RE.test(inviteEmail)) {
      setInviteNote('Enter a valid work email address.');
      return;
    }
    setBusy(true);
    try {
      await api.inviteMember(inviteEmail, ROLE_NAME[inviteRole]);
      await load();
      setInviteNote(
        `Invite sent to ${inviteEmail} as ${ROLE_NAME[inviteRole]}. They will create their own password.`,
      );
      setInviteEmail('');
    } finally {
      setBusy(false);
    }
  };

  const onToggle = async (i: number) => {
    await api.toggleMember(i);
    await load();
  };

  const pickStyle = (r: InviteRole) => ({
    background: inviteRole === r ? 'var(--color-accent-100)' : '#fff',
    boxShadow: inviteRole === r ? '0 0 0 2px var(--color-accent)' : 'none',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1040 }}>
      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div className="panel" style={{ padding: 20 }}>
          <h5 style={{ margin: '0 0 4px' }}>Invite a user</h5>
          <p className="text-muted" style={{ fontSize: 14 }}>
            The invited address receives a one-time link and creates their own password on first
            sign-in.
          </p>
          <div className="field" style={{ marginBottom: 14 }}>
            <label>Work email</label>
            <input
              className="input"
              style={{ background: '#fff' }}
              type="email"
              placeholder="name@banffpay.ca"
              value={inviteEmail}
              onChange={(e) => {
                setInviteEmail(e.target.value);
                if (inviteNote) setInviteNote('');
              }}
            />
          </div>
          <div className="field">
            <label>Role</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(Object.keys(ROLE_NAME) as InviteRole[]).map((r) => (
                <div
                  key={r}
                  onClick={() => setInviteRole(r)}
                  style={{
                    display: 'flex',
                    gap: 10,
                    padding: 12,
                    borderRadius: 6,
                    cursor: 'pointer',
                    border: '1px solid var(--color-neutral-200)',
                    ...pickStyle(r),
                  }}
                >
                  <span
                    style={{
                      width: 16,
                      height: 16,
                      flex: 'none',
                      marginTop: 3,
                      borderRadius: '50%',
                      border: '2px solid var(--color-accent)',
                      background: inviteRole === r ? 'var(--color-accent)' : 'transparent',
                    }}
                  />
                  <span>
                    <span style={{ display: 'block', fontWeight: 700 }}>{ROLE_NAME[r]}</span>
                    <span className="text-muted" style={{ fontSize: 13, display: 'block' }}>
                      {ROLE_TAGLINE[r]}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={onInvite}>
            Send invite
          </button>
          {inviteNote && (
            <p style={{ fontSize: 13, color: 'var(--color-accent-800)', margin: '10px 0 0' }}>
              {inviteNote}
            </p>
          )}
        </div>

        <div className="panel" style={{ padding: 20 }}>
          <h5 style={{ margin: '0 0 12px' }}>Roles and permissions</h5>
          <table className="table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Area</th>
                <th style={{ textAlign: 'center' }}>Admin</th>
                <th style={{ textAlign: 'center' }}>Treasury</th>
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((p) => (
                <tr key={p.area}>
                  <td>{p.area}</td>
                  <td style={{ textAlign: 'center', color: p.adminFg }}>{p.admin}</td>
                  <td style={{ textAlign: 'center', color: p.treasuryFg }}>{p.treasury}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel" style={{ padding: 20 }}>
        <h5 style={{ margin: '0 0 12px' }}>Members</h5>
        <table className="table">
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members ? (
              members.map((m, i) => (
                <tr key={m.email}>
                  <td>{m.email}</td>
                  <td>
                    <span className="tag tag-accent" style={{ borderRadius: 4 }}>
                      {m.role}
                    </span>
                  </td>
                  <td>
                    <span className="tag tag-neutral" style={{ borderRadius: 4 }}>
                      {m.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ height: 32, fontSize: 14 }}
                      onClick={() => onToggle(i)}
                    >
                      {m.role === 'Admin' ? 'Set Treasury' : 'Set Admin'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td>
                  <SkeletonBar width={200} height={16} />
                </td>
                <td>
                  <SkeletonBar width={70} height={16} />
                </td>
                <td>
                  <SkeletonBar width={70} height={16} />
                </td>
                <td />
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="panel" style={{ padding: 20, maxWidth: 540 }}>
        <h5 style={{ margin: '0 0 12px' }}>Data sources</h5>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              paddingBottom: 10,
              borderBottom: '1px solid var(--color-neutral-200)',
            }}
          >
            <span style={{ flex: 1 }}>Collection Platform</span>
            <span className="text-muted">API · synced {lastSync || '—'}</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              paddingBottom: 10,
              borderBottom: '1px solid var(--color-neutral-200)',
            }}
          >
            <span style={{ flex: 1 }}>Remittance</span>
            <span className="text-muted">API · synced {lastSync || '—'}</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              paddingBottom: 10,
              borderBottom: '1px solid var(--color-neutral-200)',
            }}
          >
            <span style={{ flex: 1 }}>Trade Desk (OTC)</span>
            <span className="text-muted">Manual entry · Treasury</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ flex: 1 }}>Base currency</span>
            <span className="tag tag-neutral" style={{ borderRadius: 4 }}>
              CAD, USD
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}