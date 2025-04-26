import { Code, Facebook, Linkedin, MessageCircle } from "lucide-react";

export const DeveloperInfo = () => {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2">
        <Code className="h-4 w-4 text-gray-500" />
        <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
          Developed by Mohammad Sabobeh
        </span>
      </div>
      <div className="flex items-center justify-center space-x-4 mt-2">
        <a 
          href="https://www.facebook.com/sameer.masood.1253" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-gray-600 hover:text-imeche-red transition-colors"
          aria-label="Developer Facebook"
          title="Mohammad Sabobeh"
        >
          <Facebook className="h-5 w-5" />
        </a>
        <a 
          href="https://www.linkedin.com/in/mohammadsabobeh/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-gray-600 hover:text-imeche-red transition-colors"
          aria-label="Developer LinkedIn"
          title="LinkedIn"
        >
          <Linkedin className="h-5 w-5" />
        </a>
        <a 
          href="https://wa.me/970569681560" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-gray-600 hover:text-imeche-red transition-colors"
          aria-label="Developer WhatsApp"
          title="WhatsApp"
        >
          <MessageCircle className="h-5 w-5" />
        </a>
      </div>
    </div>
  );
}; 