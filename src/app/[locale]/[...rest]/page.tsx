import { notFound } from 'next/navigation';

// Unknown paths inside a locale get the localized 404 (./not-found.tsx)
// rather than the bare global one.
export default function CatchAll() {
  notFound();
}
