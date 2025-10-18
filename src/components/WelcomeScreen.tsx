import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Starfield } from './Starfield';
import { Fireworks } from './Fireworks';

interface WelcomeScreenProps {
  onComplete: () => void;
}

export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const { user } = useAuth();
  const [displayedText, setDisplayedText] = useState('');
  const [showButton, setShowButton] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);

  const fullText = `Hi ${user?.username}...\nThank you for accepting the invite\nI'm really glad you're here.`;

  useEffect(() => {
    let currentIndex = 0;
    const typingSpeed = 60;

    const typeInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => {
          setShowFireworks(true);
          setTimeout(() => {
            setShowButton(true);
          }, 1000);
        }, 500);
      }
    }, typingSpeed);

    return () => clearInterval(typeInterval);
  }, [fullText]);

  const handleEnter = () => {
    setShowFireworks(true);
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-purple-950 to-black" />
      <Starfield />
      {showFireworks && <Fireworks />}

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-2xl">
          <div className="mb-12 text-6xl animate-pulse">
            🌙
          </div>

          <div className="space-y-4 mb-12">
            {displayedText.split('\n').map((line, index) => (
              <p
                key={index}
                className="text-3xl md:text-4xl font-light text-white tracking-wide leading-relaxed"
                style={{
                  textShadow: '0 0 20px rgba(255, 192, 203, 0.5)',
                  fontFamily: 'Quicksand, sans-serif'
                }}
              >
                {line}
              </p>
            ))}
            <span className="inline-block w-1 h-8 bg-pink-400 animate-pulse ml-1" />
          </div>

          {showButton && (
            <button
              onClick={handleEnter}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white text-xl font-semibold hover:shadow-2xl hover:shadow-pink-500/50 transition-all duration-500 hover:scale-110 animate-fade-in"
              style={{
                animation: 'fadeIn 1s ease-in'
              }}
            >
              Enter the Portal 💬
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-in;
        }
      `}</style>
    </div>
  );
}
