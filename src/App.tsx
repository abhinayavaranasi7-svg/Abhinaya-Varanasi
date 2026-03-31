/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';

// --- Constants ---
const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const GAME_SPEED = 100;

const PLAYLIST = [
  {
    id: 1,
    title: "ERR_0x1A: SYNTH_CORRUPTION",
    artist: "AI_NODE_77",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    id: 2,
    title: "MEM_LEAK_DETECTED",
    artist: "GHOST_IN_THE_SHELL",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    id: 3,
    title: "BUFFER_OVERFLOW",
    artist: "NULL_POINTER",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  }
];

// --- Snake Game Component ---
const SnakeGame = ({ onScoreChange }: { onScoreChange: (score: number) => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(true);

  const generateFood = useCallback((currentSnake: { x: number, y: number }[]) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      const isOnSnake = currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
      if (!isOnSnake) break;
    }
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    onScoreChange(0);
    setIsGameOver(false);
    setFood(generateFood(INITIAL_SNAKE));
    setIsPaused(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': 
        case 'w':
        case 'W':
          if (direction.y === 0) setDirection({ x: 0, y: -1 }); break;
        case 'ArrowDown': 
        case 's':
        case 'S':
          if (direction.y === 0) setDirection({ x: 0, y: 1 }); break;
        case 'ArrowLeft': 
        case 'a':
        case 'A':
          if (direction.x === 0) setDirection({ x: -1, y: 0 }); break;
        case 'ArrowRight': 
        case 'd':
        case 'D':
          if (direction.x === 0) setDirection({ x: 1, y: 0 }); break;
        case ' ': setIsPaused(prev => !prev); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  useEffect(() => {
    if (isGameOver || isPaused) return;

    const moveSnake = () => {
      const newHead = {
        x: (snake[0].x + direction.x + GRID_SIZE) % GRID_SIZE,
        y: (snake[0].y + direction.y + GRID_SIZE) % GRID_SIZE
      };

      // Check collision with self
      if (snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setIsGameOver(true);
        return;
      }

      const newSnake = [newHead, ...snake];

      // Check food
      if (newHead.x === food.x && newHead.y === food.y) {
        const newScore = score + 1;
        setScore(newScore);
        onScoreChange(newScore);
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      setSnake(newSnake);
    };

    const gameInterval = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(gameInterval);
  }, [snake, direction, food, isGameOver, isPaused, score, onScoreChange, generateFood]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = canvas.width / GRID_SIZE;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines (raw, pixelated feel)
    ctx.strokeStyle = '#003333';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvas.width, i * cellSize);
      ctx.stroke();
    }

    // Draw food (Magenta block)
    ctx.fillStyle = '#ff00ff';
    ctx.fillRect(
      food.x * cellSize + 1,
      food.y * cellSize + 1,
      cellSize - 2,
      cellSize - 2
    );

    // Draw snake (Cyan body, Magenta head)
    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#ffffff' : '#00ffff';
      ctx.fillRect(
        segment.x * cellSize + 1,
        segment.y * cellSize + 1,
        cellSize - 2,
        cellSize - 2
      );
    });
  }, [snake, food]);

  return (
    <div className="relative flex flex-col items-center w-full">
      <div className="w-full flex justify-between items-end mb-2 font-['Press_Start_2P'] text-xs text-[#ff00ff]">
        <span>[EXEC: SNAKE_PROTOCOL]</span>
        <span className="text-[#00ffff]">FRAGMENTS: {score.toString().padStart(3, '0')}</span>
      </div>
      
      <div className="relative border-4 border-[#ff00ff] bg-black p-1 screen-tear w-full max-w-[400px] aspect-square">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="w-full h-full block bg-black"
          style={{ imageRendering: 'pixelated' }}
        />
        
        {(isGameOver || isPaused) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10">
            {isGameOver ? (
              <div className="text-center">
                <h2 
                  className="text-2xl md:text-4xl font-['Press_Start_2P'] text-[#ff00ff] mb-6 glitch-text"
                  data-text="SYSTEM_FAILURE"
                >
                  SYSTEM_FAILURE
                </h2>
                <p className="text-[#00ffff] font-['VT323'] text-2xl mb-8">
                  DATA_CORRUPTED // SCORE: {score}
                </p>
                <button 
                  onClick={resetGame}
                  className="px-6 py-2 border-2 border-[#00ffff] text-[#00ffff] font-['Press_Start_2P'] text-xs hover:bg-[#00ffff] hover:text-black transition-none uppercase"
                >
                  [ REBOOT_SEQUENCE ]
                </button>
              </div>
            ) : (
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-['Press_Start_2P'] text-[#00ffff] mb-8 animate-pulse">
                  STANDBY_MODE
                </h2>
                <button 
                  onClick={() => setIsPaused(false)}
                  className="px-6 py-2 border-2 border-[#ff00ff] text-[#ff00ff] font-['Press_Start_2P'] text-xs hover:bg-[#ff00ff] hover:text-black transition-none uppercase"
                >
                  [ INITIATE ]
                </button>
                <p className="mt-6 text-[#00ffff]/50 font-['VT323'] text-xl">
                  AWAITING MANUAL OVERRIDE (SPACEBAR)
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-4 w-full max-w-[400px] flex justify-between font-['VT323'] text-xl text-[#00ffff]/70">
        <span>INPUT: ARROWS / WASD</span>
        <span>HALT: SPACE</span>
      </div>
    </div>
  );
};

// --- Music Player Component ---
const MusicPlayer = () => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const currentTrack = PLAYLIST[currentTrackIndex];

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % PLAYLIST.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + PLAYLIST.length) % PLAYLIST.length);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play();
    }
  }, [currentTrackIndex, isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      const p = (audio.currentTime / audio.duration) * 100;
      setProgress(p || 0);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', nextTrack);
    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', nextTrack);
    };
  }, []);

  return (
    <div className="w-full border-4 border-[#00ffff] bg-black p-6 relative crt-flicker">
      <div className="absolute -top-3 left-4 bg-black px-2 text-[#00ffff] font-['Press_Start_2P'] text-[10px]">
        AUDIO_SUBSYSTEM_V2
      </div>
      
      <audio ref={audioRef} src={currentTrack.url} />
      
      <div className="flex flex-col gap-6">
        <div className="border border-[#ff00ff] p-4 bg-[#ff00ff]/10">
          <h3 className="text-xl font-['VT323'] text-[#ff00ff] uppercase truncate mb-1">
            &gt; TRK: {currentTrack.title}
          </h3>
          <p className="text-lg font-['VT323'] text-[#00ffff] uppercase truncate">
            &gt; SRC: {currentTrack.artist}
          </p>
        </div>

        {/* Blocky Progress Bar */}
        <div className="h-4 border-2 border-[#00ffff] p-0.5 flex">
          <div 
            className="h-full bg-[#00ffff]" 
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between font-['Press_Start_2P'] text-xs">
          <button 
            onClick={prevTrack} 
            className="text-[#00ffff] hover:text-[#ff00ff] hover:bg-[#00ffff]/20 px-2 py-1"
          >
            [ &lt;&lt; ]
          </button>
          <button 
            onClick={togglePlay}
            className="text-[#ff00ff] hover:text-[#00ffff] hover:bg-[#ff00ff]/20 px-4 py-2 border-2 border-[#ff00ff] hover:border-[#00ffff]"
          >
            {isPlaying ? '[ PAUSE ]' : '[ PLAY ]'}
          </button>
          <button 
            onClick={nextTrack} 
            className="text-[#00ffff] hover:text-[#ff00ff] hover:bg-[#00ffff]/20 px-2 py-1"
          >
            [ &gt;&gt; ]
          </button>
        </div>
      </div>

      <div className="mt-8 border-t-2 border-[#00ffff]/30 pt-4">
        <h4 className="font-['Press_Start_2P'] text-[10px] text-[#ff00ff] mb-4">QUEUE_BUFFER:</h4>
        <div className="space-y-2 font-['VT323'] text-xl">
          {PLAYLIST.map((track, idx) => (
            <div 
              key={track.id} 
              className={`flex items-center gap-4 cursor-pointer hover:bg-[#00ffff]/20 p-1 ${currentTrackIndex === idx ? 'text-[#ff00ff] bg-[#ff00ff]/10' : 'text-[#00ffff]'}`}
              onClick={() => {
                setCurrentTrackIndex(idx);
                setIsPlaying(true);
              }}
            >
              <span>[{idx.toString().padStart(2, '0')}]</span>
              <span className="truncate">{track.title}</span>
              {currentTrackIndex === idx && <span className="ml-auto animate-pulse">_ACTIVE</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Main App ---
export default function App() {
  const [gameScore, setGameScore] = useState(0);

  return (
    <div className="min-h-screen bg-black text-[#00ffff] font-['VT323'] p-4 md:p-8 uppercase relative">
      {/* Global Effects */}
      <div className="scanlines" />
      <div className="static-noise" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <header className="border-b-4 border-[#ff00ff] pb-4 mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 
              className="text-4xl md:text-6xl font-['Press_Start_2P'] text-[#00ffff] glitch-text mb-2"
              data-text="NEON_SNAKE.EXE"
            >
              NEON_SNAKE.EXE
            </h1>
            <p className="text-[#ff00ff] text-2xl">
              &gt; STATUS: ONLINE // V.9.9.9_UNSTABLE
            </p>
          </div>
          <div className="text-right border-2 border-[#00ffff] p-2 bg-[#00ffff]/10">
            <p className="text-xl">TERMINAL_ID: 0x8F9A</p>
            <p className="text-xl animate-pulse">UPLINK_ESTABLISHED</p>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Game Section */}
          <section className="flex flex-col items-center w-full">
            <SnakeGame onScoreChange={setGameScore} />
          </section>

          {/* Music Section */}
          <section className="flex flex-col w-full max-w-md mx-auto lg:mx-0">
            <MusicPlayer />
            
            <div className="mt-8 border-2 border-[#ff00ff] p-4 bg-black crt-flicker">
              <h3 className="font-['Press_Start_2P'] text-[10px] text-[#00ffff] mb-2">SYSTEM_LOGS:</h3>
              <ul className="text-lg text-[#ff00ff] space-y-1 opacity-80">
                <li>&gt; INITIALIZING CORE... OK</li>
                <li>&gt; LOADING AUDIO_SUBSYSTEM... OK</li>
                <li>&gt; SNAKE_PROTOCOL INJECTED.</li>
                <li>&gt; AWAITING USER INPUT_</li>
              </ul>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="mt-16 border-t-2 border-[#00ffff]/30 pt-4 text-center text-xl text-[#00ffff]/50">
          &gt; END_OF_LINE // BUILT_WITH_AI_STUDIO
        </footer>
      </div>
    </div>
  );
}
