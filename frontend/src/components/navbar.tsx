"use client";

import { cn } from "@/lib/utils";
import { Menu, MenuItem, HoveredLink, ProductItem } from "./ui/navbar-menu";
import { useState } from "react";
import Link from "next/link";
import { Bell, Calendar, MenuIcon, Send } from "lucide-react";
import { CloseIcon } from "./otpModal";
import { useAuth } from "@/app/contexts/AuthContext";

function Navbar({ className }: { className?: string }) {
  const { user } = useAuth(); // Current logged-in user
  const [active, setActive] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    console.log(user);
  };
  return (
    <div
      className={cn(
        "sticky top-0 inset-x-0 max-w-full mx-auto z-50 border-b-2 border-slate-600",
        // "fixed top-0 inset-x-0 max-w-full mx-auto z-50 border-b-2 border-slate-600",
        className
      )}
    >
      <Menu setActive={setActive}>
        {/* Hamburger Menu Icon */}
        <button
          className="block md:hidden"
          onClick={toggleMenu}
          aria-label="Toggle Menu"
        >
          {isMenuOpen ? (
            <CloseIcon />
          ) : (
            <MenuIcon strokeWidth={1.5} className="w-6 h-6" />
          )}
        </button>
        <div className="flex justify-between items-center w-full h-5">
          <div className="flex p-0">
            <Link href="/" className="text-lg">
              Room Atlas
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex justify-center items-center w-6/12">
            <h2>Home</h2>
            
          </div>
          <Link href="/listing">Properties</Link>
          <div className="hidden md:flex justify-between items-center">
            <div className="flex justify-end w-32 pl-2 pr-5 text-xl">
              {/* <Calendar strokeWidth={1.25} className="cursor-pointer" /> */}
              <Link href="/chat">
                <Send strokeWidth={1.5} className="cursor-pointer" />
              </Link>
              {/* <Bell strokeWidth={1.25} className="cursor-pointer" /> */}
            </div>

            {user ? (
              <div>
                <Link href="/logout">
                  <button className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] active:outline-none active:ring-2 active:ring-slate-400 active:ring-offset-2 active:ring-offset-slate-50 ">
                    {/* <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" /> */}
                    <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-50 px-3 py-1 text-sm font-medium text-black backdrop-blur-3xl">
                      <h1>Logout</h1>
                    </span>
                  </button>
                </Link>
              </div>
            ) : (
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
            )}
          </div>
        </div>
      </Menu>
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm mt-16">
          <div className="md:hidden bg-white border-t-2 border-slate-600 p-4 absolute top-0 right-0 left-0 z-50 flex-col gap-4">
            <Link href="/listing" className="block mt-2" onClick={toggleMenu}>
              Flats
            </Link>
            <h2>PGs</h2>
            <h2>Hostels</h2>
            <div className="flex justify-start w-32 pl-2 pr-5 text-xl mt-4">
              {/* <Calendar strokeWidth={1.25} className="cursor-pointer" /> */}
              <Link href="/chat" onClick={toggleMenu}>
                <Send strokeWidth={1.5} className="cursor-pointer" />
              </Link>
              {/* <Bell strokeWidth={1.25} className="cursor-pointer" /> */}
            </div>
            {user ? (
              <div className="mt-4">
                <Link href="/logout" onClick={toggleMenu}>
                  <button className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] active:outline-none active:ring-2 active:ring-slate-400 active:ring-offset-2 active:ring-offset-slate-50 ">
                    {/* <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" /> */}
                    <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-50 px-3 py-1 text-sm font-medium text-black backdrop-blur-3xl">
                      <h1>Logout</h1>
                    </span>
                  </button>
                </Link>
              </div>
            ) : (
              <div className="mt-4 flex flex-col space-y-2">
                <Link href="/login" className="text-sky-700" onClick={toggleMenu}>
                  Login
                </Link>
                <Link href="/register" onClick={toggleMenu}>
                  <button
                    className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] active:outline-none active:ring-2 active:ring-slate-400 active:ring-offset-2 active:ring-offset-slate-50 "
                    
                  >
                    <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                    <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-50 px-3 py-1 text-sm font-medium text-black backdrop-blur-3xl">
                      <h1>Sign Up</h1>
                    </span>
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
export default Navbar;
