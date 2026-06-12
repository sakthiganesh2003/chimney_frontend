export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">
      <div className="relative">
        <svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          {/* Rotating ring */}
          <circle 
            cx="40" 
            cy="40" 
            r="35" 
            fill="none" 
            stroke="#4a9ba8" 
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="220"
            strokeDashoffset="55"
            className="animate-spin-svg"
          />
          
          {/* Minimalist Wrench */}
          <g transform="translate(40, 40)">
            {/* Handle */}
            <rect x="-3" y="-12" width="6" height="28" rx="2" fill="#e8a020" />
            {/* Wrench head - open end */}
            <path d="M-8,-14 L-3,-12 L3,-12 L8,-14 L6,-18 L-6,-18 Z" fill="#e8a020" />
            {/* Circle detail */}
            <circle cx="0" cy="8" r="3" fill="#4a9ba8" />
          </g>
        </svg>
      </div>
      
      <p className="mt-6 text-[#4a9ba8] font-medium text-sm">Loading...</p>

      <style>{`
        @keyframes spin-svg {
          to { transform: rotate(360deg); }
        }
        .animate-spin-svg {
          animation: spin-svg 1.2s linear infinite;
          transform-origin: 40px 40px;
        }
      `}</style>
    </div>
  );
}