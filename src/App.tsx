import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Group3 from './imports/Group3';

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface Paddle {
  x: number;
  width: number;
  height: number;
  y: number;
}

interface Block {
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
  color: string;
  row: number;
  col: number;
  hit: boolean;
}

interface Particle {
  id: string;
  x: number;
  y: number;
  timestamp: number;
}

const GAME_WIDTH = 920;
const GAME_HEIGHT = 560;
const PADDLE_SPEED = 12;
const POINTS_PER_BLOCK = 20;
const EXTRA_BALL_THRESHOLD = 1000;
const INITIAL_BALLS = 5;

const INITIAL_BALL_STATE = {
  x: 221.5,
  y: 473.5,
  vx: 4.5,
  vy: -4.5,
  radius: 12.5
};

// Calculate block positions based on grid layout
const createInitialBlocks = (): Block[] => {
  const blocks: Block[] = [];
  
  // Column x positions and widths
  const cols = [
    { x: 0, width: 102 },
    { x: 102, width: 102 },
    { x: 204, width: 103 },
    { x: 307, width: 102 },
    { x: 409, width: 102 },
    { x: 511, width: 102 },
    { x: 613, width: 103 },
    { x: 716, width: 102 },
    { x: 818, width: 102 }
  ];
  
  // Row y positions and heights (starting from top=41)
  const rows = [
    { y: 41, height: 25, color: '#49a4fe' },   // Row 1
    { y: 66, height: 26, color: '#49a4fe' },   // Row 2
    { y: 92, height: 25, color: '#49a4fe' },   // Row 3
    { y: 117, height: 25, color: '#b649fe' },  // Row 4
    { y: 142, height: 26, color: '#b649fe' },  // Row 5
    { y: 168, height: 25, color: '#b649fe' },  // Row 6
    { y: 193, height: 25, color: '#fe49ef' },  // Row 7
    { y: 218, height: 26, color: '#fe49ef' },  // Row 8
    { y: 244, height: 25, color: '#fe49ef' }   // Row 9
  ];
  
  // Create all blocks
  rows.forEach((row, rowIndex) => {
    cols.forEach((col, colIndex) => {
      blocks.push({
        x: col.x,
        y: row.y,
        width: col.width,
        height: row.height,
        visible: true,
        color: row.color,
        row: rowIndex,
        col: colIndex,
        hit: false
      });
    });
  });
  
  return blocks;
};

const INITIAL_BLOCKS_STATE = createInitialBlocks();

export default function App() {
  const [ball, setBall] = useState<Ball>(INITIAL_BALL_STATE);

  const [paddle, setPaddle] = useState<Paddle>({
    x: 173,
    width: 97,
    height: 6,
    y: 486
  });

  const [blocks, setBlocks] = useState<Block[]>(INITIAL_BLOCKS_STATE);

  const [keysPressed, setKeysPressed] = useState<{ [key: string]: boolean }>({});
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [ballsLeft, setBallsLeft] = useState(INITIAL_BALLS);
  const [gameOver, setGameOver] = useState(false);
  const [lastBonusThreshold, setLastBonusThreshold] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        setKeysPressed(prev => ({ ...prev, [e.key]: true }));
        if (!gameStarted) setGameStarted(true);
      }
      
      // Toggle pause on Enter when game is active
      if (e.key === 'Enter' && gameStarted && !gameWon) {
        e.preventDefault();
        setGamePaused(prev => !prev);
      }
      
      // Reset game on Enter when won
      if (e.key === 'Enter' && gameWon) {
        e.preventDefault();
        setBlocks(INITIAL_BLOCKS_STATE);
        setBall(INITIAL_BALL_STATE);
        setGameStarted(false);
        setGameWon(false);
        setGamePaused(false);
        setScore(0);
        setBallsLeft(INITIAL_BALLS);
        setGameOver(false);
        setLastBonusThreshold(0);
        setParticles([]);
      }
      
      // Reset game on Enter when game over
      if (e.key === 'Enter' && gameOver) {
        e.preventDefault();
        setBlocks(INITIAL_BLOCKS_STATE);
        setBall(INITIAL_BALL_STATE);
        setGameStarted(false);
        setGameWon(false);
        setGamePaused(false);
        setScore(0);
        setBallsLeft(INITIAL_BALLS);
        setGameOver(false);
        setLastBonusThreshold(0);
        setParticles([]);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        setKeysPressed(prev => ({ ...prev, [e.key]: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameStarted, gameWon]);

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameWon || gamePaused) return;

    const gameLoop = () => {
      // Move paddle
      setPaddle(prev => {
        let newX = prev.x;
        if (keysPressed['ArrowLeft']) {
          newX = Math.max(0, prev.x - PADDLE_SPEED);
        }
        if (keysPressed['ArrowRight']) {
          newX = Math.min(GAME_WIDTH - prev.width, prev.x + PADDLE_SPEED);
        }
        return { ...prev, x: newX };
      });

      // Move ball and check collisions
      setBall(prev => {
        let newX = prev.x + prev.vx;
        let newY = prev.y + prev.vy;
        let newVx = prev.vx;
        let newVy = prev.vy;

        // Wall collisions (left and right)
        if (newX - prev.radius <= 0 || newX + prev.radius >= GAME_WIDTH) {
          newVx = -newVx;
          newX = prev.x + newVx;
        }

        // Top wall collision
        if (newY - prev.radius <= 0) {
          newVy = -newVy;
          newY = prev.y + newVy;
        }

        // Bottom wall (reset ball and pause)
        if (newY + prev.radius >= GAME_HEIGHT) {
          setGameStarted(false);
          setBallsLeft(prevBalls => prevBalls - 1);
          if (ballsLeft <= 1) {
            setGameOver(true);
          }
          return INITIAL_BALL_STATE;
        }

        // Block collisions - check before updating position
        let hitBlock = false;
        blocks.forEach(block => {
          if (!block.visible || hitBlock) return;

          const blockLeft = block.x;
          const blockRight = block.x + block.width;
          const blockTop = block.y;
          const blockBottom = block.y + block.height;

          // Check if ball intersects with block
          const closestX = Math.max(blockLeft, Math.min(newX, blockRight));
          const closestY = Math.max(blockTop, Math.min(newY, blockBottom));

          const distanceX = newX - closestX;
          const distanceY = newY - closestY;
          const distanceSquared = distanceX * distanceX + distanceY * distanceY;

          if (distanceSquared < prev.radius * prev.radius) {
            hitBlock = true;

            // Calculate overlap to determine bounce direction
            const overlapLeft = (newX + prev.radius) - blockLeft;
            const overlapRight = blockRight - (newX - prev.radius);
            const overlapTop = (newY + prev.radius) - blockTop;
            const overlapBottom = blockBottom - (newY - prev.radius);

            const minOverlapX = Math.min(overlapLeft, overlapRight);
            const minOverlapY = Math.min(overlapTop, overlapBottom);

            // Bounce based on smallest overlap
            if (minOverlapX < minOverlapY) {
              // Hit from left or right
              newVx = -newVx;
              if (overlapLeft < overlapRight) {
                newX = blockLeft - prev.radius;
              } else {
                newX = blockRight + prev.radius;
              }
            } else {
              // Hit from top or bottom
              newVy = -newVy;
              if (overlapTop < overlapBottom) {
                newY = blockTop - prev.radius;
              } else {
                newY = blockBottom + prev.radius;
              }
            }

            // Remove the block
            setBlocks(prevBlocks => 
              prevBlocks.map(b => 
                b === block ? { ...b, visible: false, hit: true } : b
              )
            );
            
            // Create particle at block center
            const particleId = `particle-${Date.now()}-${Math.random()}`;
            setParticles(prev => [...prev, {
              id: particleId,
              x: block.x + block.width / 2,
              y: block.y + block.height / 2,
              timestamp: Date.now()
            }]);
            
            // Remove particle after 250ms
            setTimeout(() => {
              setParticles(prev => prev.filter(p => p.id !== particleId));
            }, 250);
            
            setScore(prevScore => prevScore + POINTS_PER_BLOCK);
            if (score >= lastBonusThreshold + EXTRA_BALL_THRESHOLD) {
              setBallsLeft(prevBalls => prevBalls + 1);
              setLastBonusThreshold(score);
            }
          }
        });

        // Paddle collision
        const paddleLeft = paddle.x;
        const paddleRight = paddle.x + paddle.width;
        const paddleTop = paddle.y;

        if (
          newY + prev.radius >= paddleTop &&
          prev.y + prev.radius <= paddleTop &&
          newX >= paddleLeft &&
          newX <= paddleRight
        ) {
          newVy = -Math.abs(newVy);
          newY = paddleTop - prev.radius;
          
          // Add angle based on where ball hits paddle
          const hitPos = (newX - paddleLeft) / paddle.width;
          newVx = (hitPos - 0.5) * 9;
        }

        return {
          x: newX,
          y: newY,
          vx: newVx,
          vy: newVy,
          radius: prev.radius
        };
      });
    };

    const intervalId = setInterval(gameLoop, 1000 / 60);
    return () => clearInterval(intervalId);
  }, [gameStarted, gameWon, gamePaused, keysPressed, paddle, blocks, score, ballsLeft]);

  // Check win condition
  useEffect(() => {
    const allBlocksDestroyed = blocks.every(block => !block.visible);
    if (allBlocksDestroyed && gameStarted && !gameWon) {
      setGameWon(true);
      setGameStarted(false);
      if (score > highScore) {
        setHighScore(score);
      }
    }
  }, [blocks, gameStarted, gameWon, score, highScore]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="relative" style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}>
        {/* Frame */}
        <div className="absolute bg-white h-[560px] left-0 top-0 w-[920px]" data-name="frame" />
        
        {/* Blocks */}
        <div className="absolute h-[228px] left-0 top-[41px] w-[920px]" data-name="blocks">
          {blocks.map((block, index) => (
            block.visible && (
              <motion.div
                key={index}
                className="absolute"
                initial={{ scale: 1 }}
                animate={block.hit ? { scale: 0 } : { scale: 1 }}
                transition={{ duration: 0.2 }}
                style={{
                  left: block.x,
                  top: block.y - 41,
                  width: block.width,
                  height: block.height,
                  backgroundColor: block.color
                }}
                data-name="block"
              >
                <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none" />
              </motion.div>
            )
          ))}
        </div>
        
        {/* Particles */}
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            className="absolute pointer-events-none"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.15 }}
            style={{
              left: particle.x - 22,
              top: particle.y - 20,
              width: 44,
              height: 41
            }}
          >
            <Group3 />
          </motion.div>
        ))}

        {/* Ball */}
        <div
          className="absolute"
          style={{
            left: ball.x - ball.radius,
            top: ball.y - ball.radius,
            width: ball.radius * 2,
            height: ball.radius * 2
          }}
          data-name="ball"
        >
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25 25">
            <circle cx="12.5" cy="12.5" fill="#29E151" r="12.5" />
          </svg>
        </div>

        {/* Paddle */}
        <div
          className="absolute bg-[#ffc629] h-[6px] rounded-[5px]"
          style={{
            left: paddle.x,
            top: paddle.y,
            width: paddle.width
          }}
          data-name="paddle"
        />

        {/* Instructions */}
        {!gameStarted && !gameWon && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/70 text-white px-4 py-2 rounded">
              Press Arrow Keys to Start
            </div>
          </div>
        )}

        {/* Pause Message */}
        {gamePaused && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/70 text-white px-4 py-2 rounded">
              PAUSED - Press Enter to Resume
            </div>
          </div>
        )}

        {/* Win Message */}
        {gameWon && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="bg-black/70 text-white px-6 py-4 rounded text-center">
              <div className="mb-2">YOU WIN!</div>
              <div className="text-sm">Press Enter to play again.</div>
            </div>
          </div>
        )}

        {/* Game Over Message */}
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="bg-black/70 text-white px-6 py-4 rounded text-center">
              <div className="mb-2">GAME OVER!</div>
              <div className="text-sm">Press Enter to play again.</div>
            </div>
          </div>
        )}

        {/* Score and Balls Left */}
        <div className="absolute top-2 left-0 w-full flex justify-between px-4 text-black">
          <div className="flex gap-8">
            <div>SCORE: {score}</div>
            <div>HIGH SCORE: {highScore}</div>
          </div>
          <div>x {ballsLeft}</div>
        </div>
      </div>
    </div>
  );
}