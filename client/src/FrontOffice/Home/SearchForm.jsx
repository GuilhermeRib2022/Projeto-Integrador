import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const SearchForm = () => {
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);

  // Inicializa os estados com valores da query string (se existirem)
  const [texto, setTexto] = useState(query.get('texto') || '');
  const [disciplina, setDisciplina] = useState(query.get('disciplina') || '');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Se ambos vazios, não faz nada
    if (texto.trim() === '' && disciplina.trim() === '') return;

    // Monta a URL com query string, só adiciona se tem valor
    const params = new URLSearchParams();
    if (texto.trim()) params.append('texto', texto.trim());
    if (disciplina.trim()) params.append('disciplina', disciplina.trim());

    navigate(`/search?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
      <input
        type="text"
        placeholder="Pesquisar vídeo"
        className=" form-control"
        style={{ flex: 1, fontSize: '18px', padding: '6px 10px' }}
        value={texto}
        onChange={e => setTexto(e.target.value)}
      />
      <input
        type="text"
        placeholder="Disciplina"
        className=" form-control"
        style={{ width: '180px', fontSize: '16px', padding: '6px 10px' }}
        value={disciplina}
        onChange={e => setDisciplina(e.target.value)}
      />
      <button type="submit" className="btn-pesquisar btn" style={{ padding: '6px 12px' }}>
        <img src="/search.svg" alt="Pesquisar" height="20" />
      </button>
    </form>
  );
};

export default SearchForm;
