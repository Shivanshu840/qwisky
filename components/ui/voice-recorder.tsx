"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Send, X, Play } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface VoiceRecorderProps {
  onVoiceMessage: (audioBlob: Blob, duration: number) => void
}

export function VoiceRecorder({ onVoiceMessage }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const { toast } = useToast()

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      })

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      })
      mediaRecorderRef.current = mediaRecorder

      const chunks: BlobPart[] = []
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm;codecs=opus" })
        const url = URL.createObjectURL(blob)
        setAudioBlob(blob)
        setAudioUrl(url)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start(100) // Collect data every 100ms
      setIsRecording(true)
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("Error accessing microphone:", error)
      toast({
        title: "Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setRecordingTime(0)
      setAudioBlob(null)
      setAudioUrl(null)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    } else if (audioBlob) {
      setAudioBlob(null)
      setAudioUrl(null)
      setRecordingTime(0)
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }

  const playPreview = () => {
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const sendVoiceMessage = () => {
    if (audioBlob) {
      onVoiceMessage(audioBlob, recordingTime)
      setAudioBlob(null)
      setAudioUrl(null)
      setRecordingTime(0)
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (isRecording) {
    return (
      <div className="flex items-center space-x-2 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800">
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-red-600 dark:text-red-400">{formatTime(recordingTime)}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={stopRecording}
          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/40"
        >
          <MicOff className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={cancelRecording}
          className="h-8 w-8 p-0 text-gray-600 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  if (audioBlob && audioUrl) {
    return (
      <div className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-800">
        <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} preload="metadata" />
        <Button
          variant="ghost"
          size="sm"
          onClick={playPreview}
          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/40"
        >
          <Play className="h-4 w-4" />
        </Button>
        <span className="text-sm text-blue-600 dark:text-blue-400">Voice message ({formatTime(recordingTime)})</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={sendVoiceMessage}
          className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900/40"
        >
          <Send className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={cancelRecording}
          className="h-8 w-8 p-0 text-gray-600 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={startRecording}
      className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
      title="Record voice message"
    >
      <Mic className="h-4 w-4" />
    </Button>
  )
}
