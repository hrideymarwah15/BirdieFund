import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type TableName = 'profiles' | 'scores' | 'draws' | 'winnings' | 'charities' | 'subscriptions'

export function useRealtimeSubscription(
  table: TableName,
  onUpdate: (payload: any) => void,
  filter?: string
) {
  const supabase = createClient()

  useEffect(() => {
    let channelName = `public:${table}`
    if (filter) {
      channelName += `:${filter}`
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          filter: filter,
        },
        (payload) => {
          onUpdate(payload)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, filter, onUpdate, supabase])
}
