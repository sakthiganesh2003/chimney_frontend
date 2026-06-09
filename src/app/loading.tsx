export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">
      <div className="relative flex flex-col items-center gap-8">
        {/* Animated Rings */}
        <div className="relative w-24 h-24">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-4 border-t-purple-500 border-r-transparent border-b-purple-300 border-l-transparent animate-spin" style={{ animationDuration: '1.5s' }}></div>
          
          {/* Middle ring */}
          <div className="absolute inset-2 rounded-full border-4 border-t-transparent border-r-pink-500 border-b-transparent border-l-pink-300 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
          
          {/* Inner ring */}
          <div className="absolute inset-4 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-blue-300 border-l-transparent animate-spin" style={{ animationDuration: '2.5s' }}></div>
          
          {/* Center pulsing dot */}
          <div className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full shadow-lg"></div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent animate-pulse">
            ChimneyCare
          </h1>
          <div className="flex items-center gap-2 justify-center">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            <p className="text-sm text-gray-600 ml-2 animate-pulse">Loading amazing content...</p>
          </div>
        </div>

        {/* Animated progress dots */}
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-[pulse_1s_ease-in-out_infinite]"></div>
          <div className="w-2 h-2 rounded-full bg-pink-500 animate-[pulse_1s_ease-in-out_0.15s_infinite]"></div>
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-[pulse_1s_ease-in-out_0.3s_infinite]"></div>
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-[pulse_1s_ease-in-out_0.45s_infinite]"></div>
          <div className="w-2 h-2 rounded-full bg-pink-500 animate-[pulse_1s_ease-in-out_0.6s_infinite]"></div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
}