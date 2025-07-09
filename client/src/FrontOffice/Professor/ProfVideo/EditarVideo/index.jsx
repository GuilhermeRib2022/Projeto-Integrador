import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../../../components/url';
import { useNavigate, useParams } from 'react-router-dom';
import './style.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const EditarVideo = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [disciplina, setDisciplina] = useState('');
  const [thumbnailAtual, setThumbnailAtual] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState(null);
  const [disciplinas, setDisciplinas] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    const carregarDados = async () => {
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

        const resDisc = await axios.get(`${BASE_URL}/disciplina`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setDisciplinas(resDisc.data);
      } catch (err) {
        setErro('Erro ao carregar dados do vídeo.');
      }
    };

    carregarDados();
  }, [id]);

  useEffect(() => {
    if (thumbnailFile) {
      const url = URL.createObjectURL(thumbnailFile);
      setThumbnailPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setThumbnailPreviewUrl(null);
    }
  }, [thumbnailFile]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setMensagem('');
    setErro('');

    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const tamanhoMax = 20 * 1024 * 1024;

    if (file && (!tiposPermitidos.includes(file.type) || file.size > tamanhoMax)) {
      setErro('Arquivo inválido (tipo ou tamanho incorreto).');
      setThumbnailFile(null);
      return;
    }

    setThumbnailFile(file);
  };

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
      setTimeout(() => navigate(`/video/${id}`), 1500);
    } catch (err) {
      setErro('Erro ao atualizar o vídeo.');
    }
  };

  return (
    <div className="container mt-4 edit-video">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Editar Vídeo</h2>
        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>Voltar</button>
      </div>

      {erro && <div className="alert alert-danger">{erro}</div>}
      {mensagem && <div className="alert alert-success">{mensagem}</div>}

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="mb-3">
          <label className="form-label">Título</label>
          <input
            type="text"
            className="form-control"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Descrição</label>
          <textarea
            className="form-control"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            required
            maxLength="360"
          ></textarea>
        </div>

        <div className="mb-3">
          <label className="form-label">Disciplina</label>
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

        <div className="mb-3">
          <label className="form-label">Thumbnail (opcional)</label>
          <input
            type="file"
            className="form-control"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
          />
        </div>

        {(thumbnailPreviewUrl || thumbnailAtual) && (
          <div className="mb-3">
            <label className="form-label">Pré-visualização:</label><br />
            <img
              src={thumbnailPreviewUrl || `${BASE_URL}/uploads/thumbnails/${thumbnailAtual}`}
              alt="Thumbnail"
              className="img-thumbnail"
              style={{ maxWidth: '300px',aspectRatio: '16 / 9' }}
            />
          </div>
        )}

        <button type="submit" className="btn btn-success">Salvar Alterações</button>
      </form>
    </div>
  );
};


export default EditarVideo;
