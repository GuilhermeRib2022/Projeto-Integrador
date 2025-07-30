import React from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import CustomVideoPlayer from './videoplayer';
import VideoInfoBox from './infobox';
import Anotacao from './anotacao';
import Comentario from './comentario';
import ChatBot from './chatbot';

import { BASE_URL } from '../../components/url';
import './style.css';
const Video = ({ collapsed }) => {
    const { id } = useParams();
    const [video, setVideo] = useState(null);
    const [erro, setErro] = useState(null);
    const [videoTime, setVideoTime] = useState(0);
    

    useEffect(() => {
        axios.get(`${BASE_URL}/video/${id}`)
            .then(res => {
                setVideo(res.data);
                setErro(null);

                    axios.post(`${BASE_URL}/video/${id}/view`)
                        .catch(err => {
                            console.error('Erro ao registrar visualização:', err);
                            hasCountedView.current = true;

                        });
            })
            .catch(err => {
                if (err.response?.status === 404) {
                    setErro('Vídeo não encontrado');
                } else {
                    setErro('Erro ao carregar vídeo');
                }
            });
    }, [id]);

    if (erro) return <p style={{ fontSize: '50px' }}>{erro}</p>;
    if (!video) return <p>A carregar...</p>;

    const videoUrl = `${BASE_URL}/uploads/videos/${video.VideoPath}`;

    return (
        <div className={`video-page ${collapsed ? 'collapsed' : 'expanded'}`}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'nowrap' }}>
                <div style={{ flex: 1 }}>
                    <CustomVideoPlayer
                        src={`${BASE_URL}/uploads/videos/${video.VideoPath}`}
                        title={video.Titulo}
                        onTimeUpdate={(time) => {
                            setVideoTime(time);
                            
                        }}
                    />
                </div>

                <div className="chat-container-wrapper">
                    <ChatBot
                        videoId={video.ID}
                        videoTime={videoTime} />
                </div>
            </div>

            <div className="video-row" style={{ display: 'flex', gap: '20px', flexWrap: 'nowrap', alignItems: 'flex-start' }}>
                <Anotacao videoId={video.ID} />
                <div className="video-info-wrapper">
                <VideoInfoBox video={video} />
                </div>
            </div>

            <hr></hr>
            <div>
                <Comentario video={video} />
            </div>

        </div>
    );
};

export default Video;
