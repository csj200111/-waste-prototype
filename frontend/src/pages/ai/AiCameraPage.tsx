import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '@/components/layout/Header'
import { useAiImageStore } from '@/stores/useAiImageStore'

type CameraStatus = 'loading' | 'ready' | 'captured' | 'fallback'

export default function AiCameraPage() {
  const navigate = useNavigate()
  const setImage = useAiImageStore((s) => s.setImage)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [status, setStatus] = useState<CameraStatus>('loading')
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null)
  const capturedFileRef = useRef<File | null>(null)

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [])

  const startCamera = useCallback(async () => {
    setStatus('loading')
    setCapturedUrl(null)

    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('fallback')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setStatus('ready')
    } catch {
      // getUserMedia 실패 시 (권한 거부, 자체서명 인증서 등) → 네이티브 카메라 폴백
      setStatus('fallback')
    }
  }, [])

  useEffect(() => {
    startCamera()
    return () => stopStream()
  }, [startCamera, stopStream])

  // getUserMedia 캡처
  const handleCapture = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0)
    stopStream()

    canvas.toBlob((blob) => {
      if (!blob) return
      const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' })
      capturedFileRef.current = file
      setCapturedUrl(URL.createObjectURL(blob))
      setStatus('captured')
    }, 'image/jpeg', 0.9)
  }

  // 네이티브 카메라(file input)로 촬영
  const handleNativeCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    capturedFileRef.current = file
    if (capturedUrl) URL.revokeObjectURL(capturedUrl)
    setCapturedUrl(URL.createObjectURL(file))
    setStatus('captured')
    e.target.value = ''
  }

  const handleRetake = () => {
    if (capturedUrl) URL.revokeObjectURL(capturedUrl)
    setCapturedUrl(null)
    capturedFileRef.current = null
    // getUserMedia가 가능했던 경우 다시 시도, 아니면 바로 파일 입력
    startCamera()
  }

  const handleAnalyze = () => {
    if (!capturedFileRef.current) return
    setImage(capturedFileRef.current)
    navigate('/ai/result')
  }

  return (
    <div>
      <Header title="촬영하기" showBack />
      <div className="pt-14 flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>
        {/* 카메라 / 미리보기 영역 */}
        <div className="flex-1 bg-gray-900 relative flex items-center justify-center overflow-hidden">
          {status === 'loading' && (
            <div className="text-center">
              <svg className="mx-auto h-8 w-8 animate-spin text-white/60" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              <p className="mt-3 text-sm text-white/60">카메라를 준비하는 중...</p>
            </div>
          )}

          {/* 네이티브 카메라 폴백 (iOS 등) */}
          {status === 'fallback' && (
            <div className="text-center px-6">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/10">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="13" r="4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-sm font-medium text-white mb-2">카메라로 촬영하기</p>
              <p className="text-xs text-white/60 mb-6">
                아래 버튼을 눌러 카메라를 실행하세요
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white active:bg-blue-700"
              >
                카메라 열기
              </button>
            </div>
          )}

          {/* 라이브 비디오 (getUserMedia 성공 시) */}
          {(status === 'ready' || status === 'loading') && (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 h-full w-full object-cover"
              />
              {status === 'ready' && (
                <>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="h-64 w-64 rounded-2xl border-2 border-dashed border-white/50" />
                  </div>
                  <p className="absolute bottom-24 text-sm text-white/70 drop-shadow">
                    폐기물을 프레임 안에 맞춰주세요
                  </p>
                </>
              )}
            </>
          )}

          {/* 캡처된 이미지 미리보기 */}
          {status === 'captured' && capturedUrl && (
            <img src={capturedUrl} alt="캡처된 이미지" className="absolute inset-0 h-full w-full object-cover" />
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* 하단 컨트롤 */}
        <div className="bg-black px-4 py-6">
          {status === 'captured' ? (
            <div className="flex gap-3">
              <button
                onClick={handleRetake}
                className="flex-1 rounded-xl border border-gray-600 py-3.5 text-sm font-semibold text-white active:bg-gray-800"
              >
                다시 촬영
              </button>
              <button
                onClick={handleAnalyze}
                className="flex-1 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white active:bg-blue-700"
              >
                판독하기
              </button>
            </div>
          ) : status === 'ready' ? (
            <div className="flex items-center justify-center">
              <button
                onClick={handleCapture}
                className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white active:border-gray-300"
              >
                <div className="h-12 w-12 rounded-full bg-white active:bg-gray-200" />
              </button>
            </div>
          ) : (
            <div className="h-16" />
          )}
        </div>

        {/* 네이티브 카메라 파일 입력 (capture="environment"로 후면 카메라 실행) */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleNativeCapture}
          className="hidden"
        />
      </div>
    </div>
  )
}
