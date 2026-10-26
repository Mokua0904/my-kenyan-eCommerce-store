import React, { useState } from "react";
// 🛠️ FIX: Changed './' to '../' to go up one folder to src/components/
import Navbar from "../Navbar";
import Footer from "../Footer";

function Layout({ children, className = '' }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className={`w-full min-h-screen flex flex-col bg-[#F4EDE4] ${className}`}>
      
      {/* Top Navbar */}
      <Navbar 
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen} 
      />

      {/* Main Content Area */}
      {/* pt-20 ensures the content starts below the fixed Navbar (h-20) */}
      <main className="flex-grow pt-20">
        {children}
      </main>

      {/* Footer */}
      <Footer />
      
    </div>
  );
}

export default Layout;