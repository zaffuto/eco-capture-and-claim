import { useState } from "react";
import { ImageCapture } from "@/components/ImageCapture";
import { QRScanner } from "@/components/QRScanner";
import { CouponGenerator } from "@/components/CouponGenerator";
import { cn } from "@/lib/utils";

const steps = [
  {
    id: "capture",
    title: "Captura tu EcoBatería",
    description: "Toma una foto para validar tu entrega en el Punto Eco",
  },
  {
    id: "scan",
    title: "Escanea el Punto Eco",
    description: "Escanea el código QR del Punto Eco donde depositaste la batería",
  },
  {
    id: "coupon",
    title: "Tu cupón está en camino",
    description: "Hemos generado un cupón por $3.000 CLP para tu próxima EcoBatería",
  },
];

const Index = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <ImageCapture />;
      case 1:
        return <QRScanner />;
      case 2:
        return <CouponGenerator />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-eco-light p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="space-y-2 text-center animate-fade-up">
          <h1 className="text-3xl font-bold text-gray-900">
            {steps[currentStep].title}
          </h1>
          <p className="text-gray-600">
            {steps[currentStep].description}
          </p>
        </div>

        <div className="relative">
          {renderStep()}
        </div>

        <div className="flex justify-between items-center max-w-xs mx-auto">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "w-3 h-3 rounded-full transition-colors",
                index === currentStep
                  ? "bg-eco-primary"
                  : "bg-gray-200"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;