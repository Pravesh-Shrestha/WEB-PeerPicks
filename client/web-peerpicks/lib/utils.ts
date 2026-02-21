export const getMediaUrl = (path: string | null | undefined, type: 'profilePicture' | 'pick' = 'pick'): string => {
  if (!path) return type === 'profilePicture' ? "/default-avatar.png" : "/placeholder-pick.png"; 
  if (path.startsWith('http')) return path;

  // Use the root Backend Port for static files
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'; 
  
  let cleanPath = path.startsWith('/') ? path : `/${path}`;

  // 1. If it's a pick and doesn't already have the subfolder, add it
  if (type === 'pick' && !cleanPath.includes('/picks/')) {
      cleanPath = `/picks${cleanPath}`;
  }

  // 2. Ensure the whole thing is prefixed with /uploads as per your app.ts
  if (!cleanPath.startsWith('/uploads')) {
      cleanPath = `/uploads${cleanPath}`;
  }
  
  return `${baseUrl}${cleanPath}`;
};