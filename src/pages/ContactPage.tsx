
import { useEffect } from "react";
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

const ContactPage = () => {
  const { toast } = useToast();
  
  useEffect(() => {
    document.title = "Contact Us | Nassar Watches";
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, you would handle form submission here
    // For now, we'll just show a toast notification
    toast({
      title: "Message Sent",
      description: "Thank you for your message. We'll respond shortly.",
    });
    
    // Reset the form
    (e.target as HTMLFormElement).reset();
  };
  
  const openWhatsApp = () => {
    window.open("https://wa.me/970595858691", "_blank");
  };

  return (
    <div className="min-h-screen flex flex-col bg-luxury-cream">
      <Navbar />
      
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-playfair font-bold text-luxury-black mb-8 text-center">
            Contact <span className="text-gold">Us</span>
          </h1>
          
          <div className="flex flex-col lg:flex-row gap-8 mb-12">
            {/* Contact Info */}
            <div className="lg:w-1/3">
              <div className="bg-white p-6 rounded-lg shadow-sm h-full">
                <h2 className="text-2xl font-playfair font-semibold text-luxury-black mb-6">
                  Get in Touch
                </h2>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gold/10 rounded-full mr-4">
                      <Phone className="text-gold" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-luxury-black mb-1">Phone</h3>
                      <p className="text-luxury-charcoal/80">+970-59-585-8691</p>
                      <button 
                        onClick={openWhatsApp}
                        className="text-sm text-gold hover:underline mt-1 flex items-center"
                      >
                        <Send size={14} className="mr-1" />
                        Message on WhatsApp
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gold/10 rounded-full mr-4">
                      <Mail className="text-gold" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-luxury-black mb-1">Email</h3>
                      <a href="mailto:info@nassarwatches.com" className="text-luxury-charcoal/80 hover:text-gold">
                        info@nassarwatches.com
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gold/10 rounded-full mr-4">
                      <MapPin className="text-gold" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-luxury-black mb-1">Location</h3>
                      <p className="text-luxury-charcoal/80">
                        Al-Remal, Gaza
                        <br />
                        Palestine
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gold/10 rounded-full mr-4">
                      <Clock className="text-gold" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-luxury-black mb-1">Business Hours</h3>
                      <p className="text-luxury-charcoal/80">
                        Monday - Friday: 9am to 6pm
                        <br />
                        Saturday: 10am to 4pm
                        <br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <div className="lg:w-2/3">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-2xl font-playfair font-semibold text-luxury-black mb-6">
                  Send Us a Message
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-luxury-charcoal mb-1">
                        Your Name
                      </label>
                      <Input
                        id="name"
                        type="text"
                        required
                        className="w-full"
                        placeholder="John Doe"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-luxury-charcoal mb-1">
                        Email Address
                      </label>
                      <Input
                        id="email"
                        type="email"
                        required
                        className="w-full"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-luxury-charcoal mb-1">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      type="text"
                      required
                      className="w-full"
                      placeholder="How can we help you?"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-luxury-charcoal mb-1">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      required
                      className="w-full min-h-[150px]"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>
                  
                  <div>
                    <Button
                      type="submit"
                      className="w-full sm:w-auto bg-gold hover:bg-gold/90 text-white"
                    >
                      Send Message
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          
          {/* Embedded Map */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d27347.772747681814!2d34.44121503443908!3d31.516429252235802!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14fd7f054e542767%3A0x7ff98dc913046392!2sAl-Remal%2C%20Gaza!5e0!3m2!1sen!2s!4v1704012345678!5m2!1sen!2s"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Nassar Watches Location"
              className="rounded"
            ></iframe>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ContactPage;
