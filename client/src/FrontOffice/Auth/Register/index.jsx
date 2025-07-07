import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import axios from 'axios'
import { BASE_URL } from '../../../components/url';

function Register() {
    const [values, setValues] = useState({
        nome: "",
        email: "",
        password: "",
    })
    const [error, setError] = useState("");  // Error handling state

    const navigate = useNavigate()


    const handleSubmit = (event) => {

        event.preventDefault();

        axios.post(`${BASE_URL}/utilizador/registar`, values)
            .then(res => {
                if (res.status === 200 || res.status === 201) {
                    navigate('/login')
                    window.location.reload();
                } else {
                    setError("Credenciais Invalidas");
                }
            })
            .catch(err => {
                console.error(err);
                if (err.response.status === 400) {
                    setError("Parâmetros inválidos. Verifique os dados.");
                } else if (err.response.status === 401) {
                    setError("Nome de utilizador, email ou senha incorretos.");
                } else if (err.response.status === 404) {
                    setError("utilizador não encontrado.");
                } else if (err.response.status === 500) {
                    setError("Erro no servidor. Tente novamente mais tarde.");
                } else {
                    setError("Erro inesperado. Tente novamente.");
                }
            });
    }

    return (
        <
            div className='d-flex justify-content-center align-items-center vh-100'
            style={{ backgroundColor: "#eeeeee" }}
        >
            <div className='bg-white p-3 rounded w-100 w-sm-75 w-md-50 w-lg-25' style={{ maxWidth: '400px' }}>
                <h2>Registe-se</h2>
                <form onSubmit={handleSubmit}>
                    <div className='mb-3'>
                        <label htmlFor="nome"><strong>Nome</strong></label>
                        <input type="text" placeholder="Insira Nome de utilizador" name="name"
                            onChange={e => setValues({ ...values, nome: e.target.value })} className='form-control rounded-0' minLength={4} maxLength={32} required/>
                    </div>

                    <div className='mb-3'>
                        <label htmlFor="email"><strong>Email</strong></label>
                        <input type="email" placeholder="Insira E-mail" name="email"
                            onChange={e => setValues({ ...values, email: e.target.value })} className='form-control rounded-0' required pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"/>
                    </div>

                    <div className='mb-3'>
                        <label htmlFor="password"><strong>Password</strong></label>
                        <input type="password" placeholder="Insira Password" name="password"
                            onChange={e => setValues({ ...values, password: e.target.value })} className='form-control rounded-0' minLength={6} maxLength={32}/>
                    </div>

                    {error && <div className="alert alert-danger">{error}</div>}
                    <button type="submit" className='btn btn-primary w-100 rounded-0'>Criar Conta</button>
                    <p> Já tem uma conta? Faça login.</p>
                    <Link to="/login" className='btn btn-default border w-100 bg-light rounded-0 text-decoration-none'>Login</Link>
                </form>

            </div>
        </div>
    )
}

export default Register