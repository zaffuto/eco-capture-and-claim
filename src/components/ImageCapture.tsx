import { useState, useRef } from "react";
import { Camera, Check, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export const ImageCapture = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast({
        title: "Error",
        description: "No se pudo acceder a la cámara. Por favor, verifica los permisos.",
        variant: "destructive",
      });
    }
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
      const imageData = canvas.toDataURL("image/jpeg");
      setImage(imageData);
      validateImage(imageData);
    }
  };

  const validateImage = async (imageData: string) => {
    setIsValidating(true);
    // Simulated validation - replace with actual AI validation
    setTimeout(() => {
      setIsValidating(false);
      setIsValid(true);
      toast({
        title: "¡Batería detectada!",
        description: "Tu cupón de $3.000 será enviado por email.",
      });
    }, 2000);
  };

  const resetCapture = () => {
    setImage(null);
    setIsValid(false);
    startCamera();
  };

  useState(() => {
    startCamera();
    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="w-full max-w-md mx-auto space-y-6 animate-fade-up">
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/5 backdrop-blur-sm border border-white/10">
        {!image ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={image}
            alt="Captured"
            className="w-full h-full object-cover"
          />
        )}
        
        {isValid && (
          <div className="absolute inset-0 flex items-center justify-center bg-eco-primary/20 backdrop-blur-sm">
            <Check className="w-16 h-16 text-white animate-scale-up" />
          </div>
        )}
      </div>

      <div className="flex justify-center gap-4">
        {!image ? (
          <button
            onClick={captureImage}
            className="flex items-center gap-2 px-6 py-3 bg-eco-primary text-white rounded-full hover:bg-eco-secondary transition-colors"
          >
            <Camera className="w-5 h-5" />
            Capturar Imagen
          </button>
        ) : (
          <button
            onClick={resetCapture}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-gray-800 rounded-full hover:bg-white/20 transition-colors border border-gray-200"
          >
            <RefreshCw className="w-5 h-5" />
            Intentar de nuevo
          </button>
        )}
      </div>

      {isValidating && (
        <div className="text-center text-gray-600 animate-pulse">
          Validando la imagen...
        </div>
      )}
    </div>
  );
};