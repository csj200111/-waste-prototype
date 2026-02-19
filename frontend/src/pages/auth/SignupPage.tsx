import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/features/auth/AuthContext';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordMatch = password === passwordConfirm;
  const isValid = email.trim() && password.length >= 4 && passwordMatch && passwordConfirm.length > 0 && nickname.trim().length >= 2;

  const handleSubmit = async () => {
    if (!isValid) return;
    setError('');
    setLoading(true);
    try {
      await signup({ email: email.trim(), password, nickname: nickname.trim() });
      navigate('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : '회원가입에 실패했습니다');
      setLoading(false);
    }
  };

  return (
    <div>
      <Header title="회원가입" showBack />
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
          placeholder="4자 이상 입력하세요"
          value={password}
          onChange={setPassword}
        />

        <Input
          label="비밀번호 확인"
          type="password"
          placeholder="비밀번호를 다시 입력하세요"
          value={passwordConfirm}
          onChange={setPasswordConfirm}
          error={passwordConfirm.length > 0 && !passwordMatch ? '비밀번호가 일치하지 않습니다' : undefined}
        />

        <Input
          label="닉네임"
          placeholder="2~20자로 입력하세요"
          value={nickname}
          onChange={setNickname}
        />

        <Button fullWidth disabled={!isValid || loading} onClick={handleSubmit}>
          {loading ? '가입 중...' : '회원가입'}
        </Button>

        <p className="text-center text-sm text-gray-500">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="text-blue-600 font-medium">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
