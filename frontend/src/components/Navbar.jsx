import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { ShoppingCart, User, X, Menu, Search } from "lucide-react";

function Navbar({ mobileMenuOpen, setMobileMenuOpen }) {
  const { user, cart = [], logout, categories = [] } = useAppContext();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const cartItemsCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/shop", label: "Shop All" },
    { to: "/shop?type=new", label: "New Arrivals" },
    { to: "/shop?type=thrift", label: "Thrift (Mitumba)" },
    ...categories
      .filter((cat) => ["men", "women", "shoes", "accessories"].includes(cat.slug))
      .map((cat) => ({ to: `/${cat.slug}`, label: cat.name })),
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-[#FDFBF9] shadow-md z-50 border-b border-[#EADBC8] backdrop-blur-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}>
            <span className="text-2xl sm:text-3xl font-bold text-[#4E3B2C] tracking-tight">
              NAIROBI<span className="text-[#A6754D]">FASHION</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-6 xl:space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="relative text-[#4E3B2C] no-underline font-medium text-sm xl:text-base transition-all duration-200 hover:text-[#A6754D] after:content-[''] after:absolute after:left-0 after:bottom-[-4px] after:w-0 after:h-[2px] after:bg-[#A6754D] hover:after:w-full after:transition-all after:duration-300 whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Icons */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            
            {/* Search Toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-[#4E3B2C] hover:text-[#A6754D] transition-colors p-2 rounded-full"
              aria-label="Search"
            >
              <Search className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="text-[#4E3B2C] hover:text-[#A6754D] transition-colors p-2 rounded-full"
                  aria-label="Account"
                >
                  <User className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-[#EADBC8] rounded-xl shadow-lg py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 mb-2">
                      <p className="text-xs text-gray-500">Signed in as</p>
                      <p className="text-sm font-bold text-[#4E3B2C] truncate">{user.email}</p>
                    </div>
                    <button onClick={() => { navigate("/profile"); setUserMenuOpen(false); }} className="block px-4 py-2 text-sm text-[#4E3B2C] hover:bg-[#F7EFE7] w-full text-left">Profile</button>
                    <button onClick={() => { navigate("/orders"); setUserMenuOpen(false); }} className="block px-4 py-2 text-sm text-[#4E3B2C] hover:bg-[#F7EFE7] w-full text-left">My Orders</button>
                    <button onClick={() => { logout(); setUserMenuOpen(false); navigate("/"); }} className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-[#EADBC8] w-full text-left mt-1">Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="hidden md:block text-[#4E3B2C] font-medium hover:text-[#A6754D] transition-colors text-sm">
                Login
              </Link>
            )}

            {/* Cart */}
            <button
              onClick={() => navigate("/cart")}
              className="relative text-[#4E3B2C] hover:text-[#A6754D] transition-colors p-2 rounded-full"
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#A6754D] text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-[#FDFBF9]">
                  {cartItemsCount > 9 ? "9+" : cartItemsCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-[#4E3B2C] p-2 rounded-full hover:text-[#A6754D] transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="py-4 border-t border-[#EADBC8]">
            <form onSubmit={handleSearchSubmit} className="relative max-w-3xl mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A6754D] h-5 w-5" />
              <input
                type="text"
                placeholder="Search for clothes, shoes, thrift..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full pl-10 pr-4 py-3 border border-[#EADBC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A6754D] bg-white text-[#4E3B2C] placeholder-[#A98565]"
              />
            </form>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-[#EADBC8] shadow-inner max-h-[calc(100vh-80px)] overflow-y-auto">
          <nav className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-left py-3 px-4 text-[#4E3B2C] hover:bg-[#F7EFE7] rounded-lg font-medium no-underline"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-gray-100 my-2"></div>
            {user ? (
              <>
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="block text-left py-3 px-4 text-[#4E3B2C] hover:bg-[#F7EFE7] rounded-lg font-medium no-underline">Profile</Link>
                <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="block text-left py-3 px-4 text-[#4E3B2C] hover:bg-[#F7EFE7] rounded-lg font-medium no-underline">My Orders</Link>
                <button onClick={() => { logout(); setMobileMenuOpen(false); navigate("/"); }} className="block w-full text-left py-3 px-4 text-red-600 hover:bg-red-50 rounded-lg font-medium">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block text-left py-3 px-4 text-[#4E3B2C] hover:bg-[#F7EFE7] rounded-lg font-medium no-underline">Login</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block text-center py-3 px-4 bg-[#A6754D] text-white hover:bg-[#8D5F3B] rounded-lg font-bold no-underline mt-2">Sign Up</Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export default Navbar;