import { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../components/url';
import { FaSave } from 'react-icons/fa';
import './anotacao.css';

function Anotacao({ videoId }) {
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNote = async () => {
            const token = localStorage.getItem('token');
            if (!token) return setLoading(false);
            try {
                const res = await axios.get(`${BASE_URL}/anotacao/video/${videoId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setNote(res.data?.Texto || '');
            } catch (err) {
                console.error('Erro ao buscar anotação:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchNote();
    }, [videoId]);

    const handleSave = async () => {
         const token = localStorage.getItem('token');
         if (!token) return alert('Necessário iniciar sessão para fazer esta ação.');
        try {
           
            await axios.put(
                `${BASE_URL}/anotacao/video/${videoId}`,
                { Texto: note },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            alert('Anotação salva com sucesso!');
        } catch (err) {
            console.error('Erro ao salvar anotação:', err);
            alert('Erro ao salvar anotação');
        }
    };

    if (loading) return <div className="video-notes">Carregando...</div>;


    return (
        <div className="video-notes">
                 <div className="notes-header">
        <h4>Anotações</h4>
        <button className="save-button" onClick={handleSave}>
          <FaSave />
        </button>
      </div>
            {loading ? (
                <p>Carregando...</p>
            ) : (
                <>
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Escreva suas anotações aqui..."
                    />
                </>
            )}
        </div>
    );
}

export default Anotacao;
