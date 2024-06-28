import Projector from './components/Projector';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
          Embedding Projector
        </h1>
        <Projector />
      </div>
    </main>
  );
}
