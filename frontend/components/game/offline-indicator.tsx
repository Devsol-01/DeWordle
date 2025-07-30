"use client"

import { useOfflineStatus } from "@/hooks/use-offline-status"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, AlertTriangle, CheckCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { offlineStorage } from "@/lib/offline-storage"

export function OfflineIndicator() {
  const { isOnline, wasOffline } = useOfflineStatus()
  const [storageInfo, setStorageInfo] = useState<any>(null)
  const [showSyncSuccess, setShowSyncSuccess] = useState(false)

  useEffect(() => {
    setStorageInfo(offlineStorage.getStorageInfo())
  }, [])

  useEffect(() => {
    const handleNetworkRestored = () => {
      setShowSyncSuccess(true)
      setTimeout(() => setShowSyncSuccess(false), 3000)
    }

    window.addEventListener("network-restored", handleNetworkRestored)
    return () => window.removeEventListener("network-restored", handleNetworkRestored)
  }, [])

  if (showSyncSuccess) {
    return (
      <Alert className="mb-4 border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Back online! Your offline progress has been synced.
        </AlertDescription>
      </Alert>
    )
  }

  if (!isOnline) {
    return (
      <Alert className="mb-4 border-orange-200 bg-orange-50">
        <WifiOff className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <div className="flex items-center justify-between">
            <span>Playing offline mode</span>
            <Badge variant="outline" className="ml-2">
              {storageInfo?.cachedWords || 0} words cached
            </Badge>
          </div>
          <p className="text-sm mt-1 text-orange-700">
            Limited word selection available. Progress will sync when back online.
          </p>
        </AlertDescription>
      </Alert>
    )
  }

  if (wasOffline && storageInfo?.unsyncedResults > 0) {
    return (
      <Alert className="mb-4 border-blue-200 bg-blue-50">
        <AlertTriangle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <div className="flex items-center justify-between">
            <span>Syncing offline progress...</span>
            <Badge variant="outline" className="ml-2">
              {storageInfo.unsyncedResults} games pending
            </Badge>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="flex items-center gap-2 mb-4">
      <Badge variant="outline" className="text-green-700 border-green-200">
        <Wifi className="h-3 w-3 mr-1" />
        Online
      </Badge>
    </div>
  )
}
