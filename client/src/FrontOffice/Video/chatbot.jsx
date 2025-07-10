import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FiSend } from 'react-icons/fi';
import { BASE_URL } from '../../components/url';
import './chatbot.css';

const ChatBot = ({videoId, videoTime}) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [mode, setMode] = useState('text');
    const [loading, setLoading] = useState(false);
    const [canSend, setCanSend] = useState(true);
    const messagesEndRef = useRef(null);
    

    // Mensagem inicial do assistente
    useEffect(() => {
        setMessages([
            { role: 'assistant', content: 'Olá, como posso ajudar?' }
        ]);
    }, []);


    const sendMessage = async () => {
        if (!input.trim() || !canSend) return;
        setCanSend(false);
        const userMessage = { role: 'user', content: input };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput('');
        setLoading(true);
        
        try {
            const token = localStorage.getItem('token');
            let res;

            if (mode === "text") {
                res = await axios.post(`${BASE_URL}/query/chat`, {
                    messages: updatedMessages,
                    videoId,
                    question: input,
                    videoTime,
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                const assistantMessage = res.data; // { role: 'assistant', content: '...' }
                setMessages((prev) => [...prev, assistantMessage]);

            } else if (mode === 'image'){
                res = await axios.post(
                    `${BASE_URL}/query/chatimage`,
                    {
                        videoId,
                        question: input,  
                        videoTime,
                    },
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                const assistantMessage = res.data; // { role: 'assistant', content: '...' }
                setMessages((prev) => [...prev, assistantMessage]);
                /*
                 const imageUrl = res.data.imageUrl;
                setMessages((prev) => [
                    ...prev,
                    { role: 'assistant', content: '', image: imageUrl },
                ]);
                */
            }
        } catch (err) {
            console.error('Erro ao enviar mensagem:', err);
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: 'Ocorreu um erro ao tentar responder. Tente novamente.',
                },
            ]);
        } finally {
            setLoading(false);
            setTimeout(() => setCanSend(true), 500);
        }
    };


    return (
        <div className={`chat-container ${mode === 'image' ? 'image' : ''}`}>
            <div className="mode-switch-toggle">
                <label className="switch">
                    <input
                        type="checkbox"
                        checked={mode === 'image'}
                        onChange={() => setMode(mode === 'text' ? 'image' : 'text')}
                    />
                    <span className="slider"></span>
                </label>
                <span style={{ marginLeft: '10px' }}>
                    {mode === 'text' ? 'Modo Texto' : 'Modo Imagem (Pergunte apenas sobre a imagem)'}
                </span>
            </div>
            <div className="chat-box">
                {messages.map((msg, i) => (
                    <div key={i} className={`message ${msg.role}`}>
                        <strong>{msg.role === 'user' ? 'Você' : 'Bot'}:</strong> {msg.content}
                    </div>
                ))}
                {loading && <div className="message assistant">...</div>}
                <div ref={messagesEndRef} />
            </div>

            <div className="input-container">
                <input
                    type="text"
                    value={input}
                    placeholder="Envie uma pergunta..."
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    disabled={loading}
                    maxLength="128" // Limite de 128 caracteres
                />
                <button onClick={sendMessage} className="send-button" title="Enviar">
                    <FiSend size={25} />
                </button>
            </div>
        </div>
    );
};

export default ChatBot;
