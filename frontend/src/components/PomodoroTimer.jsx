import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Timer, 
  Pause, 
  Play, 
  RotateCcw, 
  AlertCircle, 
  Volume2, 
  VolumeX,
  SkipForward,
  SkipBack,
  Music,
  Shuffle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { habitApi } from '@/lib/api';
import { toast } from 'sonner';
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import { audioManager } from '@/lib/audioManager';

const TIMER_STATES = {
  POMODORO: 'pomodoro',
  SHORT_BREAK: 'break',
  LONG_BREAK: 'long-break'
};

const DEFAULT_TIMES = {
  [TIMER_STATES.POMODORO]: 25 * 60, // 25 minutes
  [TIMER_STATES.SHORT_BREAK]: 5 * 60, // 5 minutes
  [TIMER_STATES.LONG_BREAK]: 15 * 60 // 15 minutes
};

// Import audio files
const startSound = new URL('@/assets/sounds/start.mp3', import.meta.url).href;
const endSound = new URL('@/assets/sounds/complete.mp3', import.meta.url).href;
const tickSound = new URL('@/assets/sounds/tick.mp3', import.meta.url).href;

export default function PomodoroTimer({ selectedHabit }) {
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIMES[TIMER_STATES.POMODORO]);
  const [isActive, setIsActive] = useState(false);
  const [currentState, setCurrentState] = useState(TIMER_STATES.POMODORO);
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [interruptions, setInterruptions] = useState(0);
  const [showMusicControls, setShowMusicControls] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [volume, setVolume] = useState(audioManager.volume);
  const [isMuted, setIsMuted] = useState(audioManager.isMuted);
  const [isShuffled, setIsShuffled] = useState(audioManager.shuffle);

  const timerRef = useRef(null);
  const startAudioRef = useRef(new Audio(startSound));
  const endAudioRef = useRef(new Audio(endSound));
  const tickAudioRef = useRef(new Audio(tickSound));

  const { toast: useToastToast } = useToast();

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Save focus session to backend
  const saveFocusSession = useCallback(async (completed = true) => {
    if (!sessionStartTime) return;

    try {
      const endTime = new Date();
      const duration = Math.floor((endTime - sessionStartTime) / 1000 / 60); // Convert to minutes

      await habitApi.createFocusSession({
        userId: user._id,
        startTime: sessionStartTime,
        endTime,
        duration,
        habitId: selectedHabit?._id || null,
        type: currentState,
        completed,
        interruptions
      });

      // Reset interruptions for next session
      setInterruptions(0);
    } catch (error) {
      console.error('Error saving focus session:', error);
      toast.error('Failed to save focus session');
    }
  }, [sessionStartTime, user._id, selectedHabit, currentState, interruptions]);

  // Timer logic
  useEffect(() => {
    let interval = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Timer completed
      setIsActive(false);
      saveFocusSession();

      // Handle state transitions
      if (currentState === TIMER_STATES.POMODORO) {
        const newPomodorosCompleted = pomodorosCompleted + 1;
        setPomodorosCompleted(newPomodorosCompleted);
        
        if (newPomodorosCompleted % 4 === 0) {
          setCurrentState(TIMER_STATES.LONG_BREAK);
          setTimeLeft(DEFAULT_TIMES[TIMER_STATES.LONG_BREAK]);
        } else {
          setCurrentState(TIMER_STATES.SHORT_BREAK);
          setTimeLeft(DEFAULT_TIMES[TIMER_STATES.SHORT_BREAK]);
        }
      } else {
        setCurrentState(TIMER_STATES.POMODORO);
        setTimeLeft(DEFAULT_TIMES[TIMER_STATES.POMODORO]);
      }

      // Play notification sound
      new Audio('/notification.mp3').play().catch(() => {});
      toast.success(`${currentState === TIMER_STATES.POMODORO ? 'Time for a break!' : 'Break is over!'}`);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, currentState, pomodorosCompleted, saveFocusSession]);

  useEffect(() => {
    // Set audio volumes
    [startAudioRef, endAudioRef, tickAudioRef].forEach(ref => {
      if (ref.current) {
        ref.current.volume = isMuted ? 0 : volume;
      }
    });
  }, [volume, isMuted]);

  const playSound = (audioRef) => {
    if (!isMuted && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => console.error('Audio playback failed:', error));
    }
  };

  const toggleTimer = () => {
    if (!isActive) {
      setSessionStartTime(new Date());
      setIsActive(true);
      audioManager.playEffect('start');
      audioManager.startBackgroundMusic();
      setCurrentTrack(audioManager.getCurrentTrackInfo());
    } else {
      setIsActive(false);
      audioManager.playEffect('pause');
      audioManager.pauseBackgroundMusic();
    }
  };

  const resetTimer = () => {
    if (isActive) {
      saveFocusSession(false);
    }
    setIsActive(false);
    setTimeLeft(DEFAULT_TIMES[currentState]);
    setSessionStartTime(null);
    audioManager.playEffect('stop');
    audioManager.stopBackgroundMusic();
    setCurrentTrack(null);
  };

  const handleInterruption = () => {
    setInterruptions(prev => prev + 1);
    toast.info('Interruption recorded');
  };

  const startTimer = () => {
    if (!isActive) {
      setSessionStartTime(new Date());
      setIsActive(true);
      playSound(startAudioRef);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            completeSession();
            return 0;
          }
          if (prev % 60 === 0) { // Play tick sound every minute
            playSound(tickAudioRef);
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const pauseTimer = () => {
    clearInterval(timerRef.current);
    setIsActive(false);
    setInterruptions(prev => prev + 1);
  };

  const completeSession = async () => {
    clearInterval(timerRef.current);
    setIsActive(false);
    playSound(endAudioRef);

    if (user?.id) {
      try {
        await habitApi.saveFocusSession({
          userId: user.id,
          sessionType: currentState,
          duration: getInitialTime() - timeLeft,
          interruptions
        });

        useToastToast({
          title: "Session Complete!",
          description: `${currentState} session completed successfully`,
        });
      } catch (error) {
        useToastToast({
          title: "Error",
          description: "Failed to save session",
          variant: "destructive",
        });
      }
    }

    // Auto-switch to break after pomodoro
    if (currentState === TIMER_STATES.POMODORO) {
      resetTimer();
    }
  };

  const getInitialTime = () => {
    switch (currentState) {
      case TIMER_STATES.POMODORO: return 25 * 60;
      case TIMER_STATES.SHORT_BREAK: return 5 * 60;
      case TIMER_STATES.LONG_BREAK: return 15 * 60;
      default: return 25 * 60;
    }
  };

  // Update current track info
  useEffect(() => {
    const updateTrackInfo = () => {
      setCurrentTrack(audioManager.getCurrentTrackInfo());
    };

    // Update initially
    updateTrackInfo();

    // Set up an interval to update track info
    const interval = setInterval(updateTrackInfo, 1000);

    return () => {
      clearInterval(interval);
      audioManager.cleanup();
    };
  }, []);

  const handleVolumeChange = ([value]) => {
    const normalizedValue = value / 100;
    setVolume(normalizedValue);
    audioManager.setVolume(normalizedValue);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    audioManager.toggleMute();
  };

  const handleNextTrack = () => {
    audioManager.playNextTrack();
    setCurrentTrack(audioManager.getCurrentTrackInfo());
  };

  const handlePreviousTrack = () => {
    audioManager.playPreviousTrack();
    setCurrentTrack(audioManager.getCurrentTrackInfo());
  };

  const toggleShuffle = () => {
    setIsShuffled(!isShuffled);
    audioManager.toggleShuffle();
  };

  return (
    <Card className="w-full bg-black/50 border-wax-flower-200/20">
      <CardContent className="p-6 space-y-8">
        {/* Timer Type Controls */}
        <div className="flex justify-center gap-4">
          <Button
            variant={currentState === TIMER_STATES.POMODORO ? 'default' : 'outline'}
            onClick={() => {
              setCurrentState(TIMER_STATES.POMODORO);
              setTimeLeft(DEFAULT_TIMES[TIMER_STATES.POMODORO]);
            }}
            className={`${currentState === TIMER_STATES.POMODORO ? 'bg-[#FF4B2B] hover:bg-[#FF5C3D]' : 'text-[#FF4B2B] border-[#FF4B2B] hover:bg-[#FF4B2B]/10'}`}
          >
            Focus
          </Button>
          <Button
            variant={currentState === TIMER_STATES.SHORT_BREAK ? 'default' : 'outline'}
            onClick={() => {
              setCurrentState(TIMER_STATES.SHORT_BREAK);
              setTimeLeft(DEFAULT_TIMES[TIMER_STATES.SHORT_BREAK]);
            }}
            className={`${currentState === TIMER_STATES.SHORT_BREAK ? 'bg-[#FF4B2B] hover:bg-[#FF5C3D]' : 'text-[#FF4B2B] border-[#FF4B2B] hover:bg-[#FF4B2B]/10'}`}
          >
            Short Break
          </Button>
          <Button
            variant={currentState === TIMER_STATES.LONG_BREAK ? 'default' : 'outline'}
            onClick={() => {
              setCurrentState(TIMER_STATES.LONG_BREAK);
              setTimeLeft(DEFAULT_TIMES[TIMER_STATES.LONG_BREAK]);
            }}
            className={`${currentState === TIMER_STATES.LONG_BREAK ? 'bg-[#FF4B2B] hover:bg-[#FF5C3D]' : 'text-[#FF4B2B] border-[#FF4B2B] hover:bg-[#FF4B2B]/10'}`}
          >
            Long Break
          </Button>
        </div>

        {/* Timer Display */}
        <div className="text-center py-8">
          <h2 className="text-8xl font-mono font-bold text-[#FFB4A2]">
            {formatTime(timeLeft)}
          </h2>
        </div>

        {/* Main Controls */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={toggleTimer}
            size="icon"
            className={`w-12 h-12 ${isActive ? 'bg-[#FF4B2B]/20 text-[#FF4B2B]' : 'bg-[#FF4B2B] text-black'} hover:bg-[#FF5C3D]`}
          >
            {isActive ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>
          <Button
            onClick={resetTimer}
            size="icon"
            variant="outline"
            className="w-12 h-12 border-[#FF4B2B]/20 text-[#FF4B2B] hover:bg-[#FF4B2B]/10"
          >
            <RotateCcw className="h-6 w-6" />
          </Button>
          <Button
            onClick={handleInterruption}
            size="icon"
            variant="outline"
            disabled={!isActive}
            className="w-12 h-12 border-[#FF4B2B]/20 text-[#FF4B2B] hover:bg-[#FF4B2B]/10 disabled:opacity-50"
          >
            <AlertCircle className="h-6 w-6" />
          </Button>
        </div>

        {/* Music Controls */}
        <div className="space-y-4">
          {/* Track Info */}
          <div className="text-sm text-[#FFB4A2]/60 text-center">
            {currentTrack ? (
              <p>{currentTrack.title} - {currentTrack.artist}</p>
            ) : (
              <p>No track playing</p>
            )}
          </div>

          {/* Music Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleShuffle}
              className={`${isShuffled ? 'text-[#FF4B2B]' : 'text-[#FFB4A2]'} hover:text-[#FF4B2B]`}
            >
              <Shuffle className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePreviousTrack}
              disabled={!isActive}
              className="text-[#FFB4A2] hover:text-[#FF4B2B] disabled:opacity-50"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextTrack}
              disabled={!isActive}
              className="text-[#FFB4A2] hover:text-[#FF4B2B] disabled:opacity-50"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          {/* Volume Controls */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="text-[#FFB4A2] hover:text-[#FF4B2B]"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <div className="w-32">
              <Slider
                value={[volume * 100]}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className="[&_[role=slider]]:bg-[#FF4B2B] [&_[role=slider]]:border-[#FF4B2B] [&_[role=slider]]:hover:bg-[#FF5C3D]"
              />
            </div>
          </div>
        </div>

        {/* Session Info */}
        <div className="text-center text-[#FFB4A2]/60">
          <p>Pomodoros completed: {pomodorosCompleted}</p>
          {interruptions > 0 && (
            <p>Interruptions this session: {interruptions}</p>
          )}
          {selectedHabit && (
            <p className="mt-2">
              Current habit: {selectedHabit.name}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 