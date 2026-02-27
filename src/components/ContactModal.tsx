// web/src/components/ContactModal.tsx
import { useState, useEffect } from "react";
import { useForm, ValidationError } from "@formspree/react";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [state, handleSubmit] = useForm("mojnbwwj");

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      document.body.style.overflow = "";
      const timer = setTimeout(() => setIsVisible(false), 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Auto-close after success
  useEffect(() => {
    if (state.succeeded) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state.succeeded, onClose]);

  if (!isVisible) return null;

  const FormFields = () => (
    <div className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm text-gray-400 mb-1">
          Name
        </label>
        <input
          id="name"
          type="text"
          name="name"
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
          placeholder="Your name"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm text-gray-400 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          name="email"
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
          placeholder="your@email.com"
        />
        <ValidationError
          prefix="Email"
          field="email"
          errors={state.errors}
          className="text-red-400 text-sm mt-1"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm text-gray-400 mb-1">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 resize-none"
          placeholder="What's on your mind?"
        />
        <ValidationError
          prefix="Message"
          field="message"
          errors={state.errors}
          className="text-red-400 text-sm mt-1"
        />
      </div>
    </div>
  );

  const SuccessMessage = () => (
    <div className="text-center py-8">
      <div className="text-green-400 text-4xl mb-3">✓</div>
      <p className="text-white">Thanks! Message sent.</p>
    </div>
  );

  return (
    <>
      {/* Desktop side panel - slides in from left */}
      <div className="hidden md:block fixed inset-0 z-50">
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity duration-150 ${
            isAnimating ? "opacity-100" : "opacity-0"
          }`}
          onClick={onClose}
        />

        {/* Side panel */}
        <form
          onSubmit={handleSubmit}
          className={`absolute top-0 left-0 bottom-0 w-full max-w-sm bg-gray-900 border-r border-gray-800 shadow-2xl transition-transform duration-150 ease-out flex flex-col ${
            isAnimating ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <h3 className="text-lg font-semibold text-white">Contact</h3>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {state.succeeded ? (
              <SuccessMessage />
            ) : (
              <>
                <FormFields />
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={state.submitting}
                    className="w-full py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-500 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {state.submitting ? "Sending..." : "Send"}
                  </button>
                </div>
              </>
            )}
          </div>
        </form>
      </div>

      {/* Mobile Bottom Sheet */}
      <div className="md:hidden fixed inset-0 z-50">
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-150 ${
            isAnimating ? "opacity-100" : "opacity-0"
          }`}
          onClick={onClose}
        />
        <form
          onSubmit={handleSubmit}
          className={`absolute bottom-0 left-0 right-0 bg-gray-900 rounded-t-2xl transition-transform duration-150 ease-out flex flex-col max-h-[85vh] ${
            isAnimating ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="px-4 py-3 flex items-center justify-between border-b border-gray-800">
            <h3 className="text-lg font-semibold text-white">Contact</h3>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white active:scale-90 transition-transform"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {state.succeeded ? (
              <SuccessMessage />
            ) : (
              <>
                <FormFields />
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 bg-gray-800 text-gray-300 font-medium rounded-xl hover:bg-gray-700 active:scale-[0.98] transition-all"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={state.submitting}
                    className="flex-1 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-500 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {state.submitting ? "Sending..." : "Send"}
                  </button>
                </div>
              </>
            )}
          </div>
        </form>
      </div>
    </>
  );
}
