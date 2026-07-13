import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faWhatsapp, 
} from '@fortawesome/free-brands-svg-icons';
import { 
  faQuestionCircle, 
  faShieldAlt, 
  faUserGraduate,
  faExternalLinkAlt,
  faLifeRing
} from '@fortawesome/free-solid-svg-icons';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const HelpSupport = () => {
  const WHATSAPP_NUMBER = "+256761060363";
  const SUPPORT_MESSAGE = encodeURIComponent("Hello MuniCircle Support, I need assistance with...");

  const faqs = [
    {
      q: "I can't log in with my personal Gmail.",
      a: "MuniCircle is a private sanctuary. You must use your official @muni.ac.ug email to access the Circle."
    },
    {
      q: "How do I earn Circle Points?",
      a: "Points are awarded for joining clubs, attending campus events, and engaging positively in the NewsFeed."
    },
    {
      q: "How do I register a new Club/Circle?",
      a: "New Circle registrations must be approved by the System Admin. Contact support via WhatsApp to start the process."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 animate-in">
      {/* Header Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-brand/10 text-brand rounded-2xl mb-4">
          <FontAwesomeIcon icon={faLifeRing} size="2xl" />
        </div>
        <h1 className="text-3xl md:text-md font-syne font-black text-slate-900">Support Center</h1>
        <p className="text-slate-500 font-dm mt-2">Need a hand? The Circle is here for you.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {/* WhatsApp Card - Primary Action */}
        <Card className="md:col-span-2 p-8 border-2 border-green-500/20 bg-green-50/30">
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-green-200">
                <FontAwesomeIcon icon={faWhatsapp} size="lg" />
              </div>
              <div>
                <h3 className="font-syne font-bold text-slate-900">Instant Support</h3>
                <p className="text-xs text-green-600 font-bold uppercase tracking-wider">Online • MuniCircle Team</p>
              </div>
            </div>
            <p className="text-slate-600 text-sm font-dm mb-8 leading-relaxed">
              Have a technical issue or want to verify a new Club? Chat directly with the MuniCircle developer team on WhatsApp.
            </p>
            <a 
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${SUPPORT_MESSAGE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto"
            >
              <Button className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl flex items-center justify-center gap-3">
                Chat on WhatsApp
                <FontAwesomeIcon icon={faExternalLinkAlt} size="xs" />
              </Button>
            </a>
          </div>
        </Card>

        {/* Quick Info Card */}
        <Card className="p-8 bg-slate-900 text-white border-none shadow-xl">
          <FontAwesomeIcon icon={faShieldAlt} className="text-brand mb-4" size="xl" />
          <h3 className="font-syne font-bold mb-2">Security</h3>
          <p className="text-slate-400 text-xs font-dm leading-relaxed">
            MuniCircle uses University-grade Google encryption. We never store your passwords or private Muni credentials.
          </p>
          <hr className="my-6 border-slate-800" />
          <div className="flex items-center gap-3 text-brand">
            <FontAwesomeIcon icon={faUserGraduate} />
            <span className="text-[10px] font-black uppercase tracking-widest">Student Safe</span>
          </div>
        </Card>
      </div>

      {/* FAQ Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-syne font-black text-slate-900 flex items-center gap-3">
          <FontAwesomeIcon icon={faQuestionCircle} className="text-brand" />
          Frequently Asked
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
              <h4 className="font-syne font-bold text-slate-900 mb-2">{faq.q}</h4>
              <p className="text-slate-500 text-sm font-dm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-[10px] text-slate-400 mt-16 font-bold uppercase tracking-[0.2em]">
        MuniCircle v1.0 • Built for Munians
      </p>
    </div>
  );
};

export default HelpSupport;