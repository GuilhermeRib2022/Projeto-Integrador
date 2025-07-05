import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../../../components/url';
import { useNavigate } from 'react-router-dom';
import './style.css';

const PublicarVideo = () => {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [disciplina, setDisciplina] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [disciplinas, setDisciplinas] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDisciplinas = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/disciplina`);
        setDisciplinas(res.data);
      } catch (err) {
        const mensagemDoServidor = err.response?.data?.message;
        setErro(mensagemDoServidor || 'Erro ao publicar vídeo');
      }
    };

    fetchDisciplinas();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setMensagem('');

    if (!videoFile || !titulo || !descricao || !disciplina) {
      setErro('Por favor, preencha todos os campos.');
      return;
    }

    const formData = new FormData();
    formData.append('video', videoFile);
    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile);
    }
    formData.append('titulo', titulo);
    formData.append('descricao', descricao);
    formData.append('disciplina', disciplina);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${BASE_URL}/video/publicar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      setMensagem('Vídeo publicado com sucesso!');

      const { videoID } = res.data;
      navigate(`/video/${videoID}`);
    } catch (err) {
      const mensagemDoServidor = err.response?.data?.message;
      setErro(mensagemDoServidor || 'Erro ao publicar vídeo');
    }
  };

  return (
    <div className="publicar-video-container">
      <h2>Publicar Vídeo</h2>

      {erro && <div className="erro">{erro}</div>}
      {mensagem && <div className="sucesso">{mensagem}</div>}

      <form onSubmit={handleSubmit} className="formulario-video">
        <label>Título</label>
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
        />

        <label>Descrição</label>
        <textarea
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          required
        ></textarea>

        <label>Disciplina</label>
        <select
          value={disciplina}
          className="select-disciplina"
          onChange={(e) => setDisciplina(e.target.value)}
          required
        >
          <option className="option-disciplina" value="">-- Selecione uma disciplina --</option>
          {disciplinas.map((d) => (
            <option className="option-disciplina" key={d.ID} value={d.ID}>
              {d.Nome}
            </option>
          ))}
        </select>

        <label>Ficheiro do Vídeo</label>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setVideoFile(e.target.files[0])}
          required
        />

        <label>Ficheiro da Thumbnail</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setThumbnailFile(e.target.files[0])}
        />

        <button className="btn btn-danger" type="submit">Publicar</button>
      </form>
    </div>
  );
};

export default PublicarVideo;
