import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { Role } from '../api/types';
import { useAuth } from '../auth/useAuth';
import { Segmented } from '../components/Segmented';

const roleOptions: { value: Role; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'treasury', label: 'Treasury' },
];

export default function SignIn() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('ops@banffpay.ca');
  const [password, setPassword] = useState('demo1234');
  const [role, setRole] = useState<Role>('admin');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(user.role === 'treasury' ? '/trade' : '/overview', { replace: true });
    }
  }, [user, navigate]);

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await api.login(email, password, role);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      signIn(res.user);
      navigate(res.user.role === 'treasury' ? '/trade' : '/overview', { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  const onPasswordKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') submit();
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <img
          src="/logo-dark.png"
          alt="Banffpay"
          style={{ height: 30, width: 'auto', marginBottom: 26 }}
        />
        <h3 style={{ margin: '0 0 4px' }}>Sign in</h3>
        <p
          className="text-muted"
          style={{ fontSize: 14, marginBottom: 22 }}
        >
          Invite-only access. Use the address your invitation was sent to.
        </p>
        <div className="field" style={{ marginBottom: 14 }}>
          <label htmlFor="bp-email">Email</label>
          <input
            id="bp-email"
            className="input"
            type="email"
            placeholder="you@banffpay.ca"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="bp-pass">Password</label>
          <input
            id="bp-pass"
            className="input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={onPasswordKeyDown}
          />
        </div>
        <div className="field" style={{ marginTop: 16 }}>
          <label>Sign in as</label>
          <Segmented
            options={roleOptions}
            value={role}
            onChange={setRole}
          />
        </div>
        {error && (
          <p
            style={{
              fontSize: 13,
              color: '#c0392b',
              margin: '12px 0 0',
            }}
          >
            {error}
          </p>
        )}
        <button
          className="btn btn-primary btn-block"
          style={{ marginTop: 20, height: 44 }}
          disabled={submitting}
          onClick={submit}
        >
          Sign in
        </button>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: 16,
            paddingTop: 16,
            borderTop: '1px solid var(--color-neutral-200)',
          }}
        >
          <button
            className="btn btn-ghost"
            style={{ fontSize: 15 }}
            onClick={() => navigate('/accept')}
          >
            Have an invite? Create your password
          </button>
        </div>
        <p
          className="text-muted"
          style={{
            fontSize: 12,
            margin: '22px 0 0',
            textAlign: 'center',
          }}
        >
          Restricted system. Access is logged.
        </p>
      </div>
    </div>
  );
}