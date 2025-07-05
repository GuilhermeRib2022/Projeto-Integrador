import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';  // Para pegar o id da URL
import { BASE_URL } from '../../components/url';
import './style.css';

const token = localStorage.getItem('token');

const EstatisticaVideo = () => {

    return (
        <>

        </>
    );
};

export default EstatisticaVideo;
