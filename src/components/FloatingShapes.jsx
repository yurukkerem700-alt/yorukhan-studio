import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Ocean Ambient Sound
const OceanAmbience = () => {
  useEffect(() => {
    let isPlaying = false;
    
    const startAudio = () => {
      if (isPlaying) return;
      isPlaying = true;
      
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        
        const rumbleOsc = ctx.createOscillator();
        const rumbleGain = ctx.createGain();
        const rumbleFilter = ctx.createBiquadFilter();
        
        rumbleOsc.type = 'sine';
        rumbleOsc.frequency.setValueAtTime(35, ctx.currentTime);
        rumbleFilter.type = 'lowpass';
        rumbleFilter.frequency.setValueAtTime(80, ctx.currentTime);
        rumbleGain.gain.setValueAtTime(0.03, ctx.currentTime);
        
        rumbleOsc.connect(rumbleFilter);
        rumbleFilter.connect(rumbleGain);
        rumbleGain.connect(ctx.destination);
        rumbleOsc.start();
        
      } catch (e) {
        console.log('Audio not supported');
      }
    };
    
    const handleClick = () => {
      startAudio();
      document.removeEventListener('click', handleClick);
    };
    
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);
  
  return null;
};

// Regular Sharks
const Shark = ({ size, startY, speed, direction, delay }) => (
  <motion.div
    className="fixed pointer-events-none z-0"
    initial={{ x: direction === 'right' ? -200 : 1800, y: startY }}
    animate={{
      x: [direction === 'right' ? -200 : 1800, direction === 'right' ? 1800 : -200],
      y: [startY, startY + 40, startY - 30, startY + 20, startY]
    }}
    transition={{
      x: { duration: speed, repeat: Infinity, ease: "linear", delay },
      y: { duration: speed / 2, repeat: Infinity, ease: "easeInOut", delay }
    }}
  >
    <svg width={size} height={size * 0.45} viewBox="0 0 200 90" style={{ transform: direction === 'left' ? 'scaleX(-1)' : '' }}>
      <defs>
        <linearGradient id={`shark-${size}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4a5568"/>
          <stop offset="50%" stopColor="#2d3748"/>
          <stop offset="100%" stopColor="#e2e8f0"/>
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="45" rx="85" ry="35" fill={`url(#shark-${size})`}/>
      <path d="M170 45 Q190 40, 200 45 Q190 50, 170 45" fill="#3d4852"/>
      <motion.path
        d="M15 45 Q-10 20, 5 30 Q0 45, 5 60 Q-10 70, 15 45"
        fill="#4a5568"
        animate={{ rotate: [0, 15, -15, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: '15px 45px' }}
      />
      <path d="M70 10 Q85 -5, 95 10" fill="#4a5568"/>
      <motion.path
        d="M90 70 Q80 90, 100 85"
        fill="#4a5568"
        animate={{ rotate: [0, 8, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ transformOrigin: '90px 70px' }}
      />
      <ellipse cx="175" cy="40" rx="6" ry="4" fill="#1a1a1a"/>
      <ellipse cx="176" cy="39" rx="3" ry="2" fill="white" opacity="0.8"/>
      <line x1="155" y1="35" x2="155" y2="55" stroke="#1a202c" strokeWidth="2" strokeOpacity="0.4"/>
      <line x1="160" y1="33" x2="160" y2="57" stroke="#1a202c" strokeWidth="2" strokeOpacity="0.4"/>
    </svg>
  </motion.div>
);

// Octopus
const Octopus = ({ size, startX, startY, speed }) => (
  <motion.div
    className="fixed pointer-events-none z-0"
    animate={{
      x: [startX, startX + 50, startX - 50, startX + 25, startX - 25, startX],
      y: [startY, startY - 40, startY - 70, startY - 40, startY - 80, startY]
    }}
    transition={{ duration: speed, repeat: Infinity, ease: "easeInOut" }}
  >
    <svg width={size} height={size * 1.2} viewBox="0 0 120 150">
      {[...Array(8)].map((_, i) => {
        const angle = (i * 45) * Math.PI / 180;
        const baseX = 60 + Math.cos(angle) * 25;
        const baseY = 70 + Math.sin(angle) * 20;
        return (
          <motion.path
            key={i}
            d={`M${baseX} ${baseY} Q${baseX + Math.cos(angle) * 30} ${baseY + 40}, ${baseX + Math.cos(angle) * 50} ${baseY + 80}`}
            stroke="#8b5cf6"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            opacity="0.25"
            animate={{
              d: [
                `M${baseX} ${baseY} Q${baseX + Math.cos(angle) * 30} ${baseY + 40}, ${baseX + Math.cos(angle) * 50} ${baseY + 80}`,
                `M${baseX} ${baseY} Q${baseX + Math.cos(angle) * 35} ${baseY + 50}, ${baseX + Math.cos(angle) * 55} ${baseY + 85}`,
                `M${baseX} ${baseY} Q${baseX + Math.cos(angle) * 30} ${baseY + 40}, ${baseX + Math.cos(angle) * 50} ${baseY + 80}`
              ]
            }}
            transition={{ duration: 2 + (i % 4) * 0.3, repeat: Infinity, ease: "easeInOut" }}
          />
        );
      })}
      <motion.ellipse cx="60" cy="55" rx="40" ry="35" fill="#8b5cf6" opacity="0.25" animate={{ scaleY: [1, 1.08, 1] }} transition={{ duration: 3, repeat: Infinity }}/>
      <ellipse cx="60" cy="35" rx="28" ry="22" fill="#8b5cf6" opacity="0.2"/>
      <ellipse cx="45" cy="50" rx="8" ry="6" fill="white" opacity="0.5"/>
      <ellipse cx="75" cy="50" rx="8" ry="6" fill="white" opacity="0.5"/>
      <circle cx="47" cy="49" r="3" fill="#1e293b"/>
      <circle cx="77" cy="49" r="3" fill="#1e293b"/>
    </svg>
  </motion.div>
);

// Jellyfish
const Jellyfish = ({ size, startX, speed, color }) => (
  <motion.div
    className="fixed pointer-events-none z-0"
    style={{ left: `${startX}%` }}
    animate={{
      y: [900, -250],
      x: [0, 25, -25, 15, -15, 0]
    }}
    transition={{
      y: { duration: speed, repeat: Infinity, ease: "linear" },
      x: { duration: 10, repeat: Infinity, ease: "easeInOut" }
    }}
  >
    <svg width={size} height={size * 1.6} viewBox="0 0 80 130">
      <motion.ellipse cx="40" cy="35" rx="35" ry="30" fill={color} opacity="0.15" animate={{ scaleY: [1, 1.12, 1] }} transition={{ duration: 2.5, repeat: Infinity }}/>
      <ellipse cx="40" cy="30" rx="28" ry="22" fill={color} opacity="0.1"/>
      <ellipse cx="40" cy="40" rx="18" ry="14" fill="white" opacity="0.08"/>
      {[...Array(10)].map((_, i) => (
        <motion.path
          key={i}
          d={`M${15 + i * 6} 60 Q${20 + i * 6} ${90 + (i % 3) * 15}, ${12 + i * 5} 120`}
          stroke={color}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          opacity="0.2"
          animate={{
            d: [
              `M${15 + i * 6} 60 Q${20 + i * 6} ${90 + (i % 3) * 15}, ${12 + i * 5} 120`,
              `M${15 + i * 6} 60 Q${25 + i * 6} ${100 + (i % 3) * 10}, ${18 + i * 5} 125`,
              `M${15 + i * 6} 60 Q${20 + i * 6} ${90 + (i % 3) * 15}, ${12 + i * 5} 120`
            ]
          }}
          transition={{ duration: 2 + (i % 4) * 0.4, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </svg>
  </motion.div>
);

// Fish School
const FishSchool = ({ count, startX, startY, color, speed }) => (
  <motion.div
    className="fixed pointer-events-none z-0"
    animate={{
      x: [startX, startX + 500],
      y: [startY, startY - 30, startY + 20, startY]
    }}
    transition={{
      x: { duration: speed, repeat: Infinity, ease: "linear" },
      y: { duration: speed / 2, repeat: Infinity, ease: "easeInOut" }
    }}
  >
    {[...Array(count)].map((_, i) => (
      <motion.div
        key={i}
        style={{ position: 'absolute', left: (i % 5) * 25, top: Math.floor(i / 5) * 15 }}
        animate={{ y: [0, Math.sin(i) * 10, 0] }}
        transition={{ duration: 2 + (i % 3), repeat: Infinity, ease: "easeInOut" }}
      >
        <svg width="22" height="12" viewBox="0 0 44 24">
          <ellipse cx="22" cy="12" rx="18" ry="10" fill={color} opacity="0.18"/>
          <path d="M40 12 L44 6 L44 18 Z" fill={color} opacity="0.12"/>
          <circle cx="10" cy="10" r="2" fill={color} opacity="0.3"/>
        </svg>
      </motion.div>
    ))}
  </motion.div>
);

// Bubbles
const Bubble = ({ size, x, delay }) => (
  <motion.div
    className="absolute rounded-full border border-cyan-400/15 bg-cyan-400/5"
    style={{ width: size, height: size, left: `${x}%`, bottom: -30 }}
    animate={{
      y: [0, -900],
      opacity: [0, 0.5, 0.5, 0],
      scale: [0.4, 1, 1, 0.7]
    }}
    transition={{ duration: 18 + Math.random() * 12, repeat: Infinity, delay, ease: "linear" }}
  />
);

// Seaweed
const Seaweed = ({ x, height, delay }) => (
  <motion.div
    className="absolute bottom-0 w-1.5 bg-gradient-to-t from-green-500/20 via-green-500/10 to-transparent rounded-full"
    style={{ left: `${x}%`, height: `${height}px` }}
    animate={{ skewX: [-8, 8, -8], scaleY: [1, 1.05, 1] }}
    transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, ease: "easeInOut", delay }}
  />
);

export default function FloatingShapes() {
  const [bubbles, setBubbles] = useState([]);

  useEffect(() => {
    setBubbles(Array.from({ length: 20 }, (_, i) => ({
      id: i,
      size: 5 + Math.random() * 18,
      x: Math.random() * 100,
      delay: Math.random() * 18
    })));
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <OceanAmbience />
      
      {/* Water gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/95 to-blue-950/90" />
      
      {/* Light rays */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-[5%] w-36 h-full bg-gradient-to-b from-cyan-400/8 to-transparent transform -skew-x-12" />
        <div className="absolute top-0 left-[22%] w-28 h-full bg-gradient-to-b from-blue-400/6 to-transparent transform -skew-x-12" />
        <div className="absolute top-0 left-[42%] w-44 h-full bg-gradient-to-b from-cyan-300/7 to-transparent transform -skew-x-12" />
        <div className="absolute top-0 left-[68%] w-32 h-full bg-gradient-to-b from-blue-300/6 to-transparent transform -skew-x-12" />
        <div className="absolute top-0 left-[88%] w-40 h-full bg-gradient-to-b from-cyan-400/5 to-transparent transform -skew-x-12" />
      </div>

      {/* Sharks */}
      {[
        { size: 130, startY: 280, speed: 38, direction: 'right', delay: 0 },
        { size: 100, startY: 450, speed: 45, direction: 'left', delay: 10 },
        { size: 75, startY: 620, speed: 52, direction: 'right', delay: 18 },
        { size: 110, startY: 350, speed: 48, direction: 'left', delay: 25 },
        { size: 85, startY: 550, speed: 55, direction: 'right', delay: 5 },
        { size: 60, startY: 700, speed: 42, direction: 'left', delay: 15 },
      ].map((shark, i) => (
        <Shark key={i} {...shark} />
      ))}

      {/* Octopuses */}
      {[
        { size: 100, startX: 80, startY: 500, speed: 20 },
        { size: 80, startX: 1200, startY: 650, speed: 24 },
      ].map((octopus, i) => (
        <Octopus key={i} {...octopus} />
      ))}

      {/* Jellyfish */}
      {[
        { size: 55, startX: 10, speed: 35, color: '#c084fc' },
        { size: 70, startX: 30, speed: 40, color: '#f472b6' },
        { size: 45, startX: 55, speed: 30, color: '#22d3ee' },
        { size: 60, startX: 80, speed: 38, color: '#a78bfa' },
      ].map((jf, i) => (
        <Jellyfish key={i} {...jf} />
      ))}

      {/* Fish Schools */}
      {[
        { count: 12, startX: 100, startY: 320, color: '#22d3ee', speed: 30 },
        { count: 8, startX: 300, startY: 480, color: '#c084fc', speed: 35 },
        { count: 10, startX: 200, startY: 600, color: '#f472b6', speed: 28 },
      ].map((school, i) => (
        <FishSchool key={i} {...school} />
      ))}

      {/* Bubbles */}
      {bubbles.map(bubble => (
        <Bubble key={bubble.id} {...bubble} />
      ))}

      {/* Seaweed */}
      {[6, 11, 18, 28, 35, 48, 58, 72, 82, 92].map((pos, i) => (
        <Seaweed key={i} x={pos} height={50 + Math.random() * 60} delay={i * 0.3} />
      ))}
    </div>
  );
}