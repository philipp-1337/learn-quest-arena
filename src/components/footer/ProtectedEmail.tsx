import { useState } from "react";
import {
  loadCaptchaEnginge,
  LoadCanvasTemplate,
  validateCaptcha,
} from "react-simple-captcha";
import { useEffect } from "react";
import Modal from "../modals/GenericModal";
import { Shield } from "lucide-react";

export default function ProtectedEmail() {
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (showCaptcha) {
      loadCaptchaEnginge(6);
    }
  }, [showCaptcha]);

  const handleSubmit = () => {
    if (validateCaptcha(userInput)) {
      setIsVerified(true);
      setError("");
    } else {
      setError("CAPTCHA nicht korrekt. Bitte versuchen Sie es erneut.");
      setUserInput("");
      loadCaptchaEnginge(6);
    }
  };

  const revealContact = () => {
    const emailParts = [
      String.fromCharCode(112, 104, 105, 108, 105, 112, 112),
      String.fromCharCode(64),
      String.fromCharCode(99, 104, 97, 110, 103, 101, 107, 114, 97, 102, 116),
      String.fromCharCode(46),
      String.fromCharCode(100, 101),
    ];
    return emailParts.join("");
  };

  if (isVerified) {
    const email = revealContact();
    return (
      <button
        type="button"
        onClick={() => (window.location.href = `mailto:${email}`)}
        className="inline-flex items-center gap-1.5 hover:underline cursor-pointer"
        aria-label={`E-Mail an ${email} senden`}
      >
        <span>{email}</span>
      </button>
    );
  }

  if (!showCaptcha) {
    return (
      <button
        onClick={() => {
          setIsModalOpen(true);
          setShowCaptcha(true);
        }}
        className="inline-flex items-center gap-1.5 hover:underline cursor-pointer"
      >
        <span>E-Mail anzeigen</span>
      </button>
    );
  }

  const CaptchaContent = (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-2 text-gray-900">
        <Shield size={24} />
        <h2 className="text-2xl font-bold">Sicherheitscheck</h2>
      </div>

      <p className="">
        Bitte geben Sie den Code ein, um zu bestätigen, dass Sie keine Maschine
        sind
      </p>

      <div className="w-full">
        <div className="captcha-wrapper bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-md">
          <LoadCanvasTemplate />
        </div>

        {/* Hide the internal reload link rendered by react-simple-captcha; we provide our own reload button */}
        <style>{`
          .captcha-wrapper a {
            display: none !important;
          }
        `}</style>

        <div className="mt-4 flex items-center justify-end">
          <button
            onClick={(e) => {
              e.preventDefault();
              loadCaptchaEnginge(6);
              setUserInput("");
              setError("");
            }}
            className="text-gray-600 font-medium hover:text-gray-900 transition-colors cursor-pointer"
            aria-label="Captcha neu laden"
          >
            Captcha neu laden
          </button>
        </div>
      </div>

      <div className="flex flex-col w-full gap-3">
        <input
          type="text"
          placeholder="Code eingeben"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="w-full px-4 py-3 text-base bg-white border border-gray-300 text-gray-900 font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        />
        <button
          onClick={handleSubmit}
          className="w-full py-3 px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
        >
          Überprüfen
        </button>
      </div>

      {error && (
        <p className="text-red-600 text-sm text-center font-medium">
          {error}
        </p>
      )}
    </div>
  );

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center gap-1.5 text-black hover:-translate-y-0.5 cursor-pointer font-bold transition-all"
      >
        <span>E-Mail anzeigen</span>
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setShowCaptcha(false);
          setError("");
          setUserInput("");
          loadCaptchaEnginge(6); // Lade ein neues Captcha für das nächste Mal
        }}
      >
        {CaptchaContent}
      </Modal>
    </>
  );
}
