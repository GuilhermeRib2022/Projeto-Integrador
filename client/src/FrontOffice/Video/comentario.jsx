import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../components/url';
import './comentario.css';

function Comentario({ video }) {
    const [comments, setComments] = useState([]);
    const [showPicker, setShowPicker] = useState(false);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [menuOpenFor, setMenuOpenFor] = useState(null);

    const observer = useRef();

    function parseJwt(token) {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            return null;
        }
    }

    const token = localStorage.getItem('token');
    const userID = token ? parseJwt(token).id : null;

    // Lazy load trigger
    const lastCommentRef = useCallback(node => {
        if (loading || !hasMore) return;

        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                setPage(prev => prev + 1);
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    const menuRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            // Se o click foi dentro do menu ou do botão 3 pontos, não fecha o menu.
            if (
                event.target.closest('.comentario-actions') ||
                event.target.closest('.btn-menu')
            ) {
                return;
            }
            setMenuOpenFor(null);
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Carrega comentários apenas quando "Mostrar" é clicado
    useEffect(() => {
        if (!video?.ID || !expanded) return;

        const loadComments = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${BASE_URL}/comentario/video/${video.ID}?page=${page}`);
                if (page === 1) {
                    setComments(res.data);
                } else {
                    setComments(prev => [...prev, ...res.data]);
                }

                if (res.data.length === 0) setHasMore(false);
            } catch (err) {
                console.error("Erro ao carregar comentários:", err);
            } finally {
                setLoading(false);
            }
        };

        loadComments();
    }, [video, expanded, page]);

    const handleEmojiClick = (emojiData) => {
        setNewComment(prev => prev + emojiData.emoji);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        setSubmitting(true);

        try {
            await axios.post(
                `${BASE_URL}/comentario/video/${video.ID}`,
                { Texto: newComment.trim() },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );

            // Recarregar comentários após envio
            setPage(1);
            setHasMore(true); // permite novo carregamento
            const res = await axios.get(`${BASE_URL}/comentario/video/${video.ID}?page=1&limit=10`);
            setComments(res.data);
            setNewComment('');
        } catch (error) {
            console.error("Erro ao enviar comentário:", error);
            alert("Erro ao enviar comentário, tente novamente.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (commentID) => {
        if (!window.confirm('Tem certeza que deseja apagar este comentário?')) return;

        try {
            await axios.delete(`${BASE_URL}/comentario/${commentID}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setComments(prev => prev.filter(c => c.ID !== commentID));
        } catch (error) {
            alert('Erro ao apagar comentário.');
        }
    };

    const handleEdit = (commentID) => {
        const commentToEdit = comments.find(c => c.ID === commentID);
        const novoTexto = prompt('Editar comentário:', commentToEdit.Texto);
        if (novoTexto && novoTexto.trim()) {
            axios.patch(
                `${BASE_URL}/comentario/video/${video.ID}`, // usa video.ID na URL
                { Texto: novoTexto.trim(), ID: commentID }, // envia comentário ID no corpo
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            ).then(() => {
                setComments(prev => prev.map(c => c.ID === commentID ? { ...c, Texto: novoTexto.trim() } : c));
            }).catch(() => alert('Erro ao editar comentário.'));
        }
    };
    return (
        <div className="comentarios-container">
            <button
                className={`btn ${expanded ? 'btn-info' : 'btn-secondary'}`}
                onClick={() => {
                    setExpanded(prev => !prev);
                    if (!expanded) {
                        setPage(1);
                        setHasMore(true); // resetar estado ao abrir
                    }
                }}
            >
                {expanded ? 'Esconder comentários' : 'Mostrar comentários'}
            </button>

            {expanded && (
                <>
                    <form onSubmit={handleSubmit} className="comentario-form">
                        <textarea
                            placeholder="Escreva seu comentário..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            rows={3}
                            maxLength="128"
                            disabled={submitting}
                            required
                        />
                        <div className="emoji-toolbar">
                            {showPicker && (
                                <div className="emoji-picker-wrapper">
                                    <EmojiPicker onEmojiClick={handleEmojiClick} height={300} />
                                </div>
                            )}
                        </div>
                        <button type="submit" disabled={submitting}>Comentar</button>
                    </form>

                    <hr />
                    
                    {comments.length === 0 && !loading && (
                        <p className="no-comments">Nenhum comentário ainda. Seja o primeiro a comentar!</p>
                    )}


                    {comments.map((comment, index) => (
                        <div
                            key={comment.ID}
                            className="comentario-card"
                            ref={index === comments.length - 1 ? lastCommentRef : null}
                        >
                            <img
                                src={comment.FotoPerfil
                                    ? `${BASE_URL}/uploads/fotosperfil/${comment.FotoPerfil}`
                                    : "/profile.png"
                                }
                                alt={comment.nome || "TryLearn"}
                                style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "50%" }}
                                className="comentario-avatar"
                            />
                            <div className="comentario-content">
                                <div className="comentario-header">
                                    <div className="comentario-user-info">
                                        <strong>{comment.nome}</strong>
                                        <span className="comentario-date">
                                            {new Date(comment.UploadTime).toLocaleDateString('pt-PT')}
                                        </span>
                                    </div>

                                    {comment.UtilizadorID === userID && (
                                        <div className="comentario-actions">
                                            {/* Botão 3 pontos */}
                                            <button
                                                className="btn btn-secondary btn-menu"
                                                onClick={() => setMenuOpenFor(prev => prev === comment.ID ? null : comment.ID)}
                                                aria-label="Opções do comentário"
                                            >
                                                &#8942;
                                            </button>

                                            {/* Menu dropdown */}
                                            {menuOpenFor === comment.ID && (
                                                <div className="menu-dropdown">
                                                    <button
                                                        className="btn btn-success"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEdit(comment.ID);
                                                            setMenuOpenFor(null);
                                                        }}
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        className="btn btn-danger"
                                                        onClick={() => {
                                                            handleDelete(comment.ID);
                                                            setMenuOpenFor(null);
                                                        }}
                                                    >
                                                        Apagar
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <p>{comment.Texto}</p>
                            </div>
                        </div>
                    ))}
                    {loading && <p>Carregando mais comentários...</p>}
                </>
            )}
        </div>
    );


}

export default Comentario;
