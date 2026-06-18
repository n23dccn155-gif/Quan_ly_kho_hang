import Link from 'next/link';

/** SSG: trang tĩnh, build-time — không cần auth */
export const metadata = {
  title: 'Giới thiệu hệ thống | WMS Logistics',
  description:
    'Hệ thống quản lý kho WMS (Warehouse Management System) — Xây dựng bằng Next.js 14 App Router, Express, PostgreSQL (Neon), Prisma. Đồ án INT1334 PTIT TP.HCM.',
  keywords: [
    'WMS', 'quản lý kho', 'warehouse management', 'logistics',
    'Next.js', 'PTIT', 'INT1334', 'đồ án lập trình web'
  ],
  openGraph: {
    title: 'WMS Logistics — Hệ thống Quản lý Kho Thông Minh',
    description: 'Ứng dụng quản lý kho với QR Code, bản đồ Leaflet, Gemini AI gợi ý nhập hàng, cảnh báo email.',
    type: 'website',
    locale: 'vi_VN',
    siteName: 'WMS Logistics INT1334',
  },
  twitter: {
    card: 'summary',
    title: 'WMS Logistics — Quản lý Kho',
    description: 'Hệ thống quản lý kho fullstack — Next.js + Express + PostgreSQL',
  },
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="mt-2 text-4xl font-bold">Hệ thống Quản lý Kho thông minh (WMS)</h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
          Ứng dụng fullstack quản lý nhập xuất, tồn kho, cảnh báo và đề xuất bổ sung hàng cho chuỗi
          cung ứng.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/login"
            className="rounded-xl bg-cyan-600 px-6 py-3 font-semibold text-white hover:bg-cyan-700"
          >
            Đăng nhập hệ thống
          </Link>
          <Link
            href="/dashboard"
            className="rounded-xl border border-slate-300 px-6 py-3 font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Vào Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
