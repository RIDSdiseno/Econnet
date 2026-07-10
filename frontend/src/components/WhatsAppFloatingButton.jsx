import { WhatsAppOutlined } from "@ant-design/icons";

const DEFAULT_MESSAGE = "¡Hola Econnet! Necesito ayuda.";
const MIN_PHONE_LENGTH = 8;
const MAX_PHONE_LENGTH = 15;

function WhatsAppFloatingButton() {
  const rawNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "";
  const message = import.meta.env.VITE_WHATSAPP_MESSAGE || DEFAULT_MESSAGE;
  const number = rawNumber.replace(/\D/g, "");
  const isValidNumber =
    number.length >= MIN_PHONE_LENGTH && number.length <= MAX_PHONE_LENGTH;

  if (!isValidNumber) {
    if (import.meta.env.DEV) {
      console.warn(
        "VITE_WHATSAPP_NUMBER debe estar en formato internacional, solo con numeros.",
      );
    }

    return null;
  }

  const whatsappUrl = `https://wa.me/${number}?text=${encodeURIComponent(
    message,
  )}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar a Econnet por WhatsApp"
      title="Contactar por WhatsApp"
      className="fixed bottom-[calc(96px+env(safe-area-inset-bottom))] right-[calc(24px+env(safe-area-inset-right))] z-[1000] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_24px_rgba(37,211,102,0.35)] transition duration-200 hover:-translate-y-1 hover:bg-[#1ebe5d] hover:shadow-[0_14px_30px_rgba(37,211,102,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#25D366] max-sm:bottom-[calc(84px+env(safe-area-inset-bottom))] max-sm:right-[calc(18px+env(safe-area-inset-right))] max-sm:h-[52px] max-sm:w-[52px]"
    >
      <WhatsAppOutlined className="text-[30px] leading-none max-sm:text-[28px]" />
    </a>
  );
}

export default WhatsAppFloatingButton;
