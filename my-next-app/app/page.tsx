import Counter from '@/components/Counter';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">My First Next.js App</h1>
      <h2 className="text-2xl mb-4">How fast does it update?</h2>
      <Counter />
    </main>
  );
}