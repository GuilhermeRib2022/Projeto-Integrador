import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../../../components/url';
import './style.css';


const token = localStorage.getItem('token');

const EditPerfil = () => {
    const [perfil, setPerfil] = useState(null);
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        descricao: '',
        password: '',
        fotoPerfil: null,
    });
    const [preview, setPreview] = useState(null);
    const [mensagem, setMensagem] = useState('');
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPerfil = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/utilizador/perfil`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = res.data[0];
                setPerfil(data);
                setFormData({
                    nome: data.nome || '',
                    email: data.Email || '',
                    descricao: data.Descricao || '',
                    password: '',
                    fotoPerfil: null
                });
                setPreview(data.FotoPerfil ? `${BASE_URL}/uploads/fotosperfil/${data.FotoPerfil}` : null);
                setLoading(false);
            } catch (err) {
                setMensagem('Erro ao carregar perfil');
                setLoading(false);
            }
        };

        fetchPerfil();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                setMensagem('Tipo de arquivo não suportado. Use JPEG, PNG, GIF ou WebP.');
                setErro(true);
                return;
            }

            // Validate file size (20MB limit)
            const maxSize = 20 * 1024 * 1024;
            if (file.size > maxSize) {
                setMensagem('Arquivo muito grande. Tamanho máximo: 5MB.');
                setErro(true);
                return;
            }

            setFormData(prev => ({ ...prev, fotoPerfil: file }));
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensagem('Salvando alterações...');

        try {
            const data = new FormData();
            data.append('nome', formData.nome);
            data.append('email', formData.email);
            data.append('descricao', formData.descricao);
            if (formData.password) data.append('password', formData.password);
            if (formData.fotoPerfil) data.append('fotoPerfil', formData.fotoPerfil);

            await axios.patch(`${BASE_URL}/utilizador/perfil/edit`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                }
            });

            setMensagem('Perfil atualizado com sucesso!');
            setErro(false);
            setTimeout(() => {
                navigate(`/perfil/${perfil.ID}`);
            }, 250);
        } catch (error) {
            console.error(error);
            if (error.response && error.response.data && error.response.data.message) {
                setMensagem(error.response.data.message);
            } else if (error.response) {
                switch (error.response.status) {
                    case 400:
                        setMensagem("Parâmetros inválidos. Verifique os dados.");
                        break;
                    case 401:
                        setMensagem("Nome de utilizador, email ou senha incorretos.");
                        break;
                    case 404:
                        setMensagem("Utilizador não encontrado.");
                        break;
                    case 500:
                        setMensagem("Erro no servidor. Tente novamente mais tarde.");
                        break;
                    default:
                        setMensagem("Erro inesperado. Tente novamente.");
                }
            } else {
                setMensagem("Erro inesperado. Tente novamente.");
            }
            setErro(true);
        }}

    if (loading) return <div>A carregar...</div>;

    return (
        <div className="edit-perfil-container">
            <div  className="search-header">
                <h2>Editar Perfil</h2>
                <button className="btn btn-primary" onClick={() => navigate(-1)}> Voltar </button>
            </div>
            {mensagem && (
                <div
                    style={{
                        backgroundColor: erro ? '#f8d7da' : '#d4edda', color: erro ? '#721c24' : '#155724', border: `1px solid ${erro ? '#f5c6cb' : '#c3e6cb'}`, padding: '10px', borderRadius: '5px', marginBottom: '15px',
                    }}>
                    {mensagem}
                </div>
            )}
            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="form-group">
                    <label>Foto de Perfil</label>
                    {formData.fotoPerfil ? (
                        <img src={preview} alt="Preview" className="foto-preview" />
                    ) : perfil && perfil.FotoPerfil ? (
                        <img src={`${BASE_URL}/uploads/fotosperfil/${perfil.FotoPerfil}`} alt="pfp" className="foto-preview" />
                    ) : (
                        <img src="/profile.png" alt="TryLearn" className="foto-preview" />
                    )}
                    <input type="file" accept="image/*" onChange={handleFileChange} />
                </div>

                <div className="form-group">
                    <label>Nome</label>
                    <input type="text" name="nome" value={formData.nome} onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label>Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label>Descrição</label>
                    <textarea name="descricao" value={formData.descricao} onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label>Nova Palavra-Passe (opcional)</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} />
                </div>

                <button className="btn btn-success" type="submit">Salvar Alterações</button>
            </form>
        </div>
    );
};

export default EditPerfil;
