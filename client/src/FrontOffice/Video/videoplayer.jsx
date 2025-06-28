import React, { useRef, useState, useEffect } from 'react';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand, FaVolumeDown, FaVolumeOff, FaCompress } from 'react-icons/fa';
import './style.css';

const formatTime = (time) => {
    if (isNaN(time)) return '00:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const CustomVideoPlayer = ({ src }) => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1);
    const [muted, setMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [buffered, setBuffered] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef(null);

    const togglePlay = () => {
        const video = videoRef.current;
        if (video.paused) {
            video.play();
            setIsPlaying(true);
        } else {
            video.pause();
            setIsPlaying(false);
        }
    };

    const toggleMute = () => {
        const video = videoRef.current;
        video.muted = !video.muted;
        setMuted(video.muted);
    };

    const handleVolumeChange = (e) => {
        const vol = parseFloat(e.target.value);
        videoRef.current.volume = vol;
        setVolume(vol);
        setMuted(vol === 0);
    };

    const handleProgress = () => {
        const video = videoRef.current;
        const current = video.currentTime;
        const dur = video.duration;
        setCurrentTime(current);
        setDuration(dur);
        setProgress((current / dur) * 100);
    };

    const handleSeek = (e) => {
        const video = videoRef.current;
        const newTime = (e.target.value / 100) * video.duration;
        video.currentTime = newTime;
        setProgress(e.target.value);
    };

    const handleSpeedChange = (e) => {
        const rate = parseFloat(e.target.value);
        videoRef.current.playbackRate = rate;
        setPlaybackRate(rate);
    };

    const handleFullscreen = () => {
        const container = containerRef.current;
        if (!isFullscreen) {
            if (container.requestFullscreen) container.requestFullscreen();
            else if (container.webkitRequestFullscreen) container.webkitRequestFullscreen();
            else if (container.msRequestFullscreen) container.msRequestFullscreen();
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
            else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
            else if (document.msExitFullscreen) document.msExitFullscreen();
        }
    };

    useEffect(() => {
        const video = videoRef.current;
        const updateBuffered = () => {
            if (video && video.buffered.length > 0) {
                const bufferedEnd = video.buffered.end(video.buffered.length - 1);
                const duration = video.duration || 1;
                setBuffered((bufferedEnd / duration) * 100);
            }
        };
        video.addEventListener("progress", updateBuffered);
        return () => video.removeEventListener("progress", updateBuffered);
    }, []);

    useEffect(() => {
        const handleFullscreenChange = () => {
            const isFull =
                document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.msFullscreenElement;
            setIsFullscreen(!!isFull);
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
        document.addEventListener("msfullscreenchange", handleFullscreenChange);

        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
            document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
            document.removeEventListener("msfullscreenchange", handleFullscreenChange);
        };
    }, []);


    const VolumeIcon = ({ volume, muted }) => {
        if (muted || volume === 0) return <FaVolumeMute />;
        if (volume > 0 && volume <= 0.3) return <FaVolumeOff />; // baixo volume
        if (volume > 0.3 && volume <= 0.6) return <FaVolumeDown />; // médio
        return <FaVolumeUp />; // alto volume
    };


    return (
        <div className="video-wrapper" ref={containerRef}>
            <video
                ref={videoRef}
                src={src}
                className="custom-video"
                onClick={togglePlay}
                onTimeUpdate={handleProgress}
                onLoadedMetadata={() => setDuration(videoRef.current.duration)}
                onEnded={() => setIsPlaying(false)}
            />
            <div className="controls-overlay">
                <button onClick={togglePlay} title="Play/Pause">
                    {isPlaying ? <FaPause /> : <FaPlay />}
                </button>

                <div className="volume-wrapper">
                    <button onClick={toggleMute} title="Mute/Unmute">
                        <VolumeIcon volume={volume} muted={muted} />
                    </button>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="volume-slider"
                    />
                </div>

                <div className="progress-container">
                    <div className="progressing-bar" style={{ width: `${progress}%` }}></div>
                    <div className="buffered-bar" style={{ width: `${buffered}%` }}></div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={progress}
                        onChange={handleSeek}
                        className="progress-bar"
                    />
                </div>

                <span className="time">
                    {formatTime(currentTime)} / {formatTime(duration)}
                </span>

                <select className="velocidade" value={playbackRate} onChange={handleSpeedChange} title="Velocidade">
                    <option value="0.5">0.5x</option>
                    <option value="1">1x</option>
                    <option value="1.5">1.5x</option>
                    <option value="2">2x</option>
                </select>

                <button onClick={handleFullscreen} title="Tela cheia">
                    {isFullscreen ? <FaCompress /> : <FaExpand />}
                </button>
            </div>
        </div>
    );
};

export default CustomVideoPlayer;
