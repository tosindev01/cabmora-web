import { ResetPasswordScreen } from '@/features/auth/components';

/** Route component. The screen does the work; this exists so `router.tsx`
 *  imports a page and nothing else imports a screen. */
export default function ResetPasswordPage() {
  return <ResetPasswordScreen />;
}
