import bcrypt from 'bcryptjs';
import pool from "../database.js";

export const Utilizador = {

    async getUtilizadores() {
        try {
            const [rows] = await pool.query(`SELECT u.*,c.Tipo AS Cargo FROM utilizador u 
                                            LEFT JOIN cargo c ON c.ID = u.CargoID;`)
            return rows
        } catch (error) {
            throw new Error(`Failed to fetch users: ${error.message}`);
        }
    },


    async getPerfil(id) {
        try {
            const [rows] = await pool.query(`SELECT u.ID, u.nome, u.Email, u.Descricao, u.FotoPerfil, u.DataCriacao, u.CargoID, c.Tipo AS Cargo 
                                         FROM utilizador u 
                                         LEFT JOIN cargo c ON c.ID = u.CargoID
                                         WHERE u.ID = ?`, [id]);
            return rows;
        } catch (error) {
            throw new Error(`Failed to fetch user profile: ${error.message}`);
        }
    },

    async getUtilizador(id) {
        try {
            const [rows] = await pool.query(`SELECT u.*,c.Tipo AS Cargo FROM utilizador u 
                                            LEFT JOIN cargo c ON c.ID = u.CargoID
                                            WHERE u.ID = ?`, [id])
            return rows[0]
        } catch (error) {
            throw new Error(`Failed to fetch user with ID ${id}: ${error.message}`);
        }
    },

    async Registar({ nome, password, email }) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            'INSERT INTO Utilizador (nome, email, password, cargoID) VALUES (?, ?, ?, 1)',
            [nome, email, hashedPassword]
        );
        const id = result.insertId;
        return Utilizador.getUtilizador(id);
    },



    async createUtilizador({ nome, password, email, cargoID, descricao = null, fotoPerfil = null }) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            'INSERT INTO Utilizador (nome, email, password, cargoID, descricao, fotoPerfil) VALUES (?, ?, ?, ?, ?, ?)',
            [nome, email, hashedPassword, cargoID || 1, descricao, fotoPerfil]
        );
        const id = result.insertId;
        return Utilizador.getUtilizador(id);
    },

    async deleteUtilizador(id) {
        const [rows] = await pool.query('DELETE FROM Utilizador where ID = ?', [id])
        return rows
    },

    async editarConta({ nome, email, password, descricao, fotoPerfil, utilizadorID }) {
        try {
            if (!utilizadorID) {
                throw new Error('utilizadorID Necessário');
            }

            // Verifica se o email já está em uso por outro utilizador
            if (email) {
                const [emailRows] = await pool.query(
                    'SELECT ID FROM Utilizador WHERE Email = ? AND ID != ?',
                    [email, utilizadorID]
                );
                if (emailRows.length > 0) {
                    throw new Error('Email já está em uso');
                }
            }

            // Verifica se o nome já está em uso por outro utilizador
            if (nome) {
                const [nomeRows] = await pool.query(
                    'SELECT ID FROM Utilizador WHERE Nome = ? AND ID != ?',
                    [nome, utilizadorID]
                );
                if (nomeRows.length > 0) {
                    throw new Error('Nome já está em uso');
                }
            }

            let query = 'UPDATE Utilizador SET ';
            let params = [];
            let updates = [];

            if (nome !== undefined) {
                updates.push('Nome = ?');
                params.push(nome);
            }
            if (email !== undefined) {
                updates.push('Email = ?');
                params.push(email);
            }
            if (descricao !== undefined) {
                updates.push('Descricao = ?');
                params.push(descricao);
            }

            if (fotoPerfil !== undefined && fotoPerfil !== null) {
                updates.push('FotoPerfil = ?');
                params.push(fotoPerfil);
            }

            if (password !== undefined && password.length > 0) {
                if (password.length < 8) {
                    throw new Error('Password deve possuir pelo menos 8 caracteres');
                }
                const hashedPassword = await bcrypt.hash(password, 10);
                updates.push('Password = ?');
                params.push(hashedPassword);
            }

            if (updates.length === 0) {
                throw new Error('No fields to update');
            }

            query += updates.join(', ') + ' WHERE ID = ?';
            params.push(utilizadorID);

            const [rows] = await pool.query(query, params);
            return rows;
        } catch (error) {
            throw new Error(`Erro ao atualizar utilizador: ${error.message}`);
        }
    },

    async updateUtilizador({ id, nome, email, password, cargoID, descricao, fotoPerfil }) {
        try {
            if (!id) {
                throw new Error('User ID is required');
            }

            let query = 'UPDATE Utilizador SET ';
            let params = [];
            let updates = [];

            if (nome !== undefined) {
                updates.push('Nome = ?');
                params.push(nome);
            }
            if (email !== undefined) {
                updates.push('Email = ?');
                params.push(email);
            }
            if (descricao !== undefined) {
                updates.push('Descricao = ?');
                params.push(descricao);
            }
            if (cargoID !== undefined) {
                updates.push('CargoID = ?');
                params.push(cargoID);
            }
            if (fotoPerfil !== undefined && fotoPerfil !== null) {
                updates.push('FotoPerfil = ?');
                params.push(fotoPerfil);
            }
            if (password !== undefined && password.length > 0) {
                if (password.length < 8) {
                    throw new Error('Password must be at least 8 characters');
                }
                const hashedPassword = await bcrypt.hash(password, 10);
                updates.push('Password = ?');
                params.push(hashedPassword);
            }

            if (updates.length === 0) {
                throw new Error('No fields to update');
            }

            query += updates.join(', ') + ' WHERE ID = ?';
            params.push(id);

            const [rows] = await pool.query(query, params);
            return rows;
        } catch (error) {
            throw new Error(`Erro ao atualizar utilizador: ${error.message}`);
        }
    },

    async countUtilizador() {
        const [rows] = await pool.query('SELECT COUNT(*) AS total_Utilizadores FROM Utilizador')
        return rows[0]
    },

    async getUtilizadorByNickname(nome) { //Verifica se o Utilizador existe 
        try {
            if (!nome || typeof nome !== 'string' || nome.trim() === '') {
                throw new Error('Invalid name provided');
            }

            const [rows] = await pool.query('SELECT * FROM Utilizador WHERE nome= ?', [nome]);
            return rows[0];
        } catch (error) {
            throw new Error(`Failed to fetch user by nickname: ${error.message}`);
        }
    },

    async VerifyPassword(utilizadorPassword, storedPassword) { //Verifica se a password está correta
        return await bcrypt.compare(utilizadorPassword, storedPassword);
    },

    //Desativa um utilizador
    async desativar(id) {
        await pool.query('UPDATE utilizador SET Estado = "inativo" WHERE ID = ?', [id]);
    },

    //Ativa um utilizador
    async ativar(id) {
        await pool.query('UPDATE utilizador SET Estado = "ativo" WHERE ID = ?', [id]);
    },


}