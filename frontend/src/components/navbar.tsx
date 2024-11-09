"use client";

import { cn } from "@/lib/utils";
import { Menu, MenuItem, HoveredLink, ProductItem } from "./ui/navbar-menu";
import { useState } from "react";
import Link from "next/link";
import { Bell, Calendar, Send } from "lucide-react";

function Navbar({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);
  return (
    <div
      className={cn(
        "sticky top-0 inset-x-0 max-w-full mx-auto z-50 border-b-2 border-slate-600",
        // "fixed top-0 inset-x-0 max-w-full mx-auto z-50 border-b-2 border-slate-600",
        className
      )}
    >
      <Menu setActive={setActive}>
        <div className="flex justify-between items-center w-full h-5">
          <div className="flex p-0">
            <Link href="/" className="text-lg">
              Room Atlas
            </Link>
          </div>
          <div className="flex justify-between w-5/12">
            <MenuItem setActive={setActive} active={active} item="Home">
              <div className="flex flex-col space-y-4 text-sm">
                <HoveredLink href="/">Hero Page</HoveredLink>
                <HoveredLink href="/">Step by Step</HoveredLink>
              </div>
            </MenuItem>
            <Link href="/flats">Flats</Link>
            <MenuItem
              setActive={setActive}
              active={active}
              item="PGs"
            ></MenuItem>
            <MenuItem
              setActive={setActive}
              active={active}
              item="Hostels"
            ></MenuItem>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex justify-between w-32 pl-2 pr-5 text-xl">
              <Calendar strokeWidth={1.25} className="cursor-pointer" />
              <Link href="/chat">
              <Send strokeWidth={1.5} className="cursor-pointer" />
              </Link>
              <Bell strokeWidth={1.25} className="cursor-pointer"/>
            </div>
            <div className="flex items-center justify-between w-32">
              <Link href="/login" className="text-sky-700">
                Login
              </Link>
              <Link href="/register">
                <button className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] active:outline-none active:ring-2 active:ring-slate-400 active:ring-offset-2 active:ring-offset-slate-50 ">
                  <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                  <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-50 px-3 py-1 text-sm font-medium text-black backdrop-blur-3xl">
                    <h1>Sign Up</h1>
                  </span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </Menu>
    </div>
  );
}
export default Navbar;
