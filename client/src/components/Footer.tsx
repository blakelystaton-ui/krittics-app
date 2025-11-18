export function Footer() {
  return (
    <footer className="bg-[#0a0a0a] text-[#888] py-5 text-xs border-t border-[#222] mt-auto">
      <div className="max-w-7xl mx-auto px-5">
        <div className="flex flex-col gap-4">
          {/* Links Row */}
          <div className="flex flex-wrap gap-5 justify-center items-center">
            <a 
              href="/pages/privacy-policy.html" 
              className="text-[#888] hover:text-[#1ba9af] hover:underline transition-colors"
              data-testid="link-privacy-policy"
            >
              Privacy Policy
            </a>
            <span className="text-[#444] mx-1 hidden md:inline">|</span>
            
            <a 
              href="/pages/cookie-policy.html" 
              className="text-[#888] hover:text-[#1ba9af] hover:underline transition-colors"
              data-testid="link-cookie-policy"
            >
              Cookie Policy
            </a>
            <span className="text-[#444] mx-1 hidden md:inline">|</span>
            
            <a 
              href="/pages/terms-of-service.html" 
              className="text-[#888] hover:text-[#1ba9af] hover:underline transition-colors"
              data-testid="link-terms-of-service"
            >
              Terms of Service
            </a>
            <span className="text-[#444] mx-1 hidden md:inline">|</span>
            
            <a 
              href="/pages/privacy-policy.html#california-privacy-rights" 
              className="text-[#1ba9af] font-semibold hover:underline transition-colors"
              data-testid="link-privacy-choices"
            >
              Your Privacy Choices
            </a>
            <span className="text-[#444] mx-1 hidden md:inline">|</span>
            
            <a 
              href="/pages/privacy-policy.html#california-do-not-sell" 
              className="text-[#1ba9af] font-semibold hover:underline transition-colors"
              data-testid="link-do-not-sell"
            >
              Do Not Sell or Share My Personal Information
            </a>
          </div>
          
          {/* Copyright Row */}
          <div className="text-center text-[#666] mt-1">
            &copy; 2025 Krittics. All rights reserved. Based in Iowa, USA.
          </div>
        </div>
      </div>
    </footer>
  );
}
