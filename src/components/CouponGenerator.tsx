import { useState } from "react";
import { Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const CouponGenerator = () => {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "¡Cupón enviado!",
      description: "Revisa tu correo para ver los detalles.",
    });
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 animate-fade-up">
      <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
        <div className="text-center space-y-2">
          <div className="text-sm font-medium text-eco-primary">EcoCupón</div>
          <div className="text-4xl font-bold">$3.000 CLP</div>
          <div className="text-sm text-gray-600">
            Para tu próxima EcoBatería
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Tu correo electrónico"
          className="w-full px-4 py-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 focus:border-eco-primary outline-none transition-colors"
          required
        />

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-eco-primary text-white rounded-full hover:bg-eco-secondary transition-colors"
        >
          <Mail className="w-5 h-5" />
          Enviar por Email
        </button>
      </form>
    </div>
  );
};