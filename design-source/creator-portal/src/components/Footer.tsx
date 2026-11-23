import { Camera, Instagram, Twitter, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer id="main-footer" className="py-16 px-6 md:px-12 bg-background border-t border-border">
      <div id="footer-top" className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div id="footer-logo" className="flex items-center gap-2 text-2xl font-medium tracking-tighter">
          <Camera id="footer-logo-icon" className="w-6 h-6" />
          <span id="footer-logo-text">cabmora.</span>
        </div>
        
        <div id="footer-socials" className="flex gap-6 text-muted-foreground">
          <a id="social-instagram" href="/" className="hover:text-foreground transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Instagram">
            <Instagram className="w-5 h-5" />
          </a>
          <a id="social-twitter" href="/" className="hover:text-foreground transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Twitter">
            <Twitter className="w-5 h-5" />
          </a>
          <a id="social-email" href="/" className="hover:text-foreground transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Email">
            <Mail className="w-5 h-5" />
          </a>
        </div>
      </div>
      <div id="footer-bottom" className="max-w-7xl mx-auto mt-12 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Cabmora Photography. All rights reserved.
      </div>
    </footer>
  );
}
