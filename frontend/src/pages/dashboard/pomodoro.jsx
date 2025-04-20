import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, VolumeX, RotateCcw, SkipBack, SkipForward, Plus, Minus } from 'lucide-react';
import PomodoroLogs from '@/components/PomodoroLogs';
import CircularTimer from '@/components/CircularTimer';

const musicTracks = [
  {
    title: "What If We Kissed in a Perpetual State of Entropy",
    artist: "Aldous Ichnite",
    src: "/audio/Aldous Ichnite - What If We Kissed in a Perpetual State of Entropy.mp3"
  },
  {
    title: "There is Wi-Fi at the Peak of Kilimanjaro",
    artist: "Aldous Ichnite",
    src: "/audio/Aldous Ichnite - There is Wi-Fi at the Peak of Kilimanjaro.mp3"
  },
  {
    title: "This Doubt Tastes Like You",
    artist: "Aldous Ichnite",
    src: "/audio/Aldous Ichnite - This Doubt Tastes Like You.mp3"
  },
  {
    title: "The Birth",
    artist: "HoliznaCC0",
    src: "/audio/HoliznaCC0 - The Birth.mp3"
  },
  {
    title: "A Lonely Star",
    artist: "Snoozy Beats",
    src: "/audio/snoozy beats - a lonely star.mp3"
  },
  {
    title: "See You Again",
    artist: "Snoozy Beats",
    src: "/audio/snoozy beats - see you again.mp3"
  },
  {
    title: "The Wooden Spoon Couldn't Cut But Left Emotional Scars",
    artist: "Aldous Ichnite",
    src: "/audio/Aldous Ichnite - The Wooden Spoon Couldn't Cut But Left Emotional Scars.mp3"
  },
  {
    title: "What Would Zeno of Citium Do",
    artist: "Aldous Ichnite",
    src: "/audio/Aldous Ichnite - What Would Zeno of Citium Do.mp3"
  }
];

// Fisher-Yates shuffle algorithm
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export default function Pomodoro() {
  const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [shuffledTracks, setShuffledTracks] = useState(shuffleArray(musicTracks));
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [sessionLogs, setSessionLogs] = useState([]);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const audioRef = useRef(null);

  const focusTime = 5 * 60; // 5 minutes
  const breakTime = 1 * 60; // 1 minutes

  useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Play chime sound when timer ends
      if (audioRef.current) {
        audioRef.current.play();
      }
      setIsBreak(!isBreak);
      setTimeLeft(isBreak ? focusTime : breakTime);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, isBreak]);

  const toggleTimer = () => {
    const newIsRunning = !isRunning;
    setIsRunning(newIsRunning);
    
    if (newIsRunning) {
      // Start new session
      setSessionStartTime(Date.now());
    } else {
      // End current session
      if (sessionStartTime) {
        const duration = Math.floor((Date.now() - sessionStartTime) / 1000);
        const newLog = {
          startTime: sessionStartTime,
          duration,
          type: isBreak ? 'Break' : 'Focus'
        };
        setSessionLogs(prevLogs => [newLog, ...prevLogs]);
        setSessionStartTime(null);
      }
    }
    
    // Start/stop music with timer
    if (audioRef.current) {
      if (newIsRunning) {
        audioRef.current.play();
        setIsMusicPlaying(true);
      } else {
        audioRef.current.pause();
        setIsMusicPlaying(false);
      }
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(focusTime);
    if (audioRef.current) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    }
    
    // Log the current session if it was running
    if (sessionStartTime) {
      const duration = Math.floor((Date.now() - sessionStartTime) / 1000);
      const newLog = {
        startTime: sessionStartTime,
        duration,
        type: isBreak ? 'Break' : 'Focus'
      };
      setSessionLogs(prevLogs => [newLog, ...prevLogs]);
      setSessionStartTime(null);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsMusicPlaying(!isMusicPlaying);
    }
  };

  const playNextTrack = () => {
    const nextIndex = (currentTrackIndex + 1) % shuffledTracks.length;
    setCurrentTrackIndex(nextIndex);
    if (audioRef.current) {
      audioRef.current.src = shuffledTracks[nextIndex].src;
      if (isMusicPlaying) {
        audioRef.current.play();
      }
    }
  };

  const playPreviousTrack = () => {
    const prevIndex = (currentTrackIndex - 1 + shuffledTracks.length) % shuffledTracks.length;
    setCurrentTrackIndex(prevIndex);
    if (audioRef.current) {
      audioRef.current.src = shuffledTracks[prevIndex].src;
      if (isMusicPlaying) {
        audioRef.current.play();
      }
    }
  };

  const shufflePlaylist = () => {
    const newShuffledTracks = shuffleArray(musicTracks);
    setShuffledTracks(newShuffledTracks);
    setCurrentTrackIndex(0);
    if (audioRef.current) {
      audioRef.current.src = newShuffledTracks[0].src;
      if (isMusicPlaying) {
        audioRef.current.play();
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const adjustTime = (minutes) => {
    if (isRunning) return; // Don't adjust time while timer is running
    
    const newTime = Math.max(1, timeLeft + (minutes * 60)); // Minimum 1 minute
    setTimeLeft(newTime);
  };

  return (
    <div className="space-y-8 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-wax-flower-200 dark:text-wax-flower-100">Pomodoro Timer</h1>
          <p className="text-wax-flower-400 dark:text-wax-flower-300">Focus and relax with timed sessions</p>
        </div>
      </div>

      <Card className="border-wax-flower-200/20 dark:border-wax-flower-100/20">
        <CardHeader>
          <CardTitle className="text-wax-flower-200 dark:text-wax-flower-100">
            {isBreak ? 'Break Time' : 'Focus Time'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="flex justify-center">
            <CircularTimer
              timeLeft={timeLeft}
              totalTime={isBreak ? breakTime : focusTime}
              onAdjustTime={adjustTime}
              isRunning={isRunning}
              isBreak={isBreak}
            />
          </div>

          <div className="flex justify-center space-x-6">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTimer}
              className="h-16 w-16"
            >
              {isRunning ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={resetTimer}
              className="h-16 w-16"
            >
              <RotateCcw className="h-8 w-8" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-wax-flower-400 dark:text-wax-flower-300">Background Music</span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={playPreviousTrack}
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMusic}
                >
                  {isMusicPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={playNextTrack}
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={shufflePlaylist}
                  className="ml-2"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="text-center text-wax-flower-400 dark:text-wax-flower-300">
              <p className="font-medium">{shuffledTracks[currentTrackIndex].title}</p>
              <p className="text-sm">{shuffledTracks[currentTrackIndex].artist}</p>
            </div>

            <div className="px-4">
              <Slider
                value={[volume * 100]}
                onValueChange={([value]) => {
                  setVolume(value / 100);
                  if (audioRef.current) {
                    audioRef.current.volume = value / 100;
                  }
                }}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <PomodoroLogs logs={sessionLogs} />

      <audio
        ref={audioRef}
        src={shuffledTracks[currentTrackIndex].src}
        loop
        volume={volume}
        muted={isMuted}
      />
    </div>
  );
} 