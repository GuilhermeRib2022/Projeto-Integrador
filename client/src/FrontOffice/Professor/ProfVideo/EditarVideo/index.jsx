import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../../../components/url';
import { useNavigate, useParams } from 'react-router-dom';
import './style.css';

const EditarVideo = () => {
  const { id } = useParams();
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [disciplina, setDisciplina] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailAtual, setThumbnailAtual] = useState(null); // Nome da thumbnail atual
  const [disciplinas, setDisciplinas] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDados = async () => {
      try {
        const token = localStorage.getItem('token');

        const resVideo = await axios.get(`${BASE_URL}/video/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const video = resVideo.data;
        setTitulo(video.Titulo);
        setDescricao(video.Descricao);
        setDisciplina(video.DisciplinaID);
        setThumbnailAtual(video.Thumbnail);

        const resDisc = await axios.get(`${BASE_URL}/disciplina`);
        setDisciplinas(resDisc.data);
      } catch (err) {
        setErro('Erro ao carregar dados do vídeo.');
      }
    };

    fetchDados();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setMensagem('');

    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('descricao', descricao);
    formData.append('disciplina', disciplina);
    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile);
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${BASE_URL}/video/editar/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      setMensagem('Vídeo atualizado com sucesso!');
      navigate(`/video/${id}`);
    } catch (err) {
      setErro('Erro ao atualizar o vídeo.');
    }
  };

  const renderThumbnailPreview = () => {
    if (thumbnailFile) {
      return (
        <img
          src={URL.createObjectURL(thumbnailFile)}
          alt="Nova thumbnail"
          className="preview-thumbnail"
        />
      );
    }

    if (thumbnailAtual) {
      return (
        <img
          src={`${BASE_URL}/uploads/thumbnails/${thumbnailAtual}`}
          alt="Thumbnail atual"
          className="preview-thumbnail"
        />
      );
    }

    return null;
  };

  return (
    <div className="publicar-video-container">
      <h2>Editar Vídeo</h2>

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

        <label>Nova Thumbnail (opcional)</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setThumbnailFile(e.target.files[0])}
        />

        {renderThumbnailPreview()}

        <button className="btn btn-success mt-3" type="submit">
          Salvar Alterações
        </button>
      </form>
    </div>
  );
};

export default EditarVideo;
