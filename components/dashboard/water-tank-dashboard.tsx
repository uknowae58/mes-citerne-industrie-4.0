'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Droplet, 
  Activity, 
  Power, 
  RefreshCw, 
  Settings, 
  PlayCircle, 
  StopCircle,
  Database,
  AlertTriangle,
  Waves,
  Bug,
  X
} from 'lucide-react'
import { fetchLatestOPCUAData, subscribeToOPCUAData, type OPCUAData } from '@/lib/actions/opcua-data'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

interface WaterTankDashboardProps {
  initialData: OPCUAData | null
}

export default function WaterTankDashboard({ initialData }: WaterTankDashboardProps) {
  // State for all the variables
  const [tankLevel, setTankLevel] = useState(initialData?.values.level_meter ?? 0)
  const [flowRate, setFlowRate] = useState(initialData?.values.flow_meter ?? 0)
  const [setPoint, setSetPoint] = useState(initialData?.values.setpoint ?? 0)
  const [isStarted, setIsStarted] = useState(initialData?.values.start ?? false)
  const [startLight, setStartLight] = useState(initialData?.values.start_light ?? false)
  const [stopLight, setStopLight] = useState(initialData?.values.stop_light ?? false)
  const [resetLight, setResetLight] = useState(Number(initialData?.values.reset_light ?? 0) > 0)
  const [dataValue, setDataValue] = useState('127.0.0.1')
  const [lastUpdated, setLastUpdated] = useState<string | null>(initialData?.timestamp ?? null)
  
  // Debug states
  const [showDebug, setShowDebug] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [dataSource, setDataSource] = useState<'server' | 'client' | 'none'>(
    initialData ? 'server' : 'none'
  )
  const [responseDetails, setResponseDetails] = useState<any>(null)

  // Fetch initial data and set up real-time subscription
  useEffect(() => {
    if (!initialData) {
      // If no initialData was provided from the server, fetch it client-side
      setDataSource('none') // Reset while loading
      
    fetchLatestOPCUAData()
      .then(data => {
        updateStateFromData(data)
          setLastUpdated(data.timestamp)
          setDataSource('client')
          setFetchError(null)
          setResponseDetails({ id: data.id, timestamp: data.timestamp })
          console.log("Client-side data fetch successful:", data)
      })
      .catch(error => {
        console.error('Error fetching initial data:', error)
          setFetchError(error.message || "Failed to fetch data from client")
        toast.error('Failed to fetch initial data')
      })
    } else {
      console.log("Using server-provided data:", initialData)
      setResponseDetails({ id: initialData.id, timestamp: initialData.timestamp })
    }

    // Set up real-time subscription
    const unsubscribe = subscribeToOPCUAData(data => {
      updateStateFromData(data)
      setLastUpdated(data.timestamp)
      toast.info('New data received', { duration: 2000 })
    })

    // Cleanup subscription on unmount
    return () => {
      unsubscribe()
    }
  }, [initialData])

  // Helper function to update state from OPCUA data
  const updateStateFromData = (data: OPCUAData) => {
    if (!data || !data.values) {
      console.error("Invalid data received:", data)
      return
    }
    
    setTankLevel(data.values.level_meter ?? 0)
    setFlowRate(data.values.flow_meter ?? 0)
    setSetPoint(data.values.setpoint ?? 0)
    setIsStarted(data.values.start ?? false)
    setStartLight(data.values.start_light ?? false)
    setStopLight(data.values.stop_light ?? false)
    setResetLight(Number(data.values.reset_light ?? 0) > 0)
  }

  // Calculate status based on tank level
  const getTankStatus = () => {
    if (tankLevel > 90) return { status: 'High', color: 'text-destructive', icon: <AlertTriangle className="h-4 w-4" /> }
    if (tankLevel < 20) return { status: 'Low', color: 'text-destructive', icon: <AlertTriangle className="h-4 w-4" /> }
    return { status: 'Normal', color: 'text-primary', icon: <Droplet className="h-4 w-4" /> }
  }

  const tankStatus = getTankStatus()

  // Manual refresh function
  const handleManualRefresh = async () => {
    try {
      const data = await fetchLatestOPCUAData()
      updateStateFromData(data)
      setLastUpdated(data.timestamp)
      setDataSource('client')
      setFetchError(null)
      toast.success('Data refreshed successfully')
    } catch (error: any) {
      console.error('Error refreshing data:', error)
      setFetchError(error.message || "Failed to refresh data")
      toast.error('Failed to refresh data')
    }
  }

  // Test direct Supabase connection
  const testDirectSupabase = async () => {
    try {
      setFetchError(null)
      toast.info('Testing direct Supabase connection...')
      
      const supabase = createClient()
      const { data, error } = await supabase
        .from('opcua_data')
        .select('*')
        .limit(5)
      
      if (error) {
        setFetchError(`Direct Supabase error: ${error.message}`)
        toast.error('Direct Supabase connection failed')
        console.error('Direct Supabase error:', error)
        return
      }
      
      setResponseDetails({
        directTest: true,
        numRows: data?.length || 0,
        firstRow: data && data.length > 0 ? data[0].id : null,
        message: 'Direct Supabase query successful'
      })
      
      toast.success(`Found ${data?.length || 0} rows in opcua_data table`)
      console.log('Direct Supabase data:', data)
    } catch (error: any) {
      setFetchError(`Direct test error: ${error.message}`)
      toast.error('Direct test failed')
      console.error('Direct test error:', error)
    }
  }

  return (
    <>
      {/* Debug panel */}
      {showDebug && (
        <Card className="mb-6 border-yellow-500 bg-yellow-500/10">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bug className="h-5 w-5 text-yellow-500" />
                <span>Debug Information</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowDebug(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-semibold">Data Source:</span> {dataSource}
              </div>
              <div>
                <span className="font-semibold">Initial Data:</span> {initialData ? 'Provided' : 'Not provided'} 
              </div>
              <div>
                <span className="font-semibold">Last Updated:</span> {lastUpdated ? new Date(lastUpdated).toLocaleString() : 'Never'} 
              </div>
              {responseDetails && (
                <div>
                  <span className="font-semibold">Response ID:</span> {responseDetails.id || 'N/A'}
                </div>
              )}
              {fetchError && (
                <div className="text-destructive">
                  <span className="font-semibold">Fetch Error:</span> {fetchError}
                </div>
              )}
              <div className="mt-2 flex gap-2">
                <Button variant="outline" size="sm" onClick={handleManualRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>
                <Button variant="outline" size="sm" onClick={testDirectSupabase}>
                  <Database className="h-4 w-4 mr-2" />
                  Test Direct DB
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Show debug toggle button */}
        <div className="md:col-span-12 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDebug(!showDebug)}
            className="flex items-center gap-1"
          >
            <Bug className="h-4 w-4" />
            {showDebug ? 'Hide Debug Info' : 'Show Debug Info'}
          </Button>
        </div>

      {/* Main Tank Level Card */}
      <Card className="md:col-span-7 shadow-md border border-border overflow-hidden">
        <CardHeader className="pb-2 bg-card">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplet className="h-5 w-5 text-primary" />
              <span>Water Tank Level</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-normal">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${tankStatus.color} bg-muted text-xs font-medium`}>
                {tankStatus.icon}
                {tankStatus.status}
              </span>
                {lastUpdated && (
                  <span className="text-xs text-muted-foreground">
                    Mis à jour: {new Date(lastUpdated).toLocaleString('fr-FR')}
                  </span>
                )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="relative h-80 w-full rounded-lg overflow-hidden border border-border bg-background/30">
              {/* Background grid pattern */}
              <div className="absolute inset-0 grid grid-cols-4 grid-rows-5">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="border-t border-l border-border/30"></div>
                ))}
              </div>
              
              {/* Water Fill Animation with wave effect */}
              <div 
                className="absolute bottom-0 w-full bg-gradient-to-b from-primary/70 to-primary transition-all duration-1000 ease-in-out overflow-hidden"
                style={{ height: `${tankLevel}%` }}
              >
                {/* Water surface shimmer effect */}
                <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-b from-primary-foreground/40 to-transparent animate-pulse"></div>
                
                {/* Multiple wave layers for more realistic effect */}
                <div className="absolute -top-2 left-0 w-full">
                  <div className="relative">
                    {/* First wave - slower, larger */}
                    <svg className="w-full h-4 text-primary animate-[wave1_8s_linear_infinite]" viewBox="0 0 1200 120" preserveAspectRatio="none">
                      <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="currentColor" opacity=".25"></path>
                    </svg>
                    
                    {/* Second wave - medium speed, different phase */}
                    <svg className="w-full h-3 text-primary-foreground absolute top-0 left-0 animate-[wave2_6s_linear_infinite]" viewBox="0 0 1200 120" preserveAspectRatio="none">
                      <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".4" fill="currentColor"></path>
                    </svg>
                    
                    {/* Third wave - fastest, smaller */}
                    <svg className="w-full h-3 text-primary absolute top-0 left-0 animate-[wave3_4s_linear_infinite]" viewBox="0 0 1200 120" preserveAspectRatio="none">
                      <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="currentColor" opacity=".3"></path>
                    </svg>
                  </div>
                </div>
                
                {/* Animated bubbles for realism */}
                <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
                  <div className="bubble-small animate-[bubble1_15s_ease-in_infinite]"></div>
                  <div className="bubble-medium animate-[bubble2_12s_ease-in_infinite_2s]"></div>
                  <div className="bubble-small animate-[bubble3_20s_ease-in_infinite_5s]"></div>
                  <div className="bubble-large animate-[bubble4_18s_ease-in_infinite_1s]"></div>
                  <div className="bubble-medium animate-[bubble5_14s_ease-in_infinite_3s]"></div>
                </div>
                
                {/* Light reflection effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-foreground/10 to-transparent pointer-events-none" aria-hidden="true"></div>
              </div>
              
              {/* Level Indicator Line */}
              <div 
                className="absolute w-full border-t-2 border-dashed border-accent-foreground transition-all duration-1000"
                style={{ bottom: `${setPoint}%` }}
              >
                <div className="absolute -top-6 right-2 px-2 py-1 rounded bg-card/90 shadow-sm border border-border">
                  <span className="text-sm font-medium">Set Point: {setPoint}%</span>
                </div>
              </div>
              
              {/* Scale markers */}
              <div className="absolute inset-y-0 right-0 w-10 flex flex-col justify-between py-2 pr-2">
                {[0, 25, 50, 75, 100].reverse().map(value => (
                  <div key={value} className="flex items-center gap-1">
                    <div className="h-px w-3 bg-border"></div>
                    <span className="text-xs text-muted-foreground">{value}</span>
                  </div>
                ))}
              </div>
              
              {/* Current Level Display */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-background/90 px-6 py-4 rounded-lg shadow-md border border-border">
                  <span className="text-4xl font-bold text-primary">{tankLevel.toFixed(1)}%</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mt-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Current Level</span>
                  <span className="text-sm font-semibold">{tankLevel.toFixed(1)}%</span>
                </div>
                <Progress value={tankLevel} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Set Point</span>
                  <span className="text-sm font-semibold">{setPoint}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={setPoint}
                  onChange={(e) => setSetPoint(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Right column for controls and status */}
      <div className="md:col-span-5 flex flex-col gap-6">
        {/* Flow Rate Card */}
        <Card className="shadow-md border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Waves className="h-5 w-5 text-primary" />
              <span>Flow Parameters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {/* Flow Meter with gauge visualization */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Flow Rate</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-2xl font-bold">{flowRate.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">L/min</span>
                  </div>
                </div>
                
                {/* Linear gauge instead of semi-circular */}
                <div className="relative h-24 w-full mt-3 border border-border rounded-md bg-muted/50">
                  {/* Gauge background */}
                  <div className="absolute inset-0 p-4">
                    {/* Gauge markers */}
                    <div className="relative h-full flex flex-col justify-between">
                      {[0, 25, 50, 75, 100].reverse().map(mark => (
                        <div key={mark} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="w-2 h-px bg-border"></div>
                          <span>{mark}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Gauge intervals - horizontal lines */}
                    <div className="absolute inset-0">
                      {[20, 40, 60, 80].map(level => (
                        <div 
                          key={level} 
                          className="absolute w-full h-px bg-border/50" 
                          style={{ top: `${100 - level}%` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Active fill */}
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-primary/20 transition-all duration-500"
                    style={{ height: `${flowRate}%` }}
                  >
                    <div className="absolute inset-x-0 top-0 h-1 bg-primary"></div>
                  </div>
                  
                  {/* Indicator line */}
                  <div 
                    className="absolute left-0 right-0 h-0.5 bg-destructive z-10 transition-all duration-500"
                    style={{ top: `${100 - flowRate}%` }}
                  >
                    <div className="absolute right-0 -top-1.5 -translate-y-1/2 px-1.5 py-0.5 bg-card text-xs border border-destructive rounded text-destructive font-medium">
                      {flowRate.toFixed(1)}
                    </div>
                    <div className="absolute -right-1 -translate-y-1/2 h-3 w-3 bg-destructive rounded-sm"></div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Data Value */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Data_X</span>
                </div>
                <span className="font-mono text-sm bg-muted px-2 py-1 rounded border border-border">
                  {dataValue}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controls Card */}
        <Card className="shadow-md border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <span>Controls</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {/* Indicator Lights */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg border border-border">
                <div className="flex flex-col items-center">
                  <div className={`h-8 w-8 rounded-full border-2 ${startLight ? 'bg-primary border-primary/30 shadow-[0_0_10px_rgba(var(--primary),0.5)]' : 'bg-muted-foreground/20 border-border'} flex items-center justify-center`}>
                    <div className={`h-4 w-4 rounded-full ${startLight ? 'bg-primary animate-pulse' : 'bg-muted-foreground/30'}`} />
                  </div>
                  <span className="text-xs mt-1 font-medium">Start</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className={`h-8 w-8 rounded-full border-2 ${stopLight ? 'bg-destructive border-destructive/30 shadow-[0_0_10px_rgba(var(--destructive),0.5)]' : 'bg-muted-foreground/20 border-border'} flex items-center justify-center`}>
                    <div className={`h-4 w-4 rounded-full ${stopLight ? 'bg-destructive animate-pulse' : 'bg-muted-foreground/30'}`} />
                  </div>
                  <span className="text-xs mt-1 font-medium">Stop</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className={`h-8 w-8 rounded-full border-2 ${resetLight ? 'bg-yellow-500 border-yellow-300 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'bg-muted-foreground/20 border-border'} flex items-center justify-center`}>
                    <div className={`h-4 w-4 rounded-full ${resetLight ? 'bg-yellow-500 animate-pulse' : 'bg-muted-foreground/30'}`} />
                  </div>
                  <span className="text-xs mt-1 font-medium">Reset</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  )
} 