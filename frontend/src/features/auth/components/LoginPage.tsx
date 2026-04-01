import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err: any) {
      setError('root', { message: err.response?.data?.message || 'Login failed' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">HOA Management System</h1>
        <form onSubmit={handleSubmit(onSubmit)} data-testid="login-form" className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input data-testid="login-email-input" type="email" {...register('email')} className="w-full border rounded px-3 py-2" />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input data-testid="login-password-input" type="password" {...register('password')} className="w-full border rounded px-3 py-2" />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>
          {errors.root && <p className="text-red-500 text-sm">{errors.root.message}</p>}
          <button data-testid="login-submit-button" type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50">
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
          <div className="text-center text-sm">
            <Link to="/forgot-password" className="text-blue-600 hover:underline">Forgot password?</Link>
            {' · '}
            <Link to="/register" className="text-blue-600 hover:underline">Create account</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
