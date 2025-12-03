import React, { useState, useRef, useEffect } from 'react';
import { Upload, Cpu, ShieldCheck, RefreshCcw, BookOpen, Camera, X, SwitchCamera } from 'lucide-react';
import { analyzeEngineeringContext } from './services/geminiService';
import { EngineeringResponse, LoadingState } from './types';
import { SAMPLE_RAG_CONTEXT } from './constants';
import AnalysisView from './components/AnalysisView';

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [ragContext, setRagContext] = useState<string>(SAMPLE_RAG_CONTEXT);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [result, setResult] = useState<EngineeringResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('environment');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const startCamera = async (mode: 'environment' | 'user' = 'environment') => {
    try {
      // Stop existing stream if needed (for toggling)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: mode } 
      });
      
      streamRef.current = stream;
      setCameraFacingMode(mode);
      setIsCameraOpen(true);

      // If switching while already open, re-attach immediately
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.error("Error playing video:", e));
      }

    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Erro ao acessar a câmera. Verifique as permissões e tente novamente.");
      setIsCameraOpen(false);
    }
  };

  const toggleCamera = () => {
    const newMode = cameraFacingMode === 'environment' ? 'user' : 'environment';
    startCamera(newMode);
  };

  // Effect to attach stream to video element when camera first opens
  useEffect(() => {
    if (isCameraOpen && videoRef.current && streamRef.current) {
      // Only attach if not already attached (prevents flickering on re-renders if stream is same)
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(e => console.error("Error playing video:", e));
      }
    }
  }, [isCameraOpen]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Check if video has dimensions
      if (video.videoWidth === 0 || video.videoHeight === 0) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        // Flip horizontally if using front camera for a mirror effect
        if (cameraFacingMode === 'user') {
          context.translate(canvas.width, 0);
          context.scale(-1, 1);
        }

        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
            setImageFile(file);
            stopCamera();
            setResult(null);
            setError(null);
          }
        }, 'image/jpeg', 0.95);
      }
    }
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleAnalyze = async () => {
    if (!imageFile) return;

    setLoadingState(LoadingState.UPLOADING);
    setError(null);

    try {
      setLoadingState(LoadingState.ANALYZING);
      const data = await analyzeEngineeringContext(imageFile, ragContext);
      setResult(data);
      setLoadingState(LoadingState.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Falha na análise. Verifique a API Key e tente novamente.");
      setLoadingState(LoadingState.ERROR);
    }
  };

  const handleReset = () => {
    setImageFile(null);
    setResult(null);
    setLoadingState(LoadingState.IDLE);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-terminal-black text-gray-300 font-sans selection:bg-terminal-blue/30 selection:text-white">
      
      {/* Header */}
      <header className="border-b border-terminal-border bg-terminal-gray/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-terminal-blue/10 p-2 rounded-lg border border-terminal-blue/20">
              <Cpu className="text-terminal-blue" size={24} />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg tracking-tight">Engenheiro IA - Assistente Análise Imagens <span className="text-terminal-blue">AI</span></h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <span className="flex items-center gap-1 text-xs font-mono text-terminal-green px-2 py-1 rounded bg-terminal-green/10 border border-terminal-green/20">
                <ShieldCheck size={12} /> SECURE MODE
             </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Input Section - Only show if no result yet */}
        {!result && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
            
            {/* Left: Image Upload & Camera */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white font-semibold">
                <span className="bg-terminal-border w-6 h-6 flex items-center justify-center rounded-full text-xs font-mono">1</span>
                <h3>Upload da Evidência</h3>
              </div>
              
              <div className={`
                border-2 border-dashed rounded-xl h-64 flex flex-col items-center justify-center p-6 transition-all relative overflow-hidden
                ${imageFile ? 'border-terminal-blue bg-terminal-blue/5' : (isCameraOpen ? 'border-terminal-green bg-black' : 'border-terminal-border hover:border-terminal-blue/50 hover:bg-terminal-gray')}
              `}>
                
                {/* Camera View */}
                {isCameraOpen && (
                   <div className="absolute inset-0 flex flex-col items-center bg-black z-20">
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted
                        className={`w-full h-full object-cover ${cameraFacingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                      />
                      <canvas ref={canvasRef} className="hidden" />
                      
                      <div className="absolute bottom-6 flex items-center gap-6 z-30">
                         {/* Toggle Camera Button */}
                         <button 
                           onClick={toggleCamera}
                           className="bg-white/20 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/30 transition-colors"
                           title="Alternar Câmera"
                        >
                           <SwitchCamera size={24} />
                        </button>

                        {/* Capture Button */}
                        <button 
                          onClick={capturePhoto} 
                          className="bg-white text-black p-4 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)] hover:scale-105 transition-transform active:scale-95 border-4 border-gray-300/50"
                          title="Capturar Foto"
                        >
                           <Camera size={28} />
                        </button>
                        
                        {/* Close Button */}
                         <button 
                           onClick={stopCamera} 
                           className="bg-terminal-red/80 backdrop-blur-md text-white p-3 rounded-full hover:bg-red-600 transition-colors"
                           title="Cancelar"
                        >
                           <X size={24} />
                        </button>
                      </div>
                   </div>
                )}

                {/* Image Preview */}
                {!isCameraOpen && imageFile && (
                  <div className="relative w-full h-full flex flex-col items-center justify-center animate-fade-in">
                    <img 
                      src={URL.createObjectURL(imageFile)} 
                      alt="Preview" 
                      className="max-h-40 rounded shadow-lg border border-terminal-border mb-4 object-contain" 
                    />
                    <p className="text-sm text-white font-medium truncate max-w-full px-4">{imageFile.name}</p>
                    <button 
                      onClick={() => setImageFile(null)}
                      className="mt-2 text-xs text-terminal-red hover:underline"
                    >
                      Remover / Tirar Nova
                    </button>
                  </div>
                )}

                {/* Default Upload/Camera Select */}
                {!isCameraOpen && !imageFile && (
                  <div className="flex flex-col items-center w-full">
                     <label className="cursor-pointer flex flex-col items-center text-center w-full mb-4 group">
                        <div className="bg-terminal-gray p-4 rounded-full mb-3 group-hover:bg-terminal-border transition-colors">
                          <Upload className="text-gray-400 group-hover:text-white transition-colors" size={32} />
                        </div>
                        <span className="text-white font-medium">Clique para upload da imagem</span>
                        <span className="text-sm text-gray-500 mt-1">Screenshots, Fotos de Equipamentos</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                      </label>
                      
                      <div className="flex items-center gap-3 w-full max-w-[200px] my-2">
                         <div className="h-px bg-terminal-border flex-1"></div>
                         <span className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">OU</span>
                         <div className="h-px bg-terminal-border flex-1"></div>
                      </div>

                      <button 
                        onClick={() => startCamera('environment')}
                        className="mt-2 flex items-center gap-2 px-4 py-2 bg-terminal-blue/10 text-terminal-blue rounded-lg hover:bg-terminal-blue/20 transition-colors text-sm font-bold"
                      >
                        <Camera size={18} />
                        Abrir Câmera
                      </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right: RAG Context */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-white font-semibold">
                <div className="flex items-center gap-2">
                  <span className="bg-terminal-border w-6 h-6 flex items-center justify-center rounded-full text-xs font-mono">2</span>
                  <h3>Base de Conhecimento (RAG)</h3>
                </div>
                <button 
                  onClick={() => setRagContext('')}
                  className="text-xs text-gray-500 hover:text-white"
                >
                  Limpar
                </button>
              </div>
              
              <div className="relative">
                <textarea 
                  value={ragContext}
                  onChange={(e) => setRagContext(e.target.value)}
                  className="w-full h-64 bg-terminal-gray border border-terminal-border rounded-xl p-4 font-mono text-xs text-gray-300 focus:ring-2 focus:ring-terminal-blue focus:border-transparent resize-none scrollbar-thin"
                  placeholder="Cole aqui trechos de documentação, KBs ou procedimentos..."
                />
                <div className="absolute bottom-3 right-3 pointer-events-none text-terminal-border">
                  <BookOpen size={16} />
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Actions */}
        {!result && (
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleAnalyze}
              disabled={!imageFile || loadingState !== LoadingState.IDLE}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white transition-all
                ${!imageFile ? 'bg-terminal-border cursor-not-allowed text-gray-500' : 'bg-terminal-blue hover:bg-blue-600 shadow-lg shadow-blue-500/20'}
              `}
            >
              {loadingState === LoadingState.ANALYZING ? (
                <>
                  <RefreshCcw className="animate-spin" size={20} />
                  Processando Análise Visual & RAG...
                </>
              ) : (
                <>
                  <Cpu size={20} />
                  Gerar Diagnóstico e Plano
                </>
              )}
            </button>
          </div>
        )}

        {/* Error State */}
        {error && (
           <div className="mt-8 bg-red-900/20 border border-red-500/50 text-red-200 p-4 rounded-lg flex items-center gap-3 animate-fade-in">
             <ShieldCheck size={24} className="text-red-500" />
             <div>
               <h3 className="font-bold">Erro na Execução</h3>
               <p className="text-sm">{error}</p>
             </div>
           </div>
        )}

        {/* Results View */}
        {result && (
          <div className="space-y-6">
             <div className="flex justify-between items-end border-b border-terminal-border pb-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Relatório de Incidente</h2>
                  <p className="text-sm text-gray-500">Gerado por AI com base na evidência visual e documentação.</p>
                </div>
                <button 
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 bg-terminal-gray border border-terminal-border rounded hover:bg-terminal-border text-sm transition-colors"
                >
                  <RefreshCcw size={16} /> Nova Análise
                </button>
             </div>

             <AnalysisView data={result} />
          </div>
        )}

      </main>
    </div>
  );
};

export default App;