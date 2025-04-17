
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Clock, Award, Check, Star } from "lucide-react";

const AboutPage = () => {
  useEffect(() => {
    document.title = "About Us | Nassar Watches";
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-luxury-cream">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-white py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
                <h1 className="text-4xl font-playfair font-bold text-luxury-black mb-4">
                  About <span className="text-gold">Nassar Watches</span>
                </h1>
                <p className="text-luxury-charcoal/80 mb-6">
                  Welcome to Nassar Watches, where elegance meets precision. Since our inception,
                  we have been dedicated to offering exceptional timepieces that combine artistry,
                  craftsmanship and innovation. Our passion for horology drives us to curate collections
                  that appeal to watch enthusiasts and discerning individuals alike.
                </p>
                <p className="text-luxury-charcoal/80">
                  Each watch in our collection represents our commitment to quality and attention to detail.
                  We believe a timepiece is more than just an accessory – it's an expression of personal style,
                  a mark of achievement, and a companion for life's most significant moments.
                </p>
              </div>
              <div className="md:w-1/2">
                <img 
                  src="https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?q=80&w=1920&auto=format&fit=crop" 
                  alt="Luxury Watch Craftsmanship" 
                  className="w-full h-auto rounded-lg shadow-md"
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* Our Values */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-playfair font-bold text-luxury-black text-center mb-12">
              Our <span className="text-gold">Values</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gold/10 rounded-full mb-4">
                  <Clock className="text-gold" size={28} />
                </div>
                <h3 className="text-xl font-playfair font-bold text-luxury-black mb-3">Quality</h3>
                <p className="text-luxury-charcoal/80">
                  We source only the finest timepieces, ensuring each watch meets our rigorous standards
                  for precision, durability, and craftsmanship.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gold/10 rounded-full mb-4">
                  <Award className="text-gold" size={28} />
                </div>
                <h3 className="text-xl font-playfair font-bold text-luxury-black mb-3">Authenticity</h3>
                <p className="text-luxury-charcoal/80">
                  Every watch in our collection is guaranteed authentic, sourced directly from authorized
                  dealers or trusted partners in the luxury watch industry.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gold/10 rounded-full mb-4">
                  <Check className="text-gold" size={28} />
                </div>
                <h3 className="text-xl font-playfair font-bold text-luxury-black mb-3">Integrity</h3>
                <p className="text-luxury-charcoal/80">
                  We operate with complete transparency, providing detailed information about each timepiece
                  and offering fair pricing throughout our collections.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gold/10 rounded-full mb-4">
                  <Star className="text-gold" size={28} />
                </div>
                <h3 className="text-xl font-playfair font-bold text-luxury-black mb-3">Excellence</h3>
                <p className="text-luxury-charcoal/80">
                  We strive for excellence in every aspect of our business, from curating our collections
                  to providing exceptional customer service and support.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Our Story */}
        <section className="bg-white py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-playfair font-bold text-luxury-black text-center mb-8">
              Our <span className="text-gold">Story</span>
            </h2>
            
            <div className="max-w-3xl mx-auto">
              <p className="text-luxury-charcoal/80 mb-6">
                Founded with a passion for exceptional timepieces, Nassar Watches began as a small boutique
                catering to watch enthusiasts seeking unique and distinguished watches. Our founder's appreciation
                for horological craftsmanship and design excellence laid the foundation for what would become
                a trusted destination for discerning watch collectors.
              </p>
              
              <p className="text-luxury-charcoal/80 mb-6">
                Over the years, we've expanded our collections while maintaining our commitment to quality and authenticity.
                We've cultivated relationships with renowned watchmakers and brands, allowing us to offer an
                exclusive selection of timepieces that represent the pinnacle of watch craftsmanship.
              </p>
              
              <p className="text-luxury-charcoal/80">
                Today, Nassar Watches continues to be guided by the same principles that inspired its creation.
                We remain dedicated to connecting watch enthusiasts with exceptional timepieces that inspire and delight,
                providing knowledgeable guidance and impeccable service along the way.
              </p>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default AboutPage;
