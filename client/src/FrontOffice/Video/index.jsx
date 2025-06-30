import React from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import CustomVideoPlayer from './videoplayer';
import VideoInfoBox from './infobox';
import Anotacao from './anotacao';
import Comentario from './comentario';

import { BASE_URL } from '../../components/url';
import './style.css';
const Video = ({ collapsed }) => {
    const { id } = useParams();
    const [video, setVideo] = useState(null);

    useEffect(() => {
        axios.get(`${BASE_URL}/video/${id}`)
            .then(res => setVideo(res.data))
            .catch(err => console.error(err));
    }, [id]);


    /*<video controls src={videoUrl} width="100%" /> */

    if (!video) return <p>Carregando...</p>;

    const videoUrl = `${BASE_URL}/uploads/videos/${video.VideoPath}`;

    return (
        <div className={`video-page ${collapsed ? 'collapsed' : 'expanded'}`}>
            <CustomVideoPlayer
                src={`${BASE_URL}/uploads/videos/${video.VideoPath}`}
                title={video.Titulo}
            />

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'nowrap', alignItems: 'flex-start' }}>
                <Anotacao videoId={video.ID} />
                <VideoInfoBox video={video} />
                
            </div>
            <hr></hr>
            <div>
                <Comentario video={video} />
            </div>

        </div>
    );
};

export default Video;
