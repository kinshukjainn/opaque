import { KeyRound, ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-[#1f1f1f] bg-[#050505] py-10 text-sm text-gray-400">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex flex-col items-center justify-between gap-8 sm:flex-row sm:items-start">
          {/* Brand & Security Badge */}
          <div className="flex flex-col items-center gap-3 sm:items-start">
            <div className="flex items-center gap-2 font-bold text-gray-100 text-[15px]">
              <KeyRound className="h-5 w-5 text-[#0078D4]" />
              <span>EndVault</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-green-900/50 bg-green-950/30 px-2.5 py-1 text-[12px] font-medium text-green-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>End-to-End Encrypted</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-[13px]">
            <a href="#" className="hover:text-gray-100 transition-colors">
              Security Whitepaper
            </a>
            <a href="#" className="hover:text-gray-100 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-gray-100 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-gray-100 transition-colors">
              Support
            </a>
          </div>

          {/* Socials & Copyright */}
          <div className="flex flex-col items-center gap-4 sm:items-end">
            <div className="flex gap-4">
              <a
                href="#"
                className="text-gray-500 hover:text-gray-100 transition-colors"
              >
                <span className="sr-only">GitHub</span>
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-gray-100 transition-colors"
              >
                <span className="sr-only">Twitter</span>
              </a>
            </div>
            <p className="text-[12px] text-gray-600">
              &copy; {new Date().getFullYear()} Vault. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
