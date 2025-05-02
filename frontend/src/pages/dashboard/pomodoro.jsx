import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Settings,
  Film,
  SunMedium,
  Maximize2,
  Minimize2,
  Clock,
  BarChart3,
  History,
  Award,
  HeadphonesIcon
} from 'lucide-react';
import PomodoroTimer from '@/components/PomodoroTimer';
import SessionHistory from '@/components/SessionHistory';
import FocusStats from '@/components/FocusStats';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import { audioManager } from '@/lib/audioManager';
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Default durations
const DEFAULT_DURATIONS = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15
};

// Sample background videos (you can add your own videos here)
const BACKGROUND_VIDEOS = [
  { id: 'video1', name: 'Forest', src: '/videos/270507_small.mp4', fallbackColor: '#16213e' },
  { id: 'video2', name: 'Ocean Waves', src: '/videos/270507_small.mp4', fallbackColor: '#0f3460' },
  { id: 'video3', name: 'Fireplace', src: '/videos/270507_small.mp4', fallbackColor: '#533483' },
];

// Sample session history data
const SAMPLE_SESSIONS = [
  {
    _id: 'session1',
    type: 'pomodoro',
    startTime: new Date(Date.now() - 86400000),
    endTime: new Date(Date.now() - 86400000 + 25 * 60000),
    duration: 25,
    completed: true,
    notes: 'Completed focus session'
  },
  {
    _id: 'session2',
    type: 'break',
    startTime: new Date(Date.now() - 86400000 + 25 * 60000),
    endTime: new Date(Date.now() - 86400000 + 30 * 60000),
    duration: 5,
    completed: true,
    notes: 'Completed short break'
  },
  {
    _id: 'session3',
    type: 'pomodoro',
    startTime: new Date(Date.now() - 43200000),
    endTime: new Date(Date.now() - 43200000 + 25 * 60000),
    duration: 25,
    completed: true,
    notes: 'Completed focus session'
  },
  {
    _id: 'session4',
    type: 'pomodoro',
    startTime: new Date(Date.now() - 21600000),
    endTime: new Date(Date.now() - 21600000 + 15 * 60000),
    duration: 15,
    completed: false,
    notes: 'Incomplete focus session'
  }
];

export default function PomodoroPage() {
  const sessionHistoryRef = useRef();
  const videoRef = useRef(null);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATIONS.focus * 60);
  const [totalTime, setTotalTime] = useState(DEFAULT_DURATIONS.focus * 60);
  const [timerState, setTimerState] = useState('focus');
  const [durations, setDurations] = useState(DEFAULT_DURATIONS);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [sessions, setSessions] = useState(SAMPLE_SESSIONS);
  const [showMediaControls, setShowMediaControls] = useState(true);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [volume, setVolume] = useState(audioManager.volume);
  const [isMuted, setIsMuted] = useState(audioManager.isMuted);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoBrightness, setVideoBrightness] = useState(30);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [activeMediaTab, setActiveMediaTab] = useState('audio');
  const [showSettings, setShowSettings] = useState(false);
  const [showProgressCircle, setShowProgressCircle] = useState(true);

  const { toast } = useToast();

  // Timer functions with transitions
  const startTimer = () => {
    setIsTimerActive(true);
    audioManager.playStart();
    audioManager.startBackgroundMusic();
    toast({
      title: "Timer started",
      description: timerState === 'focus' ? "Focus session started" : "Break started",
    });
  };

  const pauseTimer = () => {
    setIsTimerActive(false);
    audioManager.playPause();
    audioManager.pauseBackgroundMusic();
    toast({
      title: "Timer paused",
      description: "Resume when you're ready",
    });
  };

  const resetTimer = () => {
    setIsTimerActive(false);
    setTimeLeft(durations[timerState] * 60);
    setTotalTime(durations[timerState] * 60);
    setCurrentProgress(0);
    audioManager.playPause();
    audioManager.stopBackgroundMusic();
    toast({
      title: "Timer reset",
      description: "Ready to start fresh",
    });
  };

  const switchTimerState = (state) => {
    setTimerState(state);
    setTimeLeft(durations[state] * 60);
    setTotalTime(durations[state] * 60);
    setCurrentProgress(0);
    setIsTimerActive(false);
  };

  // Video functions
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        toast({
          title: "Error",
          description: `Could not enter fullscreen: ${err.message}`,
          variant: "destructive",
        });
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        });
      }
    }
  };

  const selectBackgroundVideo = (video) => {
    setSelectedVideo(video);
    
    // First check if the file exists
    fetch(video.src)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Video file not found: ${video.src}`);
        }
        return response;
      })
      .catch(error => {
        console.error("Error loading video:", error);
        toast({
          title: "Video Unavailable",
          description: "Video file could not be loaded. Using fallback color instead.",
          variant: "destructive",
        });
      });
    
    if (videoRef.current) {
      // Store the current display style before changing
      const currentDisplay = videoRef.current.style.display;
      
      // Make sure the video is visible
      videoRef.current.style.display = 'block';
      
      // Set the source and attempt to play
      videoRef.current.src = video.src;
      videoRef.current.load(); // Force reload of video
      
      // Check if video exists by attempting to get duration after metadata is loaded
      const checkVideoExists = () => {
        if (isNaN(videoRef.current.duration) || videoRef.current.duration === 0) {
          // Video doesn't exist or can't be played
          console.warn("Video doesn't exist or can't be played:", video.src);
          videoRef.current.style.display = 'none';
          toast({
            title: "Video Unavailable",
            description: "Using solid color background instead.",
          });
        }
      };
      
      // Listen for metadata loaded to check if video exists
      videoRef.current.onloadedmetadata = checkVideoExists;
      
      // Play video after load
      videoRef.current.play().catch(err => {
        console.warn("Could not play video:", err);
        // Video failed to load or play, we'll use the fallback color
        videoRef.current.style.display = 'none';
        toast({
          title: "Video Unavailable",
          description: "Using solid color background instead.",
        });
      });
    }
  };

  // Timer effect
  useEffect(() => {
    let interval = null;
    
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
        setCurrentProgress(prev => prev + (1 / totalTime) * 100);
      }, 1000);
    } else if (isTimerActive && timeLeft === 0) {
      // Timer completed
      setIsTimerActive(false);
      audioManager.playComplete();
      
      // Handle session completion
      if (timerState === 'focus') {
        toast({
          title: "Focus session completed!",
          description: "Time for a break!",
        });
        
        // Add session to history
        const newSession = {
          _id: `session${Date.now()}`,
          type: 'pomodoro',
          startTime: new Date(Date.now() - (durations.focus * 60000)),
          endTime: new Date(),
          duration: durations.focus,
          completed: true,
          notes: 'Completed focus session'
        };
        
        setSessions(prev => [newSession, ...prev]);
        switchTimerState('shortBreak');
      } else {
        toast({
          title: "Break completed!",
          description: "Ready for another focus session?",
        });
        
        // Add break session to history
        const newSession = {
          _id: `session${Date.now()}`,
          type: 'break',
          startTime: new Date(Date.now() - (durations[timerState] * 60000)),
          endTime: new Date(),
          duration: durations[timerState],
          completed: true,
          notes: `Completed ${timerState === 'shortBreak' ? 'short' : 'long'} break`
        };
        
        setSessions(prev => [newSession, ...prev]);
        switchTimerState('focus');
      }
      
      // Notify parent component to refresh session history
      if (sessionHistoryRef.current && sessionHistoryRef.current.fetchSessions) {
        sessionHistoryRef.current.fetchSessions();
      }
    }
    
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft, totalTime, timerState, durations]);

  // Audio effect
  useEffect(() => {
    const updateTrackInfo = () => {
      const trackInfo = audioManager.getCurrentTrackInfo();
      setCurrentTrack(trackInfo);
      setIsMuted(audioManager.isMuted);
      setVolume(audioManager.volume);
    };
    
    // Initialize audio manager
    audioManager.init?.() || null;
    
    // Update initially
    updateTrackInfo();
    
    // Set up interval to periodically update track info
    const interval = setInterval(updateTrackInfo, 1000);
    
    return () => {
      clearInterval(interval);
      if (!isTimerActive) {
        audioManager.cleanup();
      }
    };
  }, []);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle session complete
  const handleSessionComplete = () => {
    if (sessionHistoryRef.current) {
      sessionHistoryRef.current.fetchSessions();
    }
  };

  // Handle volume changes
  const handleVolumeChange = (value) => {
    const normalizedValue = value / 100;
    setVolume(normalizedValue);
    audioManager.setVolume(normalizedValue);
  };

  // Toggle mute
  const toggleMute = () => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    audioManager.toggleMute();
  };

  // Handle track navigation
  const handleNextTrack = () => {
    audioManager.playNextTrack();
    setCurrentTrack(audioManager.getCurrentTrackInfo());
  };

  const handlePreviousTrack = () => {
    audioManager.playPreviousTrack();
    setCurrentTrack(audioManager.getCurrentTrackInfo());
  };

  // Handle music playback
  const toggleMusicPlayback = () => {
    if (audioManager.isPlaying) {
      audioManager.pauseBackgroundMusic();
    } else {
      audioManager.startBackgroundMusic();
    }
    // Force UI update
    setCurrentTrack({...audioManager.getCurrentTrackInfo()});
  };

  // Settings functions
  const saveDurations = (newDurations) => {
    setDurations(newDurations);
    setTimeLeft(newDurations[timerState] * 60);
    setTotalTime(newDurations[timerState] * 60);
    setShowSettings(false);
    
    toast({
      title: "Settings saved",
      description: "Timer durations updated successfully",
    });
  };

  // Render timer controls for fullscreen mode
  const renderFloatingControls = () => {
    if (!isFullscreen || !selectedVideo) return null;
    
    return (
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4 z-50">
        {/* Timer Controls */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-wax-flower-200/30 bg-wax-flower-950/95 backdrop-blur-md shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-6">
                <div className="text-3xl font-bold text-wax-flower-100">{formatTime(timeLeft)}</div>
                <div className="flex items-center gap-2">
                  {isTimerActive ? (
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="h-9 w-9 rounded-full bg-wax-flower-800/70 border-wax-flower-200/30 hover:bg-wax-flower-700/70 transition-colors"
                      onClick={pauseTimer}
                    >
                      <Pause className="h-4 w-4 text-wax-flower-100" />
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="h-9 w-9 rounded-full bg-wax-flower-800/70 border-wax-flower-200/30 hover:bg-wax-flower-700/70 transition-colors"
                      onClick={startTimer}
                    >
                      <Play className="h-4 w-4 text-wax-flower-100" />
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="h-9 w-9 rounded-full bg-wax-flower-800/70 border-wax-flower-200/30 hover:bg-wax-flower-700/70 transition-colors"
                    onClick={resetTimer}
                  >
                    <RotateCcw className="h-4 w-4 text-wax-flower-100" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="h-9 w-9 rounded-full bg-wax-flower-800/70 border-wax-flower-200/30 hover:bg-wax-flower-700/70 transition-colors"
                    onClick={toggleFullscreen}
                  >
                    <Minimize2 className="h-4 w-4 text-wax-flower-100" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Audio Controls */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-wax-flower-200/30 bg-wax-flower-950/95 backdrop-blur-md shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleMusicPlayback}
                  className="h-9 w-9 rounded-full bg-wax-flower-800/70 border-wax-flower-200/30 hover:bg-wax-flower-700/70 transition-colors"
                >
                  {audioManager.isPlaying ? 
                    <Pause className="h-4 w-4 text-wax-flower-100" /> : 
                    <Play className="h-4 w-4 text-wax-flower-100" />
                  }
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextTrack}
                  className="h-9 w-9 rounded-full bg-wax-flower-800/70 border-wax-flower-200/30 hover:bg-wax-flower-700/70 transition-colors"
                >
                  <SkipForward className="h-4 w-4 text-wax-flower-100" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleMute}
                  className="h-9 w-9 rounded-full bg-wax-flower-800/70 border-wax-flower-200/30 hover:bg-wax-flower-700/70 transition-colors"
                >
                  {isMuted ? 
                    <VolumeX className="h-4 w-4 text-wax-flower-100" /> : 
                    <Volume2 className="h-4 w-4 text-wax-flower-100" />
                  }
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Video Brightness Control */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="border-wax-flower-200/30 bg-wax-flower-950/95 backdrop-blur-md shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-full bg-wax-flower-800/70 border-wax-flower-200/30 hover:bg-wax-flower-700/70 transition-colors"
                >
                  <SunMedium className="h-4 w-4 text-wax-flower-100" />
                </Button>
                <div className="w-24">
                  <Slider 
                    value={[videoBrightness]} 
                    min={10} 
                    max={100} 
                    step={5}
                    onValueChange={(value) => setVideoBrightness(value[0])}
                    className="cursor-pointer"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  };

  // Settings dialog with transitions
  const SettingsDialog = () => (
    <Dialog open={showSettings} onOpenChange={setShowSettings}>
      <DialogContent className="bg-wax-flower-950/95 border border-wax-flower-700/40 shadow-xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-wax-flower-100">Timer Settings</DialogTitle>
        </DialogHeader>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="space-y-4 py-4"
        >
          <div className="space-y-2">
            <Label htmlFor="focusDuration" className="text-wax-flower-200 text-sm">Focus Duration (minutes)</Label>
            <Input
              id="focusDuration"
              type="number"
              value={durations.focus}
              onChange={(e) => setDurations({...durations, focus: Math.max(1, parseInt(e.target.value) || 1)})}
              min="1"
              max="120"
              className="bg-wax-flower-900/80 border border-wax-flower-700/50 text-wax-flower-100 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shortBreakDuration" className="text-wax-flower-200 text-sm">Short Break Duration (minutes)</Label>
            <Input
              id="shortBreakDuration"
              type="number"
              value={durations.shortBreak}
              onChange={(e) => setDurations({...durations, shortBreak: Math.max(1, parseInt(e.target.value) || 1)})}
              min="1"
              max="30"
              className="bg-wax-flower-900/80 border border-wax-flower-700/50 text-wax-flower-100 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="longBreakDuration" className="text-wax-flower-200 text-sm">Long Break Duration (minutes)</Label>
            <Input
              id="longBreakDuration"
              type="number"
              value={durations.longBreak}
              onChange={(e) => setDurations({...durations, longBreak: Math.max(1, parseInt(e.target.value) || 1)})}
              min="1"
              max="60"
              className="bg-wax-flower-900/80 border border-wax-flower-700/50 text-wax-flower-100 transition-colors"
            />
          </div>
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setShowSettings(false)}
              className="border-wax-flower-700/50 text-wax-flower-200 hover:bg-wax-flower-800/80 transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={() => saveDurations(durations)}
              className="bg-gradient-to-r from-[#FD6A3A] to-[#FF8C6B] hover:from-[#FF8C6B] hover:to-[#FD6A3A] text-white border-none transition-colors"
            >
              Save Settings
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      {/* Background video for fullscreen mode */}
      {selectedVideo && (
        <>
          <div 
            className={cn(
              "fixed inset-0 z-10 transition-opacity duration-500",
              isFullscreen ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
            style={{ backgroundColor: selectedVideo.fallbackColor }}
          >
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              src={selectedVideo.src}
              style={{ 
                filter: `brightness(${videoBrightness}%)`,
                opacity: 0.9 
              }}
              loop
              muted
              playsInline
              onError={(e) => {
                console.error("Video error:", e);
                // If video fails to load, rely on the background color
                if (videoRef.current) {
                  videoRef.current.style.display = 'none';
                }
              }}
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
          {isFullscreen && renderFloatingControls()}
        </>
      )}
      
      <div className="p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold text-wax-flower-100">Pomodoro Timer</h1>
          <p className="text-wax-flower-300 text-lg">Focus and relax with timed sessions</p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Main Timer Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-2"
          >
            <Card className="bg-wax-flower-950/80 rounded-xl border border-wax-flower-700/40 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-wax-flower-800/30">
                <div className="flex items-center gap-2">
                  <Timer className="h-5 w-5 text-[#FD6A3A]" />
                  <CardTitle className="text-xl font-bold text-wax-flower-100">Focus Session</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSettings(true)}
                  className="text-wax-flower-300 hover:text-[#FD6A3A] transition-colors"
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <div className="mb-8 flex gap-4 justify-center">
                    <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.2 }}>
                      <Button 
                        onClick={() => switchTimerState('focus')}
                        className={cn(
                          "rounded-lg px-5 py-2 text-sm font-medium transition-all duration-300",
                          timerState === 'focus' 
                            ? "bg-gradient-to-r from-[#FD6A3A] to-[#FF8C6B] text-white shadow-md" 
                            : "bg-wax-flower-900/60 border border-wax-flower-700/50 text-wax-flower-300 hover:bg-wax-flower-800/80"
                        )}
                      >
                        Focus
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.2 }}>
                      <Button 
                        onClick={() => switchTimerState('shortBreak')}
                        className={cn(
                          "rounded-lg px-5 py-2 text-sm font-medium transition-all duration-300",
                          timerState === 'shortBreak' 
                            ? "bg-gradient-to-r from-[#36A2EB] to-[#4BC0C0] text-white shadow-md" 
                            : "bg-wax-flower-900/60 border border-wax-flower-700/50 text-wax-flower-300 hover:bg-wax-flower-800/80"
                        )}
                      >
                        Short Break
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.2 }}>
                      <Button 
                        onClick={() => switchTimerState('longBreak')}
                        className={cn(
                          "rounded-lg px-5 py-2 text-sm font-medium transition-all duration-300",
                          timerState === 'longBreak' 
                            ? "bg-gradient-to-r from-[#9966FF] to-[#C084FC] text-white shadow-md" 
                            : "bg-wax-flower-900/60 border border-wax-flower-700/50 text-wax-flower-300 hover:bg-wax-flower-800/80"
                        )}
                      >
                        Long Break
                      </Button>
                    </motion.div>
                  </div>
                  
                  <div className="relative mb-10 flex items-center justify-center">
                    {/* Circular progress indicator */}
                    <svg className="w-64 h-64 transform -rotate-90">
                      <circle
                        cx="128"
                        cy="128"
                        r="120"
                        fill="none"
                        stroke="rgba(253, 106, 58, 0.1)"
                        strokeWidth="8"
                      />
                      <circle
                        cx="128"
                        cy="128"
                        r="120"
                        fill="none"
                        stroke="url(#timerGradient)"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 120}
                        strokeDashoffset={2 * Math.PI * 120 * (1 - currentProgress / 100)}
                        style={{ transition: "stroke-dashoffset 1s linear" }}
                      />
                      <defs>
                        <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#FD6A3A" />
                          <stop offset="100%" stopColor="#FF8C6B" />
                        </linearGradient>
                      </defs>
                    </svg>
                    
                    {/* Timer text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-6xl font-bold text-wax-flower-100 mb-2">
                        {formatTime(timeLeft)}
                      </div>
                      <div className="text-wax-flower-300 text-lg capitalize">
                        {timerState === 'focus' ? 'Focus Session' : timerState === 'shortBreak' ? 'Short Break' : 'Long Break'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-6">
                    <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                      <Button 
                        className="rounded-full bg-gradient-to-r from-[#FD6A3A] to-[#FF8C6B] text-white hover:from-[#FF8C6B] hover:to-[#FD6A3A] h-14 w-14 flex items-center justify-center shadow-md transition-all duration-300"
                        onClick={isTimerActive ? pauseTimer : startTimer}
                      >
                        {isTimerActive ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                      <Button 
                        variant="outline" 
                        className="rounded-full border-wax-flower-700/50 bg-wax-flower-900/60 text-wax-flower-300 hover:bg-wax-flower-800/80 h-12 w-12 flex items-center justify-center transition-all duration-300"
                        onClick={resetTimer}
                      >
                        <RotateCcw className="h-5 w-5" />
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Media Controls Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="bg-wax-flower-950/80 rounded-xl border border-wax-flower-700/40 shadow-lg h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-wax-flower-800/30">
                <div className="flex items-center gap-2">
                  <HeadphonesIcon className="h-5 w-5 text-[#FD6A3A]" />
                  <CardTitle className="text-xl font-bold text-wax-flower-100">Media Controls</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <Tabs defaultValue="audio" value={activeMediaTab} onValueChange={setActiveMediaTab} className="w-full">
                  <TabsList className="grid grid-cols-2 mb-4 bg-wax-flower-900/70">
                    <TabsTrigger 
                      value="audio" 
                      className={cn(
                        "data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FD6A3A] data-[state=active]:to-[#FF8C6B] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-300",
                        "text-wax-flower-300"
                      )}
                    >
                      <Music className="h-4 w-4 mr-2" />
                      Audio
                    </TabsTrigger>
                    <TabsTrigger 
                      value="video" 
                      className={cn(
                        "data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FD6A3A] data-[state=active]:to-[#FF8C6B] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-300",
                        "text-wax-flower-300"
                      )}
                    >
                      <Film className="h-4 w-4 mr-2" />
                      Video
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="audio" className="mt-0 space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-wax-flower-200 font-medium text-base">Volume</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={toggleMute}
                          className="text-wax-flower-300 hover:text-[#FD6A3A] transition-colors p-1"
                        >
                          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                        </Button>
                      </div>
                      <Slider
                        value={[volume * 100]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(value) => handleVolumeChange(value[0])}
                        className="cursor-pointer"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="text-wax-flower-200 font-medium text-base">Background Music</h3>
                      <div className="bg-wax-flower-900/70 rounded-lg p-4 border border-wax-flower-700/50">
                        {currentTrack ? (
                          <div className="space-y-2">
                            <p className="text-wax-flower-100 font-medium truncate text-base">{currentTrack.title}</p>
                            <p className="text-wax-flower-300 text-sm truncate">{currentTrack.artist}</p>
                            <div className="w-full h-1.5 bg-wax-flower-800 rounded-full overflow-hidden mt-3">
                              <div className="h-full bg-gradient-to-r from-[#FD6A3A] to-[#FF8C6B] rounded-full w-1/3"></div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-wax-flower-300 text-center py-2">No track playing</p>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-center gap-4 mt-4">
                        <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                          <Button
                            className="bg-gradient-to-r from-[#FD6A3A] to-[#FF8C6B] text-white hover:from-[#FF8C6B] hover:to-[#FD6A3A] px-6 rounded-full shadow-md transition-all duration-300"
                            onClick={toggleMusicPlayback}
                          >
                            {audioManager.isPlaying ? 
                              <><Pause className="h-5 w-5 mr-2" /> Pause</> : 
                              <><Play className="h-5 w-5 mr-2" /> Start</>
                            }
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                          <Button
                            variant="outline"
                            className="rounded-full border-wax-flower-700/50 bg-wax-flower-900/60 text-wax-flower-300 hover:bg-wax-flower-800/80 px-6 transition-all duration-300"
                            onClick={handleNextTrack}
                          >
                            <SkipForward className="h-4 w-4 mr-2" /> Next
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="video" className="mt-0 space-y-4">
                    <h3 className="text-wax-flower-200 font-medium text-base">Background Video</h3>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {BACKGROUND_VIDEOS.map((video) => (
                        <motion.div key={video.id} whileHover={{ scale: 1.03 }} transition={{ duration: 0.2 }}>
                          <Button
                            variant="outline"
                            onClick={() => selectBackgroundVideo(video)}
                            className={cn(
                              "w-full justify-start text-left border-wax-flower-700/50 bg-wax-flower-900/60 hover:bg-wax-flower-800/80 transition-all duration-300",
                              selectedVideo?.id === video.id && "border-[#FD6A3A] text-[#FD6A3A]"
                            )}
                            aria-label={`Select ${video.name}`}
                          >
                            <Film className="h-4 w-4 mr-2" />
                            {video.name}
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                    
                    {selectedVideo && (
                      <>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="brightness" className="text-wax-flower-200 text-sm">Brightness</Label>
                            <span className="text-wax-flower-300 text-xs">{videoBrightness}%</span>
                          </div>
                          <Slider
                            id="brightness"
                            value={[videoBrightness]}
                            min={10}
                            max={100}
                            step={5}
                            onValueChange={(value) => setVideoBrightness(value[0])}
                            className="cursor-pointer"
                          />
                        </div>
                        
                        <motion.div 
                          className="mt-4" 
                          whileHover={{ scale: 1.02 }} 
                          transition={{ duration: 0.2 }}
                        >
                          <Button
                            className="w-full bg-gradient-to-r from-[#FD6A3A] to-[#FF8C6B] text-white hover:from-[#FF8C6B] hover:to-[#FD6A3A] transition-all duration-300"
                            onClick={toggleFullscreen}
                          >
                            <Maximize2 className="h-4 w-4 mr-2" />
                            Enter Fullscreen Mode
                          </Button>
                        </motion.div>
                      </>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Stats Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="bg-wax-flower-950/80 rounded-xl border border-wax-flower-700/40 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-wax-flower-800/30">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-[#FD6A3A]" />
                  <CardTitle className="text-xl font-bold text-wax-flower-100">Focus Statistics</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-wax-flower-900/70 rounded-lg p-4 border border-wax-flower-700/50">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-wax-flower-200/10 rounded-full">
                        <Clock className="h-6 w-6 text-wax-flower-100" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-wax-flower-300">Total Focus Time</p>
                        <h3 className="text-2xl font-bold text-wax-flower-100">8h 45m</h3>
                        <p className="text-sm text-wax-flower-300">Level 4</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-wax-flower-900/70 rounded-lg p-4 border border-wax-flower-700/50">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-wax-flower-200/10 rounded-full">
                        <Award className="h-6 w-6 text-wax-flower-100" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-wax-flower-300">Sessions Completed</p>
                        <h3 className="text-2xl font-bold text-wax-flower-100">24</h3>
                        <p className="text-sm text-wax-flower-300">85% completion rate</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-wax-flower-900/70 rounded-lg p-4 border border-wax-flower-700/50">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-wax-flower-200/10 rounded-full">
                        <BarChart3 className="h-6 w-6 text-wax-flower-100" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-wax-flower-300">Current Streak</p>
                        <h3 className="text-2xl font-bold text-wax-flower-100">3 days</h3>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-wax-flower-900/70 rounded-lg p-4 border border-wax-flower-700/50">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-wax-flower-200/10 rounded-full">
                        <Timer className="h-6 w-6 text-wax-flower-100" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-wax-flower-300">Average Session</p>
                        <h3 className="text-2xl font-bold text-wax-flower-100">22m</h3>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Session History Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="lg:col-span-3"
          >
            <Card className="bg-wax-flower-950/80 rounded-xl border border-wax-flower-700/40 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-wax-flower-800/30">
                <div className="flex items-center gap-2">
                  <History className="h-5 w-5 text-[#FD6A3A]" />
                  <CardTitle className="text-xl font-bold text-wax-flower-100">Session History</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                  <div className="space-y-px divide-y divide-wax-flower-800/30">
                    {sessions.length === 0 ? (
                      <div className="text-center py-8 text-wax-flower-400">
                        No focus sessions recorded yet
                      </div>
                    ) : (
                      sessions.map((session) => (
                        <motion.div
                          key={session._id}
                          whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                          className="px-6 py-4 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <Timer className="h-4 w-4 text-wax-flower-100" />                                
                              <span className="text-wax-flower-100 font-medium">
                                {session.type === 'pomodoro' ? 'Focus Session' : 
                                 session.type === 'break' ? 'Short Break' : 'Long Break'}
                              </span>
                              {!session.completed && (
                                <span className="text-xs text-red-400">×</span>
                              )}
                            </div>
                            <span className="text-wax-flower-100">{session.duration}m</span>
                          </div>
                          <div className="flex flex-col text-sm text-wax-flower-300">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>Started: {formatDate(session.startTime)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>Ended: {formatDate(session.endTime)}</span>
                            </div>
                          </div>
                          {session.notes && (
                            <p className="mt-1 text-sm text-wax-flower-300">
                              {session.notes}
                            </p>
                          )}
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      
      {/* Settings Dialog */}
      <SettingsDialog />
      
      <style jsx="true" global="true">{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(42, 42, 42, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #FD6A3A;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #fd825b;
        }
      `}</style>
    </>
  );
} 