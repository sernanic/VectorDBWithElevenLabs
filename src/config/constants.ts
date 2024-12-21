// Admin email addresses that have edit permissions
export const ADMIN_EMAILS = [
  'sernanic100@gmail.com',
  // Add other admin emails here
] as const;

export const isAdminEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email as any);
};

// Add other constants as needed
