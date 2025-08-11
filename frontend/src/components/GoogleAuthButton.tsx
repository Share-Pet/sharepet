import React, { useEffect, useRef, useState } from 'react';

declare global { interface Window { google: any } }

export function GoogleAuthButton({
  onSuccess,
  onError,
  disabled = false
}: {
  onSuccess: (data: any) => void;
  onError?: (err: any) => void;
  disabled?: boolean;
}) {
  const [ready, setReady] = useState(false);
  const initOnce = useRef(false);

  useEffect(() => {
    const src = 'https://accounts.google.com/gsi/client';
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);

    const onLoad = () => {
      if (initOnce.current || !window.google) return;
      initOnce.current = true;

      try {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "775367947870-4hfpa81l09s190kpjhhikcau5n4g6mc9.apps.googleusercontent.com", // or your string
          callback: handleGoogleResponse,
          use_fedcm_for_prompt: true,
          context: 'signin',
          itp_support: true,               // helps with ITP browsers
          cancel_on_tap_outside: true,
        });
        setReady(true);
      } catch (e) {
        onError?.(e);
      }
    };

    if (existing) {
      if (existing.getAttribute('data-loaded') === 'true') onLoad();
      else existing.addEventListener('load', onLoad, { once: true });
    } else {
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.defer = true;
      s.addEventListener('load', () => {
        s.setAttribute('data-loaded', 'true');
        onLoad();
      }, { once: true });
      s.addEventListener('error', () => onError?.('Failed to load Google script'), { once: true });
      document.head.appendChild(s);
    }

    return () => {
      // cancel any active prompt when unmounting
      window.google?.accounts.id.cancel();
    };
  }, []);

  const handleGoogleResponse = (resp: any) => {
    try {
      const payload = decodeJWT(resp.credential);
      onSuccess({
        google_id: payload.sub,
        email: payload.email,
        name: payload.name,
        profile_image: payload.picture,
      });
      // NOTE: also send resp.credential to your backend to verify the ID token server-side.
    } catch (e) {
      onError?.(e);
    }
  };

  const decodeJWT = (token: string) => {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(atob(base64).split('').map(c =>
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join('')));
  };

  const handleClick = () => {
    if (!ready || disabled) return;
    try {
      // show the FedCM / One Tap account chooser
      window.google.accounts.id.prompt();
    } catch (e) {
      onError?.(e);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || !ready}
      className="w-full bg-white border-2 border-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
    >
      {/* … your SVG … */}
      {disabled ? 'Signing in…' : 'Continue with Google'}
    </button>
  );
}
