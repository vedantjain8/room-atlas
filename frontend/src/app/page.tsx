"use client";

import { motion } from "framer-motion";
import React from "react";
import { AuroraBackground } from "../components/ui/aurora-background";
import { Timeline } from "@/components/ui/timeline";
import Image from "next/image";


export default function Home()  {
  const data = [{
    title: "Search",
    content: (
      <div>
            <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-8">
              I usually run out of copy, but when I see content this big, I try to
              integrate lorem ipsum.
            </p>
            <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-8">
              Lorem ipsum is for people who are too lazy to write copy. But we are
              not. Here are some more example of beautiful designs I built.
            </p>
            <div className="grid grid-cols-2 gap-4">
            <Image
              src="/Users/adityan/Documents/aceui/src/app/images/message_img.jpeg"
              alt="startup template"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
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
              I usually run out of copy, but when I see content this big, I try to
              integrate lorem ipsum.
            </p>
            <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-8">
              Lorem ipsum is for people who are too lazy to write copy. But we are
              not. Here are some more example of beautiful designs I built.
            </p>
            <Image
              src="/Users/adityan/Documents/aceui/src/app/images/message_img.jpeg"
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
              I usually run out of copy, but when I see content this big, I try to
              integrate lorem ipsum.
            </p>
            <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-8">
              Lorem ipsum is for people who are too lazy to write copy. But we are
              not. Here are some more example of beautiful designs I built.
            </p>
            <Image
              src="/Users/adityan/Documents/aceui/src/app/images/message_img.jpeg"
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
