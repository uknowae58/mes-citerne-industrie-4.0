import { createClient as createClientBrowser } from '@/utils/supabase/client';

export type OPCUAData = {
  id: number;
  timestamp: string;
  values: {
    start: boolean;
    setpoint: number;
    factory_io: string;
    flow_meter: number;
    stop_light: boolean;
    level_meter: number;
    reset_light: boolean;
    start_light: boolean;
  };
};

// Client-side fetch function
export async function fetchLatestOPCUAData() {
  const supabase = createClientBrowser();
  
  try {
    // First verify the table exists by checking its structure
    const { data: tableInfo, error: tableError } = await supabase
      .from('opcua_data')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('Error checking table (client):', tableError);
      throw new Error(`Database table access error: ${tableError.message}`);
    }

    // If we get here, the table exists, proceed with the actual query
    const { data, error } = await supabase
      .from('opcua_data')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // This is the error when no rows are returned for .single()
        console.warn('No data found in opcua_data table (client)');
        throw new Error('No data found in database');
      } else {
        console.error('Error fetching OPCUA data (client):', error);
        throw error;
      }
    }

    if (!data) {
      throw new Error('No data returned but no error reported');
    }

    console.log('Client-side fetch successful:', data);
    return data as OPCUAData;
  } catch (error) {
    console.error('Error in fetchLatestOPCUAData (client):', error);
    throw error;
  }
}

// Subscription function (client-side only)
export function subscribeToOPCUAData(callback: (data: OPCUAData) => void) {
  const supabase = createClientBrowser();
  
  try {
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
  } catch (error) {
    console.error('Error setting up subscription:', error);
    // Return a dummy unsubscribe function
    return () => {};
  }
} 