import { createClient } from '@/utils/supabase/client';

export type OPCUAData = {
  id: number;
  timestamp: string;
  values: {
    start: boolean;
    setpoint: number;
    'FACTORYI/O': boolean;
    flow_meter: number;
    stop_light: boolean;
    'level-meter': number;
    reset_light: number;
    start_light: boolean;
  };
};

export async function fetchLatestOPCUAData() {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('opcua_data')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching OPCUA data:', error);
    throw error;
  }

  return data as OPCUAData;
}

export function subscribeToOPCUAData(callback: (data: OPCUAData) => void) {
  const supabase = createClient();
  
  const subscription = supabase
    .channel('opcua_data_changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'opcua_data',
      },
      (payload) => {
        callback(payload.new as OPCUAData);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
} 