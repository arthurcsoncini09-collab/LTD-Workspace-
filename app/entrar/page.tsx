import { Suspense } from 'react';
import { AuthForm } from '@/components/auth-form';

export const metadata = { title: 'Entrar | NetLearn' };

export default function EntrarPage() {
  return (
    <div className="py-6">
      <Suspense>
        <AuthForm />
      </Suspense>
    </div>
  );
}
