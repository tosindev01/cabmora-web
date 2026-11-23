import { useState } from 'react';
import { Link } from 'react-router-dom';
import LogoWhite from '@/assets/cabmora_white_logo.svg';

import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm';
import { SignInForm } from '@/features/auth/components/SignInForm';

/**
 * Shell for the client-portal entry screen: logo, editorial left panel, and
 * whichever of the two forms is active.
 *
 * The forms own their own state and submission; this component only decides
 * which one is on screen.
 */
export function LoginScreen() {
  const [mode, setMode] = useState<'login' | 'forgot'>('login');

  return (
    <div className="min-h-screen bg-noir flex text-canvas overflow-hidden relative">
      {/* Desktop logo overlay */}
      <Link to="/" className="hidden lg:block lg:absolute lg:top-12 lg:left-12 lg:z-50">
        <img
          src={LogoWhite}
          alt="Cabmora"
          className="h-[56px] sm:h-[64px] w-auto object-contain hover:opacity-80 transition-opacity duration-300"
        />
      </Link>

      {/* Left image */}
      <div className="hidden lg:block lg:w-[45%] relative">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1920&h=1200&fit=crop&auto=format"
            alt="Cinematic wedding moment"
            className="w-full h-full object-cover object-center opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-noir" />
          <div className="absolute inset-0 bg-gradient-to-t from-noir via-transparent to-transparent" />
        </div>

        <div className="absolute bottom-16 left-14 max-w-[320px]">
          <div className="w-8 h-px bg-gold mb-6" />
          <p className="font-serif text-[24px] font-normal leading-[1.3] text-canvas mb-4">
            "Cabmora preserved our memories with a cinematic elegance we will cherish forever."
          </p>
          <span className="text-[10px] tracking-[0.2em] uppercase text-gold font-medium">
            Elena &amp; Marco
          </span>
        </div>
      </div>

      {/* Right form */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-16 relative">
        <div className="max-w-[420px] w-full mx-auto lg:mx-0 lg:ml-12">
          {/* Mobile logo */}
          <div className="lg:hidden mb-12 sm:mb-14">
            <Link to="/" className="inline-block">
              <img
                src={LogoWhite}
                alt="Cabmora"
                className="h-[56px] sm:h-[64px] w-auto object-contain hover:opacity-85 transition-opacity duration-300"
              />
            </Link>
          </div>

          {mode === 'login' ? (
            <SignInForm onForgotPassword={() => setMode('forgot')} />
          ) : (
            <ForgotPasswordForm onBack={() => setMode('login')} />
          )}
        </div>
      </div>
    </div>
  );
}
