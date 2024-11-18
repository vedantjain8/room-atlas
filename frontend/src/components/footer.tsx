// components/Footer.tsx

"use client";

import { Button } from "@nextui-org/react";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-200 py-10 px-6 sm:px-12">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center md:items-start gap-8">
        {/* Company Information */}
        <div className="text-center sm:text-left">
          <h2 className="text-2xl font-semibold text-white">Room Atlas</h2>
          <p className="mt-2 text-gray-400">
            Providing high-quality services that you can trust.
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col items-center sm:items-start">
          <h3 className="text-lg font-medium text-white">Quick Links</h3>
          <ul className="mt-4 space-y-2">
            <li>
              <a href="/about" className="text-gray-400 hover:text-gray-100">
                About Us
              </a>
            </li>
            <li>
              <a href="/services" className="text-gray-400 hover:text-gray-100">
                Services
              </a>
            </li>
            <li>
              <a href="/blog" className="text-gray-400 hover:text-gray-100">
                Blog
              </a>
            </li>
            <li>
              <a href="/contact" className="text-gray-400 hover:text-gray-100">
                Contact Us
              </a>
            </li>
          </ul>
        </div>

        {/* Contact Information */}
        <div className="flex flex-col items-center sm:items-start">
          <h3 className="text-lg font-medium text-white">Contact Us</h3>
          <ul className="mt-4 space-y-2 text-gray-400">
            <li className="flex items-center gap-2">
              <Mail size={18} />
              <span>info@yourcompany.com</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone size={18} />
              <span>+91 123-456-7890</span>
            </li>
          </ul>
        </div>

        {/* Social Media */}
        <div className="flex flex-col items-center sm:items-start">
          <h3 className="text-lg font-medium text-white">Follow Us</h3>
          <div className="flex mt-4 gap-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-100"
            >
              <Facebook size={20} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-100"
            >
              <Twitter size={20} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-100"
            >
              <Instagram size={20} />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-100"
            >
              <Linkedin size={20} />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-10 border-t border-gray-700 pt-6 text-center text-gray-400">
        <p>
          &copy; {new Date().getFullYear()} Room Atlas. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
