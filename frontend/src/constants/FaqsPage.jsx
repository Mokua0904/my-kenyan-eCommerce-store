import React, { useState } from "react";
import { ChevronDown, Search, HelpCircle } from "lucide-react";

function FAQsPage() {
  const [openIndex, setOpenIndex] = useState("0-0"); // Open first FAQ by default
  const [searchTerm, setSearchTerm] = useState("");

  const faqCategories = [
    {
      category: "Shopping & Orders",
      faqs: [
        {
          question: "How do I place an order?",
          answer: "Simply browse our collections, add items to your cart, and proceed to checkout. You'll be able to track your order in real-time once it's confirmed."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We primarily accept M-PESA (via STK Push), as well as credit/debit cards and PayPal. All transactions are secure and encrypted."
        },
        {
          question: "Do you offer international shipping?",
          answer: "Currently, we ship within Kenya. We're expanding to other East African countries soon. Check back for updates!"
        },
        {
          question: "Can I modify or cancel my order?",
          answer: "If your order hasn't been processed yet, you can cancel it within 2 hours of placing it. Contact our support team for assistance."
        },
        {
          question: "How long does delivery take?",
          answer: "Standard delivery takes 1-2 business days within Nairobi CBD and 3-5 business days for other areas. Express delivery is available for urgent orders."
        }
      ]
    },
    {
      category: "Products & Sizing",
      faqs: [
        {
          question: "How do I know what size to order?",
          answer: "Each product page has a detailed size guide with measurements. We recommend checking these before ordering to ensure the perfect fit."
        },
        {
          question: "Are all products original?",
          answer: "Yes! We sell a mix of brand new items and premium curated thrift (mitumba). Every item is inspected for quality before it goes online."
        },
        {
          question: "Do you restock sold-out items?",
          answer: "Most new items are restocked regularly, but thrift items are often one-of-a-kind. Sign up for our newsletter to be alerted when new stock arrives."
        },
        {
          question: "What is your sizing policy?",
          answer: "We follow standard Kenyan and international sizing. Our size guides are detailed and accurate. If you're between sizes, we recommend sizing up for comfort."
        },
        {
          question: "Can I see product reviews before buying?",
          answer: "Yes! Each product page displays verified customer reviews and ratings. Read these to make informed decisions."
        }
      ]
    },
    {
      category: "Returns & Refunds",
      faqs: [
        {
          question: "What is your return policy?",
          answer: "We offer a 7-day return policy on all items in original condition. Refunds are processed within 3-5 business days."
        },
        {
          question: "How do I initiate a return?",
          answer: "Bring the item to our Nairobi CBD shop or contact our support team to arrange a pickup. We'll guide you through the process."
        },
        {
          question: "Are there any non-returnable items?",
          answer: "For hygiene reasons, intimate items and swimwear cannot be returned. Thrift items can be returned if the tags are still attached."
        },
        {
          question: "How long does a refund take?",
          answer: "Once we receive and inspect your return, refunds are processed within 3-5 business days to your original payment method (M-PESA or Card)."
        },
        {
          question: "What if the item is defective?",
          answer: "If you receive a defective item, contact us immediately with photos. We'll replace it or issue a full refund at no cost to you."
        }
      ]
    },
    {
      category: "Account & Security",
      faqs: [
        {
          question: "How do I create an account?",
          answer: "Click 'Sign Up' in the top right corner, enter your details, and you're ready to go. You can also sign in using Google or Facebook."
        },
        {
          question: "Is my personal information secure?",
          answer: "Yes! We use industry-standard SSL encryption and comply with Kenyan data protection regulations. Your privacy is our priority."
        },
        {
          question: "Can I change my password?",
          answer: "Yes, go to Account Settings and click 'Change Password'. You'll need to verify your old password before confirming the change."
        },
        {
          question: "How do I track my order?",
          answer: "Once your order is shipped, you'll receive a tracking link via SMS or email. You can also track it from the 'My Orders' page in your account."
        },
        {
          question: "What if I forget my password?",
          answer: "Click 'Forgot Password' on the login page, enter your email, and follow the instructions to reset it."
        }
      ]
    },
    {
      category: "General",
      faqs: [
        {
          question: "How can I contact customer support?",
          answer: "You can reach us via email at support@nairobifashion.co.ke, call/WhatsApp +254 700 000 000, or visit our shop in Nairobi CBD (Mon-Sat, 8 AM - 6 PM)."
        },
        {
          question: "Do you have a loyalty program?",
          answer: "We reward our repeat customers with exclusive discounts and early access to new collections. Join our newsletter for updates!"
        },
        {
          question: "Can I gift my order?",
          answer: "Yes! You can add a gift message during checkout, and we'll include it in the package at no extra cost."
        },
        {
          question: "How often do you have sales?",
          answer: "We run seasonal sales and flash deals regularly. Subscribe to our newsletter or follow us on social media to stay updated."
        },
        {
          question: "Do you offer bulk/wholesale orders?",
          answer: "Yes! For corporate orders and bulk purchases, email us at wholesale@nairobifashion.co.ke and we'll provide special pricing."
        }
      ]
    }
  ];

  const filteredFaqs = faqCategories.map((cat) => ({
    ...cat,
    faqs: cat.faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter((cat) => cat.faqs.length > 0);

  const FAQItem = ({ question, answer, index, categoryIndex }) => {
    const uniqueIndex = `${categoryIndex}-${index}`;
    const isOpen = openIndex === uniqueIndex;

    return (
      <div className={`border rounded-xl overflow-hidden transition-all duration-200 ${isOpen ? 'border-[#A6754D] shadow-md' : 'border-[#DCC7AA] hover:border-[#A6754D]'}`}>
        <button
          onClick={() => setOpenIndex(isOpen ? null : uniqueIndex)}
          className={`w-full px-6 py-4 flex items-center justify-between transition ${isOpen ? 'bg-[#FAF6F0]' : 'bg-white hover:bg-gray-50'}`}
        >
          <h4 className={`font-bold text-left ${isOpen ? 'text-[#A6754D]' : 'text-[#4E3B2C]'}`}>{question}</h4>
          <ChevronDown
            size={20}
            className={`flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#A6754D]" : "text-[#7C6652]"}`}
          />
        </button>

        {isOpen && (
          <div className="px-6 py-4 bg-white border-t border-[#DCC7AA]">
            <p className="text-[#7C6652] leading-relaxed">{answer}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F4EDE4] py-16">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="w-16 h-16 bg-[#FAF6F0] border border-[#DCC7AA] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <HelpCircle size={32} className="text-[#A6754D]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#4E3B2C] mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-[#7C6652] mb-8">
            Find answers to common questions about shopping, orders, returns, and more.
          </p>

          {/* Search */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#A6754D]" size={20} />
            <input
              type="text"
              placeholder="Search FAQs (e.g. M-PESA, delivery, returns)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-[#DCC7AA] rounded-xl text-[#4E3B2C] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#A6754D]/30 focus:border-[#A6754D] shadow-sm transition"
            />
          </div>
        </div>

        {/* FAQs */}
        <div className="max-w-4xl mx-auto">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((category, catIndex) => (
              <div key={catIndex} className="mb-12">
                <h2 className="text-2xl font-bold text-[#4E3B2C] mb-6 pb-4 border-b-2 border-[#A6754D]">
                  {category.category}
                </h2>
                <div className="space-y-4">
                  {category.faqs.map((faq, faqIndex) => (
                    <FAQItem
                      key={faqIndex}
                      question={faq.question}
                      answer={faq.answer}
                      index={faqIndex}
                      categoryIndex={catIndex}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-[#DCC7AA]">
              <p className="text-xl text-[#4E3B2C] font-bold mb-2">No results found for "{searchTerm}"</p>
              <p className="text-[#7C6652] mb-6">Try searching for a different keyword.</p>
              <button
                onClick={() => setSearchTerm("")}
                className="bg-[#A6754D] text-white px-6 py-2.5 rounded-lg font-bold hover:bg-[#8D5F3B] transition"
              >
                Clear search
              </button>
            </div>
          )}
        </div>

        {/* Still Need Help */}
        <div className="max-w-4xl mx-auto mt-16 bg-[#4E3B2C] rounded-2xl p-8 md:p-12 text-center shadow-xl">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">Still need help?</h3>
          <p className="text-[#F4EDE4]/80 mb-8 max-w-lg mx-auto">
            Can't find the answer you're looking for? Our Nairobi support team is here to help you out.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="bg-[#A6754D] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#8D5F3B] transition shadow-md"
            >
              Contact Us
            </a>
            <a
              href="mailto:support@nairobifashion.co.ke"
              className="bg-transparent text-white border-2 border-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:text-[#4E3B2C] transition"
            >
              Email Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FAQsPage;