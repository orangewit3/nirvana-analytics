import { HealthForm } from '@/components/health-form'

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Personal Health Analytics
      </h1>
      <HealthForm />
    </main>
  )
}
