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
  Shuffle,
  Clock,
  Settings
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { habitApi } from '@/lib/api';
import { toast } from 'sonner';
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import { audioManager } from '@/lib/audioManager';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const TIMER_STATES = {
  POMODORO: 'pomodoro',
  SHORT_BREAK: 'break',
  LONG_BREAK: 'long-break'
};

const PRESET_DURATIONS = [
  { label: '15 min', value: 15 },
  { label: '25 min', value: 25 },
  { label: '45 min', value: 45 },
  { label: '60 min', value: 60 },
];

const DEFAULT_TIMES = {
  [TIMER_STATES.POMODORO]: 25 * 60, // 25 minutes
  [TIMER_STATES.SHORT_BREAK]: 5 * 60, // 5 minutes
  [TIMER_STATES.LONG_BREAK]: 15 * 60 // 15 minutes
};

export default function PomodoroTimer({ selectedHabit, onSessionComplete }) {
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
  const [customDuration, setCustomDuration] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(25); // Default 25 minutes

  const timerRef = useRef(null);

  const { toast: useToastToast } = useToast();

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Save focus session to backend
  const saveFocusSession = useCallback(async (completed = true) => {
    if (!sessionStartTime || !user?._id) {
      console.log('Cannot save session:', { sessionStartTime, userId: user?._id });
      return;
    }

    try {
      const endTime = new Date();
      const duration = Math.floor((endTime - sessionStartTime) / 1000 / 60); // Convert to minutes

      const sessionData = {
        userId: user._id,
        startTime: sessionStartTime,
        endTime,
        duration,
        habitId: selectedHabit?._id || null,
        type: currentState,
        completed,
        interruptions,
        notes: `${completed ? 'Completed' : 'Incomplete'} ${currentState} session`
      };

      console.log('Saving session with data:', sessionData);

      const response = await habitApi.createFocusSession(sessionData);
      
      console.log('Session save response:', response);

      if (response?.data) {
        toast.success(`Session ${completed ? 'completed' : 'saved'} successfully!`);
        // Notify parent component to refresh session history
        if (onSessionComplete) {
          onSessionComplete(response.data);
        }
      } else {
        throw new Error('No response data received');
      }

      // Reset interruptions for next session
      setInterruptions(0);
    } catch (error) {
      console.error('Error saving focus session:', error);
      toast.error(`Failed to save focus session: ${error.message}`);
    }
  }, [sessionStartTime, user?._id, selectedHabit, currentState, interruptions, onSessionComplete]);

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
      console.log('Timer completed, saving session...');
      saveFocusSession(true);

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

        // Play completion sound and show notification
        audioManager.playComplete();
        toast.success('Focus session completed! Time for a break!');
      } else {
        setCurrentState(TIMER_STATES.POMODORO);
        setTimeLeft(DEFAULT_TIMES[TIMER_STATES.POMODORO]);
        toast.success('Break is over! Ready for another focus session?');
      }
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, currentState, pomodorosCompleted, saveFocusSession]);

  useEffect(() => {
    // Update current track info
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

  const toggleTimer = () => {
    if (!isActive) {
      const startTime = new Date();
      console.log('Starting new session at:', startTime);
      setSessionStartTime(startTime);
      setIsActive(true);
      audioManager.playStart();
      audioManager.startBackgroundMusic();
      setCurrentTrack(audioManager.getCurrentTrackInfo());
    } else {
      setIsActive(false);
      audioManager.playPause();
      audioManager.pauseBackgroundMusic();
    }
  };

  const resetTimer = () => {
    if (isActive) {
      console.log('Resetting active timer, saving incomplete session...');
      saveFocusSession(false); // Save as incomplete session
    }
    setIsActive(false);
    audioManager.playPause();
    setTimeLeft(DEFAULT_TIMES[currentState]);
    setSessionStartTime(null);
    audioManager.stopBackgroundMusic();
    setCurrentTrack(null);
  };

  const handleInterruption = () => {
    setInterruptions(prev => prev + 1);
    toast.info('Interruption recorded');
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

  // Add this function to handle duration changes
  const handleDurationChange = (minutes) => {
    if (!isActive) { // Only allow changes when timer is not running
      setSelectedDuration(minutes);
      setTimeLeft(minutes * 60);
      DEFAULT_TIMES[TIMER_STATES.POMODORO] = minutes * 60;
    }
  };

  // Add this function to handle custom duration input
  const handleCustomDurationSubmit = (e) => {
    e.preventDefault();
    const minutes = parseInt(customDuration);
    if (!isNaN(minutes) && minutes > 0 && minutes <= 180) { // Limit to 3 hours
      handleDurationChange(minutes);
      setCustomDuration('');
    } else {
      toast.error('Please enter a valid duration between 1 and 180 minutes');
    }
  };

  return (
    <Card className="w-full bg-black/50 border-wax-flower-200/20">
      <CardContent className="p-6 space-y-8">
        {/* Timer Type Controls */}
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
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

          {/* Duration Settings Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-[#FFB4A2] hover:text-[#FF4B2B]"
                disabled={isActive}
              >
                <Clock className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-black/90 border-[#FF4B2B]/20">
              <DialogHeader>
                <DialogTitle className="text-[#FFB4A2]">Set Focus Duration</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  {PRESET_DURATIONS.map((duration) => (
                    <Button
                      key={duration.value}
                      variant={selectedDuration === duration.value ? 'default' : 'outline'}
                      onClick={() => handleDurationChange(duration.value)}
                      className={`${
                        selectedDuration === duration.value
                          ? 'bg-[#FF4B2B] hover:bg-[#FF5C3D]'
                          : 'text-[#FF4B2B] border-[#FF4B2B] hover:bg-[#FF4B2B]/10'
                      }`}
                    >
                      {duration.label}
                    </Button>
                  ))}
                </div>
                <form onSubmit={handleCustomDurationSubmit} className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Custom (1-180 min)"
                    value={customDuration}
                    onChange={(e) => setCustomDuration(e.target.value)}
                    min="1"
                    max="180"
                    className="bg-black/50 border-[#FF4B2B]/20 text-[#FFB4A2] placeholder:text-[#FFB4A2]/50"
                  />
                  <Button
                    type="submit"
                    variant="outline"
                    className="text-[#FF4B2B] border-[#FF4B2B] hover:bg-[#FF4B2B]/10"
                  >
                    Set
                  </Button>
                </form>
              </div>
            </DialogContent>
          </Dialog>
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