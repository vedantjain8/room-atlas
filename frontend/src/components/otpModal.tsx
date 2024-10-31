"use client";
import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "../app/hooks/use-outside-click";

interface ExpandableOTPInputProps {
  email: string;
  active: boolean;
  setActive: (value: boolean) => void;
  formData: any;
  setFormData: (value: any) => void;
  errors: any;
  setErrors: (value: any) => void;
}
const ExpandableOTPInput: React.FC<ExpandableOTPInputProps> = ({
  email,
  active,
  setActive,
  formData,
  setFormData,
  errors,
  setErrors,
}) => {
  // [active, setActive] = useState<boolean | null>(null);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]); // Assuming a 6-digit OTP
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(false);
      }
    }

    if (active) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useOutsideClick(ref, () => setActive(false));

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newOtp = [...otp];
    newOtp[index] = e.target.value;
    setOtp(newOtp);

    // Automatically focus the next input if value is filled
    if (e.target.value && index < otp.length - 1) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleSubmit = async () => {
    const otpCheckResponse = await fetch(
      `${process.env.NEXT_PUBLIC_HOSTNAME}/verify/email/check`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otp: otp.join(""), email: email }),
      }
    );

    if (otpCheckResponse.ok) {
      setFormData({ ...formData, emailVerified: true });
      setErrors({ ...errors, emailVerified: undefined });
      setActive(false);
      alert("OTP verified successfully");
    } else {
      setFormData({ ...formData, emailVerified: false });
      setErrors({ ...errors, emailVerified: false });
      setActive(false);
      alert("OTP is incorrect");
    }
  };

  return (
    <>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 h-full w-full z-10"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active ? (
          <div className="fixed inset-0 grid place-items-center z-[100]">
            <motion.button
              key={`button-close-${id}`}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.05 } }}
              className="absolute top-2 right-2 lg:hidden bg-white rounded-full h-6 w-6 flex items-center justify-center"
              onClick={() => setActive(false)}
            >
              <CloseIcon />
            </motion.button>
            <motion.div
              ref={ref}
              className="w-full max-w-[400px] h-full md:h-fit md:max-h-[90%] bg-white sm:rounded-3xl overflow-hidden p-8"
            >
              <div className="text-center mb-6">
                <h3 className="font-bold text-neutral-700">Enter OTP</h3>
                <p className="text-neutral-600">
                  Please enter the 4-digit code sent to your phone
                </p>
              </div>
              <div className="flex justify-center gap-4 mb-4">
                {otp.map((digit, index) => (
                  <input
                    autoFocus={index === 0}
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    value={digit}
                    onChange={(e) => handleChange(e, index)}
                    maxLength={1}
                    className="w-10 h-12 text-center border border-gray-300 rounded-lg text-xl focus:outline-none focus:ring focus:border-green-500"
                  />
                ))}
              </div>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-green-500 text-white font-bold rounded-full w-full"
              >
                Verify OTP
              </button>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
      {/* <div className="flex justify-center mt-10">
        <button
          onClick={() => setActive(true)}
          className="px-6 py-3 text-sm rounded-full font-bold bg-gray-100 hover:bg-green-500 hover:text-white text-black"
        >
          Open OTP Input
        </button>
      </div> */}
    </>
  );
};

export const CloseIcon = () => (
  <motion.svg
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0, transition: { duration: 0.05 } }}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4 text-black"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M18 6l-12 12" />
    <path d="M6 6l12 12" />
  </motion.svg>
);

export default ExpandableOTPInput;
