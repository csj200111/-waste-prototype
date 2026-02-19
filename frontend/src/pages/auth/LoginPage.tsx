import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/features/auth/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isValid = email.trim() && password.trim();

  const handleSubmit = async () => {
    if (!isValid) return;
    setError('');
    setLoading(true);
    try {
      await login({ email: email.trim(), password });
      navigate('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : '로그인에 실패했습니다');
      setLoading(false);
    }
  };

  return (
    <div>
      <Header title="로그인" showBack />
      <div className="p-4 pt-18 space-y-5">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <Input
          label="이메일"
          type="email"
          placeholder="example@email.com"
          value={email}
          onChange={setEmail}
        />

        <Input
          label="비밀번호"
          type="password"
          placeholder="비밀번호를 입력하세요"
          value={password}
          onChange={setPassword}
        />

        <Button fullWidth disabled={!isValid || loading} onClick={handleSubmit}>
          {loading ? '로그인 중...' : '로그인'}
        </Button>

        <p className="text-center text-sm text-gray-500">
          계정이 없으신가요?{' '}
          <Link to="/signup" className="text-blue-600 font-medium">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
