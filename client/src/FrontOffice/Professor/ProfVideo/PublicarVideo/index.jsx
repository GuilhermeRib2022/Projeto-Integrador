import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../../../components/url';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';

const PublicarVideo = () => {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [disciplina, setDisciplina] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState(null);
  const [fonteFile, setFonteFile] = useState(null);
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
        setErro(mensagemDoServidor || 'Erro ao carregar disciplinas.');
      }
    };

    fetchDisciplinas();
  }, []);

  useEffect(() => {
    if (thumbnailFile) {
      const url = URL.createObjectURL(thumbnailFile);
      setThumbnailPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setThumbnailPreviewUrl(null);
    }
  }, [thumbnailFile]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setMensagem('');

    if (!videoFile || !titulo || !descricao || !disciplina) {
      setErro('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const formData = new FormData();
    formData.append('video', videoFile);
    if (thumbnailFile) formData.append('thumbnail', thumbnailFile);
    if (fonteFile) formData.append('fonte', fonteFile);
    formData.append('titulo', titulo);
    formData.append('descricao', descricao);
    formData.append('disciplina', disciplina);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setErro('Token de autenticação não encontrado. Faça login novamente.');
        return;
      }

      const res = await axios.post(`${BASE_URL}/video/publicar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      setMensagem('Vídeo publicado com sucesso!');
      const { videoID } = res.data;
      setTimeout(() => navigate(`/video/${videoID}`), 1500);
    } catch (err) {
      const mensagemDoServidor = err.response?.data?.message;
      setErro(mensagemDoServidor || 'Erro ao publicar vídeo.');
    }
  };

  return (
    <div className="container mt-4 publicar-video">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Publicar Vídeo</h2>
        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
          Voltar
        </button>
      </div>

      {erro && <div className="alert alert-danger">{erro}</div>}
      {mensagem && <div className="alert alert-success">{mensagem}</div>}

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="mb-3">
          <label className="form-label"><strong>Título</strong></label>
          <input
            type="text"
            className="form-control"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
            minLength="4"
            maxLength="64"
          />
        </div>

        <div className="mb-3">
          <label className="form-label"><strong>Descrição</strong></label>
          <textarea
            className="form-control"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            required
            maxLength="360"
          />
        </div>

        <div className="mb-3">
          <label className="form-label"><strong>Disciplina</strong></label>
          <select
            className="form-select"
            value={disciplina}
            onChange={(e) => setDisciplina(e.target.value)}
            required
          >
            <option value="">-- Selecione uma disciplina --</option>
            {disciplinas.map((d) => (
              <option key={d.ID} value={d.ID}>
                {d.Nome}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3 inputing">
          <label className="form-label"><strong>Vídeo</strong></label>
          <input
            type="file"
            className="form-control"
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files[0])}
            required
          />
        </div>

        <div className="mb-3 inputing">
          <label className="form-label"><strong>Thumbnail (opcional)</strong></label>
          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={(e) => setThumbnailFile(e.target.files[0])}
          />
        </div>

        {(thumbnailFile) && (
          <div className="mb-3 inputing">
            <label className="form-label">Pré-visualização:</label><br />
            <img
              src={thumbnailPreviewUrl}
              alt="Thumbnail"
              className="img-thumbnail"
              style={{ maxWidth: '300px', aspectRatio: '16 / 9' }}
            />
          </div>
        )}

        <div className="mb-3 inputing">
          <label className="form-label"><strong>Fonte (PDF, opcional)</strong></label>
          <input
            type="file"
            className="form-control"
            accept="application/pdf"
            onChange={(e) => setFonteFile(e.target.files[0])}
          />
        </div>

        <button type="submit" className="btn btn-success btn-publicar">
          Publicar
        </button>
      </form>
    </div>
  );
};

export default PublicarVideo;
