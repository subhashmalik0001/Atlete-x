// Video Recording Hook
import { useState, useRef, useCallback } from 'react';

export interface VideoRecordingState {
  isRecording: boolean;
  stream: MediaStream | null;
  videoURL: string | null;
  recordedBlob: Blob | null;
}

export function useVideoRecording() {
  const [state, setState] = useState<VideoRecordingState>({
    isRecording: false,
    stream: null,
    videoURL: null,
    recordedBlob: null
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 }, 
        audio: false 
      });

      setState(prev => ({ ...prev, stream: mediaStream }));
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      
      chunksRef.current = [];
      const mediaRecorder = new MediaRecorder(mediaStream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/mp4' });
        const url = URL.createObjectURL(blob);
        
        setState(prev => ({
          ...prev,
          recordedBlob: blob,
          videoURL: url,
          isRecording: false
        }));
        
        if (videoRef.current) {
          videoRef.current.srcObject = null;
          videoRef.current.src = url;
        }
      };
      
      mediaRecorder.start();
      setState(prev => ({ ...prev, isRecording: true }));
    } catch (error) {
      console.error('Error starting recording:', error);
      throw new Error('Camera access denied or not available');
    }
  }, []);
  
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();
      
      if (state.stream) {
        state.stream.getTracks().forEach(track => track.stop());
        setState(prev => ({ ...prev, stream: null }));
      }
    }
  }, [state.isRecording, state.stream]);

  const uploadVideo = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setState(prev => ({
      ...prev,
      videoURL: url,
      recordedBlob: file,
      stream: null,
      isRecording: false
    }));
  }, []);

  const clearVideo = useCallback(() => {
    if (state.stream) {
      state.stream.getTracks().forEach(track => track.stop());
    }
    if (state.videoURL) {
      URL.revokeObjectURL(state.videoURL);
    }
    setState({
      isRecording: false,
      stream: null,
      videoURL: null,
      recordedBlob: null
    });
  }, [state.stream, state.videoURL]);

  return {
    ...state,
    videoRef,
    startRecording,
    stopRecording,
    uploadVideo,
    clearVideo
  };
}