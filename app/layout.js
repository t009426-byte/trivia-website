import { Cairo } from 'next/font/google'
import './globals.css'

const cairo = Cairo({
  subsets:  ['arabic', 'latin'],
  weight:   ['400', '600', '700', '800', '900'],
  variable: '--font-cairo',
  display:  'swap',
})

export const metadata = {
  title:       '🧠 جنون مسابقة المعرفة!',
  description: 'أكثر مسابقة معرفية مجنونة في العالم',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body>{children}</body>
    </html>
  )
}
