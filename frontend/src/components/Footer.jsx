import React from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#4E3B2C] text-white">
      {/* Main Footer Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 max-w-7xl mx-auto mb-12">
          
          {/* Brand Column */}
          <div className="md:col-span-1 lg:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <span className="text-3xl font-bold text-white tracking-wide">NAIROBI FASHION</span>
            </Link>
            <p className="text-[#F4EDE4]/70 mb-6 text-sm leading-relaxed">
              Your premier destination for brand new styles and premium curated thrift (mitumba). Quality, comfort, and timeless design.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-[#F4EDE4]/70 text-sm">
                <MapPin size={18} className="text-[#A6754D] flex-shrink-0" />
                <span>Bazaar Plaza, Moi Avenue, Nairobi CBD</span>
              </div>
              <div className="flex items-center gap-3 text-[#F4EDE4]/70 text-sm">
                <Phone size={18} className="text-[#A6754D] flex-shrink-0" />
                <span>+254 700 000 000</span>
              </div>
              <div className="flex items-center gap-3 text-[#F4EDE4]/70 text-sm">
                <Mail size={18} className="text-[#A6754D] flex-shrink-0" />
                <span>hello@nairobifashion.co.ke</span>
              </div>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="font-bold text-lg mb-5 text-white">Shop</h4>
            <ul className="space-y-2.5">
              {['Men', 'Women', 'Shoes', 'Accessories'].map((item) => (
                <li key={item}>
                  <Link
                    to={`/${item.toLowerCase()}`}
                    className="text-[#F4EDE4]/70 hover:text-[#A6754D] transition flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-[#A6754D] rounded-full opacity-0 group-hover:opacity-100 transition"></span>
                    {item}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/shop"
                  className="text-[#F4EDE4] hover:text-[#A6754D] transition flex items-center gap-2 group font-semibold"
                >
                  <span className="w-1 h-1 bg-[#A6754D] rounded-full opacity-0 group-hover:opacity-100 transition"></span>
                  All Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-bold text-lg mb-5 text-white">Support</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/contact" className="text-[#F4EDE4]/70 hover:text-[#A6754D] transition flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-[#A6754D] rounded-full opacity-0 group-hover:opacity-100 transition"></span>
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-[#F4EDE4]/70 hover:text-[#A6754D] transition flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-[#A6754D] rounded-full opacity-0 group-hover:opacity-100 transition"></span>
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/faqs" className="text-[#F4EDE4]/70 hover:text-[#A6754D] transition flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-[#A6754D] rounded-full opacity-0 group-hover:opacity-100 transition"></span>
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-lg mb-5 text-white">Company</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/about" className="text-[#F4EDE4]/70 hover:text-[#A6754D] transition flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-[#A6754D] rounded-full opacity-0 group-hover:opacity-100 transition"></span>
                  About Us
                </Link>
              </li>
              <li>
                <a href="/" className="text-[#F4EDE4]/70 hover:text-[#A6754D] transition flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-[#A6754D] rounded-full opacity-0 group-hover:opacity-100 transition"></span>
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Social & Legal */}
          <div>
            <h4 className="font-bold text-lg mb-5 text-white">Connect</h4>
            <div className="flex gap-4 mb-8">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="bg-[#3a2c21] hover:bg-[#A6754D] transition p-3 rounded-lg text-white">
                <Facebook size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="bg-[#3a2c21] hover:bg-[#A6754D] transition p-3 rounded-lg text-white">
                <Instagram size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="bg-[#3a2c21] hover:bg-[#A6754D] transition p-3 rounded-lg text-white">
                <Twitter size={20} />
              </a>
            </div>

            <h4 className="font-bold text-lg mb-5 text-white">Legal</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/" className="text-[#F4EDE4]/70 hover:text-[#A6754D] transition flex items-center gap-2 group text-sm">
                  <span className="w-1 h-1 bg-[#A6754D] rounded-full opacity-0 group-hover:opacity-100 transition"></span>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/" className="text-[#F4EDE4]/70 hover:text-[#A6754D] transition flex items-center gap-2 group text-sm">
                  <span className="w-1 h-1 bg-[#A6754D] rounded-full opacity-0 group-hover:opacity-100 transition"></span>
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#F4EDE4]/10 max-w-7xl mx-auto"></div>

        {/* Bottom Section */}
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Copyright */}
              <div className="text-[#F4EDE4]/50 text-sm text-center md:text-left">
                <p>&copy; {currentYear} Nairobi Fashion. All rights reserved.</p>
              </div>

              {/* Payment Methods */}
              <div className="text-center">
                <p className="text-[#F4EDE4]/50 text-xs mb-2 uppercase tracking-wider font-semibold">
                  Secure Payment Methods
                </p>
                <div className="flex items-center justify-center gap-2">
                  <div className="bg-[#3a2c21] px-3 py-1.5 rounded text-xs font-bold text-[#F4EDE4] border border-[#F4EDE4]/10">
                    M-PESA
                  </div>
                  <div className="bg-[#3a2c21] px-3 py-1.5 rounded text-xs font-bold text-[#F4EDE4] border border-[#F4EDE4]/10">
                    VISA
                  </div>
                  <div className="bg-[#3a2c21] px-3 py-1.5 rounded text-xs font-bold text-[#F4EDE4] border border-[#F4EDE4]/10">
                    PAYPAL
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;