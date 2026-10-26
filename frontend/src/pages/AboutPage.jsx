import React from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import { Truck, RefreshCw, Shield, Headphones, MapPin, Sparkles } from "lucide-react";

function AboutPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-[#F4EDE4]">

        {/* Hero */}
        <div className="bg-[#4E3B2C] text-white py-20 px-6 text-center">
          <p className="text-[#E8DCC4] text-sm font-semibold uppercase tracking-widest mb-3">About Us</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-5">
            Dressed for the Life You Live
          </h1>
          <p className="text-[#F4EDE4]/80 text-lg max-w-2xl mx-auto">
            We're a Nairobi-based fashion store built for people who value quality, comfort, and style —
            without the hassle of mall queues or overpriced boutiques. We specialize in fresh new arrivals and premium curated thrift.
          </p>
        </div>

        {/* Story */}
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[#A6754D] text-sm font-semibold uppercase tracking-widest mb-3">Our Story</p>
              <h2 className="text-3xl font-bold text-[#4E3B2C] mb-6">Started in Nairobi CBD</h2>
              <div className="space-y-4 text-[#7C6652] leading-relaxed">
                <p>
                  We started from a straightforward frustration — finding well-made, fairly priced
                  clothing in Kenya was harder than it should be. We set out to fix that.
                </p>
                <p>
                  What began as a small physical shop in the heart of Nairobi CBD has grown into a full 
                  fashion destination. We meticulously handpick both brand new items and high-quality 
                  thrift (mitumba) pieces — if we wouldn't wear it ourselves, it doesn't make the cut.
                </p>
                <p>
                  Today we serve thousands of customers across Kenya. You can shop online for same-city 
                  delivery, or visit our physical store to try things on in person.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-6 border border-[#DCC7AA] text-center shadow-sm">
                <div className="text-4xl font-bold text-[#A6754D] mb-1">10K+</div>
                <p className="text-sm text-[#7C6652] font-medium">Happy Customers</p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-[#DCC7AA] text-center shadow-sm">
                <div className="text-4xl font-bold text-[#A6754D] mb-1">5K+</div>
                <p className="text-sm text-[#7C6652] font-medium">Curated Items</p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-[#DCC7AA] text-center shadow-sm">
                <div className="text-4xl font-bold text-[#A6754D] mb-1">98%</div>
                <p className="text-sm text-[#7C6652] font-medium">Satisfaction</p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-[#DCC7AA] text-center shadow-sm">
                <div className="text-4xl font-bold text-[#A6754D] mb-1">100%</div>
                <p className="text-sm text-[#7C6652] font-medium">Nairobi Owned</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mission / Vision / Values */}
        <div className="bg-white py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <p className="text-[#A6754D] text-sm font-semibold uppercase tracking-widest mb-3 text-center">What Drives Us</p>
            <h2 className="text-3xl font-bold text-[#4E3B2C] mb-12 text-center">Mission, Vision & Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  label: "Mission",
                  text: "Make quality fashion accessible to every Kenyan — offering both brand new trends and sustainable thrift options at affordable prices.",
                },
                {
                  label: "Vision",
                  text: "Become East Africa's most trusted fashion destination, known for consistency, quality curation, and exceptional customer care.",
                },
                {
                  label: "Values",
                  text: "Quality over quantity. Honesty in every transaction. Sustainability through our thrift collections.",
                },
              ].map((item) => (
                <div key={item.label} className="border-t-2 border-[#A6754D] pt-6">
                  <h3 className="text-lg font-bold text-[#4E3B2C] mb-3">{item.label}</h3>
                  <p className="text-[#7C6652] leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="max-w-6xl mx-auto px-6 py-20">
          <p className="text-[#A6754D] text-sm font-semibold uppercase tracking-widest mb-3 text-center">Why Shop With Us</p>
          <h2 className="text-3xl font-bold text-[#4E3B2C] mb-12 text-center">What You Can Count On</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Truck className="h-7 w-7 text-[#A6754D]" />,
                title: "Fast Nairobi Delivery",
                desc: "Same-day delivery within Nairobi. Countrywide shipping within 2-3 business days.",
              },
              {
                icon: <MapPin className="h-7 w-7 text-[#A6754D]" />,
                title: "CBD Shop Pickup",
                desc: "Prefer to shop in person? Pick up your online order directly from our Nairobi CBD shop.",
              },
              {
                icon: <Shield className="h-7 w-7 text-[#A6754D]" />,
                title: "Secure M-Pesa Payments",
                desc: "Pay securely via M-Pesa STK push, debit/credit card, or Cash on Delivery within CBD.",
              },
              {
                icon: <Sparkles className="h-7 w-7 text-[#A6754D]" />,
                title: "New & Thrift",
                desc: "We curate the best of both worlds — fresh, brand new arrivals alongside high-quality mitumba finds.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl p-6 border border-[#DCC7AA] hover:shadow-md transition"
              >
                <div className="mb-4">{item.icon}</div>
                <h3 className="font-bold text-[#4E3B2C] mb-2">{item.title}</h3>
                <p className="text-sm text-[#7C6652] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-[#4E3B2C] py-20 px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Upgrade Your Wardrobe?
          </h2>
          <p className="text-[#F4EDE4]/70 mb-8 max-w-xl mx-auto">
            Browse our latest new arrivals and unique thrift finds.
          </p>
          <Link
            to="/shop"
            className="inline-block bg-[#A6754D] hover:bg-[#8D5F3B] text-white px-8 py-4 rounded-lg font-bold transition shadow-lg"
          >
            Shop the Collection
          </Link>
        </div>

      </div>
    </Layout>
  );
}

export default AboutPage;