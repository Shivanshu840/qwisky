"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, Volume2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface VoiceMessageProps {
  audioUrl: string
  duration: number
  timestamp: string
  isOwn?: boolean
}

export function VoiceMessage({ audioUrl, duration, timestamp, isOwn = false }: VoiceMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [audioDuration, setAudioDuration] = useState(duration)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setAudioDuration(audio.duration)
    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    audio.addEventListener("timeupdate", updateTime)
    audio.addEventListener("loadedmetadata", updateDuration)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("timeupdate", updateTime)
      audio.removeEventListener("loadedmetadata", updateDuration)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [])

  const togglePlayback = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const progressPercentage = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0

  return (
    <div
      className={`flex items-center space-x-3 p-3 rounded-lg max-w-xs ${
        isOwn
          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white ml-auto"
          : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
      }`}
    >
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <Button
        variant="ghost"
        size="sm"
        onClick={togglePlayback}
        className={`h-8 w-8 p-0 rounded-full ${
          isOwn ? "hover:bg-white/20 text-white" : "hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <Volume2 className="h-3 w-3 opacity-70" />
          <span className="text-xs opacity-70">Voice message</span>
        </div>

        <div className="relative">
          <div className={`h-1 rounded-full ${isOwn ? "bg-white/30" : "bg-gray-200 dark:bg-gray-600"}`}>
            <div
              className={`h-full rounded-full transition-all duration-100 ${isOwn ? "bg-white" : "bg-blue-500"}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="flex justify-between items-center mt-1">
          <span className="text-xs opacity-70">
            {formatTime(currentTime)} / {formatTime(audioDuration)}
          </span>
          <span className="text-xs opacity-70">{formatDistanceToNow(new Date(timestamp), { addSuffix: true })}</span>
        </div>
      </div>
    </div>
  )
}
