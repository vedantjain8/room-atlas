"use client";

import { motion } from "framer-motion";
import React from "react";
import { AuroraBackground } from "../components/ui/aurora-background";
import { Timeline } from "@/components/ui/timeline";
import search from "@/app/images/flats.png"
import Image from "next/image";


export default function Home()  {
  const data = [{
    title: "Search",
    content: (
      <div>
            <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-8">
              Search for your desired flats in a seemingly easy manner with near-perfect navigation and extremely accurate filters
            </p>
            <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-8">
              AI chatbot assisting you in every step of the way. Just ask!
            </p>
            <div className="flex justify-center">
            <Image
              src={search}
              alt="startup template"
              width={900}
              height={500}
              className="rounded-lg object-cover md:h-56 lg:h-72 w-9/12 shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
            </div>
          </div>
    ),
  },
  {
    title: "Message",
    content: (
      <div>
        <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-8">
              Message freely to solve queries and finalise the deal
            </p>
            <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-8">
              Messaging 
            </p>
            <Image
              src="/room-atlas/frontend/src/app/images/message_img.jpeg"
              alt="startup template"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
      </div>
    ),
  },
  {
    title: "Meet",
    content: (
      <div>
        <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-8">
              Appoint dates for meeting and looking at the place
            </p>
            <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-8">
              Advanced Calendar to add appointments directly linked to your Google Calendar
            </p>
            <Image
              src="/room-atlas/frontend/src/app/images/message_img.jpeg"
              alt="startup template"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
      </div>
    ),
  },
  ];
  return (
    <>
    <AuroraBackground>
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.5,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative flex flex-col gap-4 items-center justify-center px-4"
      >
        <div className="text-3xl md:text-7xl font-bold dark:text-white text-center">
          Finding homes made easier
        </div>
        <div className="font-extralight text-base md:text-4xl dark:text-neutral-200 py-4">
          than ever before...
        </div>
      </motion.div>
    </AuroraBackground>
    
    <div className="w-full">
      <Timeline data={data}/>
    </div>
    </>
  );
}
