import React from 'react';

const AuthButtons = () => {
  return (
    <div className="flex items-center gap-3">
      <a
        href="https://app.mobiwork.com/login"
        className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        Log in
      </a>
      <a
        href="https://app.mobiwork.com/signup"
        className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        Sign up
      </a>
    </div>
  );
};

export default AuthButtons;
