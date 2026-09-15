import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { Role } from '../api/types';
import { useAuth } from '../auth/useAuth';

export default function AcceptInvite() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('new.analyst@banffpay.ca');
  const [role] = useState<Role>('treasury');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(user.role === 'treasury' ? '/trade' : '/overview', { replace: true });
    }
  }, [user, navigate]);

  const ok8 = pw.length >= 8;
  const okNum = /\d/.test(pw);
  const okMatch = pw.length > 0 && pw === pw2;

  const ruleEntries: [boolean, string][] = [
    [ok8, 'At least 8 characters'],
    [okNum, 'Contains a number'],
    [okMatch, 'Both passwords match'],
  ];
  const pwRules = ruleEntries.map(([pass, label]) => ({
    mark: pass ? '✓' : '○',
    fg: pass ? '#1e7a52' : 'var(--color-neutral-600)',
    label,
  }));

  const submit = async () => {
    if (submitting) return;
    if (!(ok8 && okNum && okMatch)) {
      setError('Password does not meet the requirements yet.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.acceptInvite(email, pw, role);
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

  return (
    <div className="auth-page">
      <div className="auth-card">
        <img
          src="/logo-dark.png"
          alt="Banffpay"
          style={{ height: 30, width: 'auto', marginBottom: 22 }}
        />
        <span className="tag tag-accent" style={{ borderRadius: 4 }}>
          Invitation · {role === 'admin' ? 'Admin' : 'Treasury'}
        </span>
        <h3 style={{ margin: '12px 0 4px' }}>Create your password</h3>
        <p
          className="text-muted"
          style={{ fontSize: 14, marginBottom: 22 }}
        >
          You were invited to Banffpay Performance. Set a password to activate
          your account.
        </p>
        <div className="field" style={{ marginBottom: 14 }}>
          <label htmlFor="ac-email">Email</label>
          <input
            id="ac-email"
            className="input"
            type="email"
            style={{
              background: 'var(--color-neutral-100)',
              color: 'var(--color-neutral-700)',
            }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="field" style={{ marginBottom: 14 }}>
          <label htmlFor="ac-p1">New password</label>
          <input
            id="ac-p1"
            className="input"
            type="password"
            placeholder="At least 8 characters"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="ac-p2">Confirm password</label>
          <input
            id="ac-p2"
            className="input"
            type="password"
            placeholder="Re-enter password"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
          />
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            marginTop: 14,
            fontSize: 13,
          }}
        >
          {pwRules.map((r) => (
            <div
              key={r.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: r.fg,
              }}
            >
              <span>{r.mark}</span>
              {r.label}
            </div>
          ))}
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
          Create password and continue
        </button>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: 14,
          }}
        >
          <button
            className="btn btn-ghost"
            style={{ fontSize: 15 }}
            onClick={() => navigate('/login')}
          >
            Back to sign in
          </button>
        </div>
      </div>
    </div>
  );
}