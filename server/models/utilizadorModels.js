import bcrypt from 'bcryptjs';
import pool from "../database.js";

export async function getUtilizadores(){
    const [rows] = await pool.query('SELECT * FROM Utilizador where ID>0')
    return rows
}

export async function getUtilizador(id){
    const [rows] = await pool.query('SELECT * FROM Utilizador where ID = ?',[id])
    return rows
}

export async function createUtilizador(name, password, email) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query('INSERT INTO Utilizador (nome, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);
    const id = result.insertId;
    return getUtilizador(id);
}

export async function deleteUtilizador(id){
    const [rows] = await pool.query('DELETE FROM Utilizador where ID = ?',[id])
    return rows
}

export async function updateUtilizador(id, name, email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [rows] = await pool.query('UPDATE Utilizador SET nome = ?, email = ?, password = ? WHERE id = ? ',[name, email, hashedPassword, id])
    return rows
}

export async function countUtilizador(){
    const [rows] = await pool.query('SELECT COUNT(*) AS total_Utilizadores FROM Utilizador')
    return rows[0]
}

export async function getUtilizadorByNickname(nome) { //Verifica se o Utilizador existe 
    const [rows] = await pool.query('SELECT * FROM Utilizador WHERE nome= ?', [nome]);
    return rows[0];
}

export async function VerifyPassword(utilizadorPassword, storedPassword){ //Verifica se a password está correta
    return await bcrypt.compare(utilizadorPassword, storedPassword);
}

