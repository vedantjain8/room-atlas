"use client";

import { Input } from "@nextui-org/input";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Autocomplete,
  AutocompleteItem
} from "@nextui-org/react";
import { useState } from "react";
import { EyeFilledIcon } from "./EyeFilledIcon";
import { EyeSlashFilledIcon } from "./EyeSlashFilledIcon";
import { Select, SelectItem } from "@nextui-org/react";
import { Link } from "@nextui-org/react";
import { toast } from "react-toastify";
import { Avatar } from "@nextui-org/react";
import {city} from "./city_data";
import {state} from "./state_data";

export default function Register() {
  const [isVisible, setIsVisible] = useState(false);
  const [isVisible2, setIsVisible2] = useState(false);
  const [step, setStep] = useState(2);
  const [isVerified, setisVerified] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    phone: "",
    security_answer: "",
  });

  const toggleVisibility = () => setIsVisible(!isVisible);
  const toggleVisibility2 = () => setIsVisible2(!isVisible2);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = () => {
    console.log("Form submitted with data:", formData);
    alert("Form Submitted!");
    // Here you would submit the form data to your API
  };

  async function checkOTP(email, otp) {
    console.log(email, otp);
    await fetch("http://localhost:3100/verify/email/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        otp: otp,
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          // Check if the status is not OK (200-299)
          const errorData = await response.json();
          throw new Error(errorData.message || `Error: ${response.status}`); // Use error message if available
        }
        return response.json(); // Return the parsed JSON data
      })
      .then((data) => {
        if (data) {
          setisVerified(true);
        }
      });
  }

  async function sendOtp(email) {
    await fetch("http://localhost:3100/verify/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json();
          toast.error(errorData.message || `Error: ${response.status}`);
          throw new Error(errorData.message || `Error: ${response.status}`);
        }
        return response.json(); // Return the parsed JSON data
      })
      .then((data) => {
        if (data) {
          console.log(data);
          onOpen(); // Only called if `data` is not null
        }
      })
      .catch((error) => {
        console.error("Request failed:", error.message); // Display the error message
      });
  }

  const Step1 = () => {
    return (
      <>
        <div className="flex items-center justify-center h-screen overflow-y-clip">
          <div className="flex w-64 flex-col gap-4 items-center justify-center register1">
            <h1>Register Page</h1>
            <Input type="email" variant="bordered" label="Username" />
            <Input
              type="email"
              id="EmailInput"
              variant="bordered"
              autoComplete="email"
              label="Email"
              name="email"
              onChange={(e) => {
                formData.email = e.target.value;
              }}
              endContent={
                <Button
                  className={`focus:outline-none ${isVerified ? `hidden` : ``}`}
                  type="button"
                  onClick={(e) => {
                    // start the spinner here
                    const email = formData.email;
                    if (!email) {
                      toast.error("Please enter a valid email");
                      return;
                    }
                    if (email) {
                      sendOtp(email);
                    }
                  }}
                  aria-label="toggle password visibility"
                >
                  Verify
                </Button>
                //Modal at the bottom!!!
              }
            />
            <Input
              label="Password"
              variant="bordered"
              // onChange={handleChange}
              endContent={
                <button
                  className="focus:outline-none"
                  type="button"
                  onClick={toggleVisibility}
                  aria-label="toggle password visibility"
                >
                  {!isVisible ? (
                    <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                  ) : (
                    <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                  )}
                </button>
              }
              type={isVisible ? "text" : "password"}
              className="max-w-xs"
            />
            <Input
              label="Confirm Password"
              variant="bordered"
              // onChange={handleChange}
              endContent={
                <button
                  className="focus:outline-none flex justify-center content-center"
                  type="button"
                  onClick={toggleVisibility2}
                  aria-label="toggle password visibility"
                >
                  {!isVisible2 ? (
                    <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                  ) : (
                    <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                  )}
                </button>
              }
              type={isVisible2 ? "text" : "password"}
              className="max-w-xs"
            />
            <Input
              type="email"
              variant="bordered"
              label="Phone"
              name="phone"
              // onChange={handleChange}
            />
            <Select
              label="Security question"
              className="max-w-xs"
              name="security_question"
              // onChange={handleChange}
            >
              <SelectItem>mothers maiden name</SelectItem>
              <SelectItem>name of your first pet</SelectItem>
              <SelectItem>name of the city where you were born</SelectItem>
              <SelectItem>name of your favorite teacher</SelectItem>
              <SelectItem>name of your favorite movie</SelectItem>
              <SelectItem>name of your favorite book</SelectItem>
              <SelectItem>name of your favorite song</SelectItem>
              <SelectItem>name of your favorite food</SelectItem>
              <SelectItem>favorite color</SelectItem>
              <SelectItem>name of your favorite vacation spot</SelectItem>
            </Select>
            <Input
              type="email"
              variant="bordered"
              label="Security Answer"
              // onChange={handleChange}
            />
            <Button
              onClick={(e) => {
                if (isVerified) {
                  nextStep();
                  return;
                }

                toast.error("Please verify your email first");
              }}
            >
              Proceed
            </Button>
          </div>
        </div>
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Verify Email
                </ModalHeader>
                <ModalBody>
                  <Input id="OTPInput" label="OTP"></Input>
                </ModalBody>
                <ModalFooter className="grid justify-items-stretch">
                  <Link
                    className="justify-self-start"
                    onClick={(e) => {
                      const email = formData.email;

                      sendOtp(email);
                    }}
                  >
                    Resend Link
                  </Link>
                  <Button color="danger" variant="light" onClick={onClose}>
                    Close
                  </Button>
                  <Button
                    color="primary"
                    onClick={(e) => {
                      const email = formData.email;
                      const otp = document.getElementById("OTPInput").value;
                      checkOTP(email, otp);
                    }}
                  >
                    Enter OTP
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </>
    );
  };

  const src = "http://localhost:3100/assets/profile/default_user_profile.png"
  const Step2 = () => {
    return (
      <>
        <div className="flex items-center justify-center h-screen overflow-y-clip">
          <div className="flex w-64 flex-col gap-4 items-center justify-center register1">
          
            <Input type="text" variant="bordered" label="Gender" />
            <Input type="text" variant="bordered" label="DOB" />
            <Select
              label="I'm a "
              className="max-w-xs"
              name="security_question"
            >
              <SelectItem>Student</SelectItem>
              <SelectItem>Working Professional</SelectItem>
            </Select>  
            <Autocomplete
              defaultItems={state}
              label="State"
              className="max-w-xs"
            >
              {(state) => <AutocompleteItem key={state.value}>{state.label}</AutocompleteItem>}
            </Autocomplete>
            <Autocomplete
              defaultItems={city}
              label="City"
              className="max-w-xs"
            >
              {(city) => <AutocompleteItem key={city.value}>{city.label}</AutocompleteItem>}
            </Autocomplete>
            
            <Button>Proceed</Button>
          </div>
        </div>
      </>
    );
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1 />;
      case 2:
        return <Step2 />;
      default:
        return <Step1 />;
    }
  };

  return <div>{renderStep()}</div>;

  // return (
  //   <>
  //     <div className="flex items-center justify-center h-screen overflow-y-clip">
  //       <div className="flex w-64 flex-col gap-4 items-center justify-center register1">
  //         <h1>Register Page</h1>
  //         <Input type="email" variant="bordered" label="Username" />
  //         <Input
  //           type="email"
  //           id="EmailInput"
  //           variant="bordered"
  //           label="Email"
  //           endContent={
  //             <Button
  //               className="focus:outline-none"
  //               type="button"
  //               onClick={(e) => {
  //                 const email = formData.email

  //                 sendOtp(email);
  //               }}
  //               aria-label="toggle password visibility"
  //             >
  //               Verify
  //             </Button>
  //             //Modal at the bottom!!!
  //           }
  //         />
  //         <Input
  //           label="Password"
  //           variant="bordered"
  //           endContent={
  //             <button
  //               className="focus:outline-none"
  //               type="button"
  //               onClick={toggleVisibility}
  //               aria-label="toggle password visibility"
  //             >
  //               {!isVisible ? (
  //                 <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
  //               ) : (
  //                 <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
  //               )}
  //             </button>
  //           }
  //           type={isVisible ? "text" : "password"}
  //           className="max-w-xs"
  //         />
  //         <Input
  //           label="Confirm Password"
  //           variant="bordered"
  //           endContent={
  //             <button
  //               className="focus:outline-none"
  //               type="button"
  //               onClick={toggleVisibility2}
  //               aria-label="toggle password visibility"
  //             >
  //               {!isVisible2 ? (
  //                 <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
  //               ) : (
  //                 <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
  //               )}
  //             </button>
  //           }
  //           type={isVisible2 ? "text" : "password"}
  //           className="max-w-xs"
  //         />
  //         <Input type="email" variant="bordered" label="Phone" />
  //         <Select label="Select a security question" className="max-w-xs">
  //           <SelectItem>What is your date of birth?</SelectItem>
  //           <SelectItem>
  //             What was your favorite school teacher’s name?
  //           </SelectItem>
  //           <SelectItem>What’s your favorite movie?</SelectItem>
  //         </Select>
  //         <Input type="email" variant="bordered" label="Security Answer" />
  //         <Button>Proceed</Button>
  //       </div>
  //     </div>
  //     <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur">
  //       <ModalContent>
  //         {(onClose) => (
  //           <>
  //             <ModalHeader className="flex flex-col gap-1">
  //               Verify Email
  //             </ModalHeader>
  //             <ModalBody>
  //               <Input id="OTPInput" label="OTP"></Input>
  //             </ModalBody>
  //             <ModalFooter className="grid justify-items-stretch">
  //               <Link
  //                 className="justify-self-start"
  //                 onClick={(e) => {
  //                   const email = formData.email

  //                   sendOtp(email);
  //                 }}
  //               >
  //                 Resend Link
  //               </Link>
  //               <Button color="danger" variant="light" onClick={onClose}>
  //                 Close
  //               </Button>
  //               <Button
  //                 className={
  //                   document.getElementById("OTPInput")
  //                     ? ""
  //                     : "cursor-not-allowed"
  //                 }
  //                 color="primary"
  //                 onClick={(e) => {
  //                   const email = formData.email
  //                   const otp = document.getElementById("OTPInput").value;
  //                   checkOTP(email, otp);
  //                 }}
  //               >
  //                 Enter OTP
  //               </Button>
  //             </ModalFooter>
  //           </>
  //         )}
  //       </ModalContent>
  //     </Modal>
  //   </>
  // );
}
