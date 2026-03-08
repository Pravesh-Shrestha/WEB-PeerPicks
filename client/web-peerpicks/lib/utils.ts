export const getMediaUrl = (path: string | null | undefined, type: 'profilePicture' | 'pick' = 'pick'): string => {
  if (!path) return type === 'profilePicture' ? "/default-avatar.png" : "/placeholder-pick.png"; 
  if (path.startsWith('http')) return path;

  // Legacy assets stored on backend disk still live under /uploads
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    'http://localhost:3000';
  const baseUrl = rawBaseUrl.replace(/\/$/, '');

  // Already-rooted path
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // Legacy pick assets sometimes omit /uploads; patch it in if needed
  if (cleanPath.startsWith('/uploads')) return `${baseUrl}${cleanPath}`;
  if (type === 'pick' && cleanPath.startsWith('/picks')) return `${baseUrl}/uploads${cleanPath}`;

  // Fallback: treat as backend-relative
  return `${baseUrl}${cleanPath}`;
};