import { Lusitana } from 'next/font/google';

// Provides a `className` you can use in components like `lusitana.className`.
// Next.js will optimize this Google font automatically.
export const lusitana = Lusitana({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
});

export default lusitana;
