import bcrypt from 'bcryptjs';
import pool from "../database.js";

export async function getUtilizadores() {
    try {
        const [rows] = await pool.query('SELECT ID, nome, email FROM Utilizador where ID>0')
        return rows
    } catch (error) {
        throw new Error(`Failed to fetch users: ${error.message}`);
    }
}

export async function getUtilizador(id) {
    try{
    const [rows] = await pool.query('SELECT ID, nome, email FROM Utilizador where ID = ?', [id])
    return rows
    } catch (error) {
        throw new Error(`Failed to fetch user with ID ${id}: ${error.message}`);
    }
}

export async function createUtilizador(name, password, email) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query('INSERT INTO Utilizador (nome, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);
    const id = result.insertId;
    return getUtilizador(id);
}

export async function deleteUtilizador(id) {
    const [rows] = await pool.query('DELETE FROM Utilizador where ID = ?', [id])
    return rows
}

export async function updateUtilizador(id, name, email, password) {
    try {
        if (!id) {
            throw new Error('User ID is required');
        }

        let query = 'UPDATE Utilizador SET ';
        let params = [];
        let updates = [];

        if (name !== undefined) {
            updates.push('nome = ?');
            params.push(name);
        }
        if (email !== undefined) {
            updates.push('email = ?');
            params.push(email);
        }
        if (password !== undefined && password.length > 0) {
            if (password.length < 8) {
                throw new Error('Password must be at least 8 characters');
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            updates.push('password = ?');
            params.push(hashedPassword);
        }

        if (updates.length === 0) {
            throw new Error('No fields to update');
        }

        query += updates.join(', ') + ' WHERE ID = ?';
        params.push(id);

        const [rows] = await pool.query(query, params);
        return rows
    } catch (error) {
        throw new Error(`Failed to update user: ${error.message}`);
    }
}

export async function countUtilizador() {
    const [rows] = await pool.query('SELECT COUNT(*) AS total_Utilizadores FROM Utilizador')
    return rows[0]
}

export async function getUtilizadorByNickname(nome) { //Verifica se o Utilizador existe 
    try{
    if (!nome || typeof nome !== 'string' || nome.trim() === '') {
        throw new Error('Invalid name provided');
    }

    const [rows] = await pool.query('SELECT * FROM Utilizador WHERE nome= ?', [nome]);
    return rows[0];
    }catch (error) {
        throw new Error(`Failed to fetch user by nickname: ${error.message}`);
    }
}

export async function VerifyPassword(utilizadorPassword, storedPassword) { //Verifica se a password está correta
    return await bcrypt.compare(utilizadorPassword, storedPassword);
}

