import React, { useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand, FaVolumeDown, FaVolumeOff, FaCompress } from 'react-icons/fa';


import './style.css';

const formatTime = (time) => {
    if (isNaN(time)) return '00:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const CustomVideoPlayer = ({ src }) => {
    const playerRef = useRef(null);
    const containerRef = useRef(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1);
    const [muted, setMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [buffered, setBuffered] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const togglePlay = () => {
        setIsPlaying((prev) => !prev);
    };

    const toggleMute = () => {
        setMuted((prev) => !prev);
    };

    const handleVolumeChange = (e) => {
        const newVol = parseFloat(e.target.value);
        setVolume(newVol);
        setMuted(newVol === 0);
    };

    const handleSeek = (e) => {
        const newProgress = parseFloat(e.target.value);
        playerRef.current.seekTo(newProgress / 100, 'fraction');
        setProgress(newProgress);
    };

    const handleProgress = ({ played, playedSeconds, loaded }) => {
        setProgress(played * 100);
        setBuffered(loaded * 100);
        setCurrentTime(playedSeconds);
    };

    const handleDuration = (dur) => {
        setDuration(dur);
    };

    const handleSpeedChange = (e) => {
        const newRate = parseFloat(e.target.value);
        setPlaybackRate(newRate);
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

    const VolumeIcon = ({ volume, muted }) => {
        if (muted || volume === 0) return <FaVolumeMute />;
        if (volume > 0 && volume <= 0.3) return <FaVolumeOff />;
        if (volume > 0.3 && volume <= 0.6) return <FaVolumeDown />;
        return <FaVolumeUp />;
    };

    return (
        <div className="video-wrapper" ref={containerRef} style={{ cursor: 'default' }}>
            <div
                className="player-wrapper"
                onClick={togglePlay}
                style={{ position: 'relative', width: '100%', height: '100%' }}
            >
                <ReactPlayer
                    ref={playerRef}
                    url={src}
                    playing={isPlaying}
                    muted={muted}
                    volume={volume}
                    playbackRate={playbackRate}
                    onProgress={handleProgress}
                    onDuration={handleDuration}
                    onEnded={() => setIsPlaying(false)}
                    width="100%"
                    height="100%"
                    controls={false}
                />

                <div className="controls-overlay">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            togglePlay();
                        }}
                        title="Play/Pause"
                    >
                        {isPlaying ? <FaPause /> : <FaPlay />}
                    </button>

                    <div className="volume-wrapper">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleMute();
                            }}
                            title="Mute/Unmute"
                        >
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
                        <div className="buffered-bar" style={{ width: `${buffered}%` }}></div>
                        <div className="progressing-bar" style={{ width: `${progress}%` }}></div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={progress}
                            onChange={handleSeek}
                            className="progress-bar"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    <span className="time">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </span>

                    <select
                        className="velocidade"
                        value={playbackRate}
                        onChange={handleSpeedChange}
                        title="Velocidade"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <option value="0.5">0.5x</option>
                        <option value="1">1x</option>
                        <option value="1.5">1.5x</option>
                        <option value="2">2x</option>
                    </select>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleFullscreen();
                        }}
                        title="Tela cheia"
                    >
                        {isFullscreen ? <FaCompress /> : <FaExpand />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomVideoPlayer;
