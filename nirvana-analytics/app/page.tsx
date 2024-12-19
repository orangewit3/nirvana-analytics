import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getHealthAnalysis } from '@/lib/db'
import { HealthForm } from '@/components/health-form'

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const session = await getServerSession(authOptions)
  
  // If user is not logged in, redirect to login page
  if (!session?.user?.id) {
    redirect('/login')
  }

  // Only check for existing analysis if not explicitly starting new
  if (!searchParams.new) {
    // Check for existing analysis
    const existingAnalysis = await getHealthAnalysis(session.user.id)
    
    // If analysis exists, redirect to results page
    if (existingAnalysis) {
      redirect(`/results?userId=${session.user.id}`)
    }
  }

  // Show the form for new analysis
  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Personal Health Analytics
      </h1>
      <HealthForm />
    </main>
  )
}
