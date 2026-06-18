'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';

export default function AuthProvider({ children }) {
  const initialize = useAuthStore((state) => state.initialize);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initialize();
    setMounted(true);
  }, [initialize]);

  // Bỏ đoạn return "Đang tải cấu hình..." để Next.js có thể render HTML trên server (SSR/SSG).
  // Việc bảo vệ route (nếu chưa login) đã có middleware và layout xử lý.

  return children;
}
