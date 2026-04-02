import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const currentUserId = user.id

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, charities(*)')
    .eq('id', currentUserId)
    .single()

  const { data: scores } = await supabase
    .from('scores')
    .select('*')
    .eq('user_id', currentUserId)
    .order('played_date', { ascending: false })
    .limit(5)

  const { data: nextDraw } = await supabase
    .from('draws')
    .select('*')
    .eq('status', 'pending')
    .order('draw_date', { ascending: true })
    .limit(1)
    .single()

  const { data: winners } = await supabase
    .from('winners')
    .select('*')
    .eq('user_id', currentUserId)

  const { data: recentDraws } = await supabase
    .from('draws')
    .select('*')
    .eq('status', 'published')
    .order('draw_date', { ascending: false })
    .limit(3)

  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('*, charities(*)')
    .eq('user_id', currentUserId)
    .eq('status', 'active')

  const totalWon = winners?.reduce((acc: any, w: any) => acc + Number(w.prize_amount), 0) || 0

  return (
    <DashboardClient
      profile={profile}
      subscriptions={subscriptions || []}
      scores={scores || []}
      nextDraw={nextDraw}
      recentDraws={recentDraws || []}
      totalWon={totalWon}
      winnerCount={winners?.length || 0}
    />
  )
}
