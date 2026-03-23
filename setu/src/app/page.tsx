"use client";

import { Activity, Tractor, HeartPulse, GraduationCap, Mic, Camera, LayoutList, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import Link from "next/link";
import { ActionCard } from "@/components/ActionCard";
import { MediaControls } from "@/components/MediaControls";

interface ActionStep {
  step: number;
  title: string;
  description: string;
}

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [actionCards, setActionCards] = useState<ActionStep[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const vitals = [
    { title: "Health", icon: <HeartPulse size={40} className="text-red-400" /> },
    { title: "Farming", icon: <Tractor size={40} className="text-green-400" /> },
    { title: "Pension", icon: <Activity size={40} className="text-blue-400" /> },
    { title: "Education", icon: <GraduationCap size={40} className="text-yellow-400" /> },
  ];

  const handleOrbClick = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
    } else {
      audioChunksRef.current = [];
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
        });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          setIsRecording(false);
          setIsThinking(true);
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          await processVoiceInput(audioBlob);
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Microphone access denied or not available", err);
      }
    }
  };

  const processVoiceInput = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "audio.webm");
      formData.append("language", "hi"); // Auto-detect usually preferred, forcing Hindi here to match target group testing
      
      const sttRes = await fetch("/api/stt", { method: "POST", body: formData });
      const sttData = await sttRes.json();
      
      if (!sttData.text) throw new Error("No transcription text returned");

      const chatRes = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: sttData.text, language: "Hindi" })
      });
      const chatData = await chatRes.json();
      
      if (chatData.steps) {
         setActionCards(chatData.steps);
         await generateTTS(chatData.steps);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsThinking(false);
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsThinking(true);
    
    // Convert memory to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = (reader.result as string).split(',')[1];
      try {
        const visionRes = await fetch("/api/vision", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            imageBase64: base64String, 
            mimeType: file.type,
            language: "Hindi"
          })
        });
        const visionData = await visionRes.json();
        if (visionData.steps) {
            setActionCards(visionData.steps);
            await generateTTS(visionData.steps);
        }
      } catch(err) {
        console.error(err);
      } finally {
         setIsThinking(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const generateTTS = async (steps: ActionStep[]) => {
    const fullText = steps.map(s => s.description).join(". ");
    try {
      const ttsRes = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: fullText, language: "hi" })
      });
      if (ttsRes.ok) {
        const blob = await ttsRes.blob();
        setAudioUrl(URL.createObjectURL(blob));
      }
    } catch (e) {
       console.error("TTS output failed", e);
    }
  };

  const resetState = () => {
    setActionCards([]);
    setAudioUrl(null);
  };

  return (
    <div className="flex flex-col h-full relative">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-wide">SETU</h1>
          <p className="text-textMuted text-sm">Your Digital Companion</p>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pb-32 no-scrollbar">
        <AnimatePresence mode="wait">
          {actionCards.length > 0 ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-primary">Steps</h2>
                <button onClick={resetState} className="neumorphic-button p-2 text-textMuted hover:text-red-400">
                  <X size={20} />
                </button>
              </div>
              {actionCards.map((card, idx) => (
                <ActionCard key={idx} step={card.step} title={card.title} description={card.description} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="vitals"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Vitals Dashboard */}
              <section className="grid grid-cols-2 gap-6 mb-8">
                {vitals.map((vital, index) => (
                  <motion.div
                    key={index}
                    whileTap={{ scale: 0.95 }}
                    className="neumorphic-card p-6 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary transition-all duration-300"
                  >
                    <div className="bg-[#112240] p-4 rounded-full shadow-neumorphic-inset">
                      {vital.icon}
                    </div>
                    <span className="text-lg font-semibold">{vital.title}</span>
                  </motion.div>
                ))}
              </section>

              {/* Main Instructions */}
              <div className="text-center flex flex-col justify-center items-center text-textMuted px-4 mt-8">
                <p className="text-xl leading-relaxed">
                  Tap the <span className="text-primary font-bold">golden orb</span> below to speak, or use the camera to scan a document.
                </p>
                {isThinking && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-primary mt-4 font-bold tracking-wide"
                  >
                    SETU is thinking...
                  </motion.p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange}
      />

      {/* TTS Media Controls */}
      <MediaControls audioUrl={audioUrl} onClose={() => setAudioUrl(null)} />

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 w-full p-6 flex justify-center items-end pointer-events-none pb-8" style={{ zIndex: 60 }}>
        <div className="flex items-center gap-8 pointer-events-auto bg-[#0a192f] p-2 rounded-[2rem] shadow-neumorphic">
          <Link href="/vault">
            <button className="neumorphic-button w-16 h-16 focus-ring">
              <LayoutList size={28} className="text-textMuted hover:text-primary transition-colors" />
            </button>
          </Link>

          <div className="relative flex items-center justify-center -translate-y-6">
            <motion.div 
              className={`absolute w-28 h-28 rounded-full blur-xl pointer-events-none ${isRecording ? 'bg-red-500/40' : isThinking ? 'bg-blue-500/40' : 'bg-primary/20'}`}
              animate={{ scale: isRecording || isThinking ? [1, 1.3, 1] : [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ repeat: Infinity, duration: isRecording || isThinking ? 1 : 2, ease: "easeInOut" }}
            />
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={handleOrbClick}
              className={`neumorphic-button w-24 h-24 z-10 flex items-center justify-center focus-ring transition-colors ${isRecording ? 'bg-red-500 !shadow-[0_0_20px_rgba(239,68,68,0.5)]' : isThinking ? 'bg-blue-400' : 'bg-primary !shadow-glow'}`}
            >
              <Mic size={44} className={`${isRecording || isThinking ? 'text-white' : 'text-[#0A192F]'}`} />
            </motion.button>
          </div>

          <button onClick={handleCameraClick} className="neumorphic-button w-16 h-16 focus-ring">
            <Camera size={28} className="text-textMuted hover:text-primary transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
}
