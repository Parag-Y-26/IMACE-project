/**
 * Audio processing utilities for Gemini Live API
 * Handles conversion between browser audio formats and Gemini's expected formats
 */

// Gemini Live API audio specifications
export const GEMINI_INPUT_SAMPLE_RATE = 16000; // 16kHz input
export const GEMINI_OUTPUT_SAMPLE_RATE = 24000; // 24kHz output

/**
 * Convert Float32Array audio samples to 16-bit PCM
 */
export function floatTo16BitPCM(float32Array: Float32Array): ArrayBuffer {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  
  return buffer;
}

/**
 * Convert 16-bit PCM to Float32Array for playback
 */
export function pcm16ToFloat32(pcmData: ArrayBuffer): Float32Array {
  const view = new DataView(pcmData);
  const float32Array = new Float32Array(pcmData.byteLength / 2);
  
  for (let i = 0; i < float32Array.length; i++) {
    const int16 = view.getInt16(i * 2, true);
    float32Array[i] = int16 / 32768;
  }
  
  return float32Array;
}

/**
 * Convert base64 string to ArrayBuffer
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return bytes.buffer;
}

/**
 * Convert ArrayBuffer to base64 string
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  
  return btoa(binary);
}

/**
 * Resample audio from source sample rate to target sample rate
 * Uses linear interpolation
 */
export function resampleAudio(
  input: Float32Array,
  inputSampleRate: number,
  outputSampleRate: number
): Float32Array {
  if (inputSampleRate === outputSampleRate) {
    return input;
  }

  const ratio = inputSampleRate / outputSampleRate;
  const outputLength = Math.round(input.length / ratio);
  const output = new Float32Array(outputLength);

  for (let i = 0; i < outputLength; i++) {
    const srcIndex = i * ratio;
    const srcIndexFloor = Math.floor(srcIndex);
    const srcIndexCeil = Math.min(srcIndexFloor + 1, input.length - 1);
    const t = srcIndex - srcIndexFloor;
    
    output[i] = input[srcIndexFloor] * (1 - t) + input[srcIndexCeil] * t;
  }

  return output;
}

/**
 * Audio queue for smooth playback
 */
export class AudioQueue {
  private queue: Float32Array[] = [];
  private isPlaying = false;
  private audioContext: AudioContext | null = null;
  private nextPlayTime = 0;

  constructor() {
    if (typeof window !== "undefined") {
      this.audioContext = new AudioContext({ sampleRate: GEMINI_OUTPUT_SAMPLE_RATE });
    }
  }

  async enqueue(audioData: Float32Array): Promise<void> {
    this.queue.push(audioData);
    
    if (!this.isPlaying) {
      await this.play();
    }
  }

  private async play(): Promise<void> {
    if (!this.audioContext || this.queue.length === 0) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;

    // Resume audio context if suspended
    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }

    const currentTime = this.audioContext.currentTime;
    
    if (this.nextPlayTime < currentTime) {
      this.nextPlayTime = currentTime;
    }

    while (this.queue.length > 0) {
      const chunk = this.queue.shift()!;
      const audioBuffer = this.audioContext.createBuffer(
        1,
        chunk.length,
        GEMINI_OUTPUT_SAMPLE_RATE
      );
      
      audioBuffer.getChannelData(0).set(chunk);

      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      source.start(this.nextPlayTime);

      this.nextPlayTime += audioBuffer.duration;
    }

    this.isPlaying = false;
  }

  clear(): void {
    this.queue = [];
    this.nextPlayTime = 0;
  }

  close(): void {
    this.clear();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

/**
 * Microphone audio capture with downsampling to 16kHz
 */
export class MicrophoneCapture {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private onAudioData: ((data: string) => void) | null = null;

  async start(onAudioData: (base64PcmData: string) => void): Promise<void> {
    this.onAudioData = onAudioData;

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: { ideal: 48000 },
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      this.audioContext = new AudioContext({ sampleRate: 48000 });
      this.source = this.audioContext.createMediaStreamSource(this.mediaStream);

      // Use ScriptProcessorNode (deprecated but widely supported)
      // Buffer size of 4096 at 48kHz gives us ~85ms of audio
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

      this.processor.onaudioprocess = (event) => {
        const inputData = event.inputBuffer.getChannelData(0);
        
        // Resample from 48kHz to 16kHz
        const resampledData = resampleAudio(
          inputData,
          this.audioContext!.sampleRate,
          GEMINI_INPUT_SAMPLE_RATE
        );

        // Convert to 16-bit PCM
        const pcmData = floatTo16BitPCM(resampledData);
        
        // Convert to base64
        const base64Data = arrayBufferToBase64(pcmData);
        
        if (this.onAudioData) {
          this.onAudioData(base64Data);
        }
      };

      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
    } catch (error) {
      console.error("Failed to start microphone:", error);
      throw error;
    }
  }

  stop(): void {
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.onAudioData = null;
  }
}
