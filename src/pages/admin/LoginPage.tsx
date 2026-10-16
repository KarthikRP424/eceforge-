import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-hot-toast';

type LoginForm = {
  email: string;
  password: string;
};

export default function AdminLoginPage() {
  const { login, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.password);
      // redirect to admin dashboard or where attempted
      const redirect = (location.state as any)?.from?.pathname || '/admin';
      navigate(redirect, { replace: true });
    } catch (e: any) {
      toast.error(e.message ?? 'Login failed');
    }
  };

  // If already admin, redirect automatically
  React.useEffect(() => {
    if (isAdmin) navigate('/admin', { replace: true });
  }, [isAdmin, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-navy-900">
            Admin Sign In
          </h2>
          <p className="mt-2 text-center text-sm text-navy-600">
            Access the administration dashboard for ECEForge.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Email"
            type="email"
            placeholder="admin@example.com"
            {...register('email', { required: 'Email required' })}
            error={errors.email?.message}
          />
          <Input
            label="Password"
            type="password"
            placeholder="******"
            {...register('password', { required: 'Password required' })}
            error={errors.password?.message}
          />
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            className="w-full"
          >
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}
