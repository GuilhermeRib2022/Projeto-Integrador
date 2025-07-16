import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../components/url';
import SearchForm from './SearchForm';
import VideoSection from './videoSection';
import { isMobile } from 'react-device-detect';

import './style.css';

const token = localStorage.getItem('token');

const Home = () => {
  const [maisRelevantes, setMaisRelevantes] = useState([]);
  const [maisVistos, setMaisVistos] = useState([]);
  const [melhorReview, setMelhorReview] = useState([]);
  const [recentes, setRecentes] = useState([]);
  const [disciplinas1, setDisciplinas1] = useState([]);
  const [disciplinas2, setDisciplinas2] = useState([]);

  useEffect(() => {
    axios.get(`${BASE_URL}/video/home`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setMaisRelevantes(res.data.maisRelevante);
      setMaisVistos(res.data.maisVistos);
      setMelhorReview(res.data.melhorAvaliados);
      setRecentes(res.data.recentes);
      setDisciplinas1(res.data.Disciplina1);
      setDisciplinas2(res.data.Disciplina2);
    })
    .catch(err => console.error(err));
  }, []);

  return (
    <div className={isMobile ? 'home-mobile' : 'home-desktop'}>
      <h1>Vídeos</h1>
      <div className="video-top">
        <SearchForm />
      </div>

      <VideoSection title="📈 Vídeos mais relevantes" videos={maisRelevantes} />
      <hr />
      <VideoSection title="🥇 Vídeos mais vistos" videos={maisVistos} />
      <hr />
      <VideoSection title="⭐ Melhor avaliados" videos={melhorReview} />
      <hr />
      <VideoSection title="🆕 Publicados recentemente" videos={recentes} />
      <hr />
      {disciplinas1.length > 0 && (
        <VideoSection title={`🎲 Vídeos de ${disciplinas1[0].Disciplina}`} videos={disciplinas1} />
      )}
      {disciplinas2.length > 0 && (
        <VideoSection title={`🎲 Vídeos de ${disciplinas2[0].Disciplina}`} videos={disciplinas2} />
      )}
    </div>
  );
};

export default Home;
