import { useState } from "react";
import { QrCode } from "lucide-react";
import { cn } from "@/lib/utils";

export const QRScanner = () => {
  const [scanning, setScanning] = useState(false);

  const startScanning = () => {
    setScanning(true);
    // Implement actual QR scanning logic here
    setTimeout(() => {
      setScanning(false);
      // Handle successful scan
    }, 2000);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 animate-fade-up">
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-black/5 backdrop-blur-sm border border-white/10">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={cn(
            "w-64 h-64 border-2 border-eco-primary rounded-lg",
            scanning && "animate-pulse"
          )}>
            <div className="absolute inset-0 flex items-center justify-center">
              <QrCode className="w-12 h-12 text-eco-primary/50" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={startScanning}
          className="flex items-center gap-2 px-6 py-3 bg-eco-primary text-white rounded-full hover:bg-eco-secondary transition-colors"
          disabled={scanning}
        >
          <QrCode className="w-5 h-5" />
          {scanning ? "Escaneando..." : "Escanear QR"}
        </button>
      </div>
    </div>
  );
};