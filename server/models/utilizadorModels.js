import bcrypt from 'bcryptjs';
import pool from "../database.js";

export async function getUsers(){
    const [rows] = await pool.query('SELECT * FROM utilizador where ID>0')
    return rows
}

export async function getUser(id){
    const [rows] = await pool.query('SELECT * FROM utilizador where ID = ?',[id])
    return rows
}

export async function createUser(name, password, email) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query('INSERT INTO utilizador (nome, email, password, descricao) VALUES (?, ?, ?)', [name, email, hashedPassword]); ""
    const id = result.insertId;
    return getUser(id);
}

export async function deleteUser(id){
    const [rows] = await pool.query('DELETE FROM utilizador where ID = ?',[id])
    return rows
}

export async function updateUser(id, name, email, password, descricao) {
    const [rows] = await pool.query('UPDATE utilizador SET nome = ?, email = ?, password = ? WHERE id = ? WHERE descricao = ?',[name, email, password, id, descricao])
    return rows
}

export async function countUsers(){
    const [rows] = await pool.query('SELECT COUNT(*) AS total_users FROM users')
    return rows[0]
}

export async function getUserByNickname(nome) { //Verifica se o utilizador existe 
    const [rows] = await pool.query('SELECT * FROM utilizador WHERE nome= ?', [nome]);
    return rows[0];
}

export async function VerifyPassword(userPassword, storedPassword){ //Verifica se a password está correta
    return await bcrypt.compare(userPassword, storedPassword);
}

