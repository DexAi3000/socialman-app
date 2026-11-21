import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'سوشال‌من | سوپراپلیکیشن مدیریت شبکه‌های اجتماعی',
    short_name: 'Social Man',
    description: 'سامانه مدیریت، تقویم و انتشار یکپارچه در ۵ پلتفرم اینستاگرام، تلگرام، روبیکا، بله و واتساپ',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3b96cc',
    orientation: 'portrait',
    lang: 'fa',
    dir: 'rtl',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
