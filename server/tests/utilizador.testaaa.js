import { jest } from '@jest/globals';

// Mock do pool (database.js)
jest.unstable_mockModule('../database.js', () => ({
  default: {
    query: jest.fn(),
  },
}));

// Mock do bcrypt
jest.unstable_mockModule('bcrypt', () => ({
  hash: jest.fn(() => Promise.resolve('hashedPassword')),
  compare: jest.fn((password, hash) => Promise.resolve(password === '123' && hash === 'hash')),
}));

// Importa os módulos depois dos mocks
const bcrypt = await import('bcrypt');
const { Utilizador } = await import('../models/utilizadorModels.js');
const databaseModule = await import('../database.js');
const pool = databaseModule.default;

describe('Utilizador Model', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Registar cria um novo utilizador com sucesso', async () => {
    pool.query
      .mockResolvedValueOnce([{ insertId: 1 }]) // INSERT retorna array com objeto
      .mockResolvedValueOnce([[{ ID: 1, Nome: 'Joao', Email: 'joao@email.com', Cargo: 'Admin' }]]); // SELECT perfil

    // Chamada com parâmetros separados (ajuste conforme a assinatura real)
    const perfil = await Utilizador.Registar('Joao', 'joao@email.com', 'senha123', 1);

    expect(pool.query).toHaveBeenCalledTimes(2);

    expect(pool.query).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('INSERT INTO Utilizador'),
      ['Joao', 'joao@email.com', 'hashedPassword', 1]
    );

    expect(pool.query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('SELECT u.*, c.Tipo AS Cargo'),
      [1]
    );

    expect(perfil).toEqual({ ID: 1, Nome: 'Joao', Email: 'joao@email.com', Cargo: 'Admin' });
  });

  test('getPerfil retorna perfil do utilizador', async () => {
    const fakePerfil = [{ ID: 1, Nome: 'Joao', Email: 'joao@email.com' }];
    pool.query.mockResolvedValueOnce([fakePerfil]);

    const result = await Utilizador.getPerfil(1);

    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('FROM utilizador'), [1]);
    expect(result).toEqual(fakePerfil[0]);
  });

  test('countUtilizador retorna contagem de utilizadores', async () => {
    const fakeCount = [{ count: 10 }];
    pool.query.mockResolvedValueOnce([fakeCount]);

    const result = await Utilizador.countUtilizador();

    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('COUNT'));
    expect(result).toEqual(fakeCount[0]);
  });

  test('VerifyPassword retorna true para senha correta', async () => {
    const isValid = await Utilizador.VerifyPassword('123', 'hash');

    expect(bcrypt.compare).toHaveBeenCalledWith('123', 'hash');
    expect(isValid).toBe(true);
  });

  test('VerifyPassword retorna false para senha incorreta', async () => {
    const isValid = await Utilizador.VerifyPassword('wrong', 'hash');

    expect(bcrypt.compare).toHaveBeenCalledWith('wrong', 'hash');
    expect(isValid).toBe(false);
  });

  test('editarConta atualiza os dados do utilizador', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const result = await Utilizador.editarConta(1, 'Joao', 'joao@novoemail.com', 'senhaNova123');

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE utilizador SET'),
      ['Joao', 'joao@novoemail.com', 'hashedPassword', 1]
    );
    expect(result).toBe(1);
  });

  test('deleteUtilizador apaga utilizador', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const result = await Utilizador.deleteUtilizador(1);

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM Utilizador where ID = ?'),
      [1]
    );
    expect(result).toBe(1);
  });

  test('desativar deve retornar affectedRows = 1', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const result = await Utilizador.desativar(7);

    expect(pool.query).toHaveBeenCalledWith(
      'UPDATE utilizador SET Estado = "inativo" WHERE ID = ?',
      [7]
    );
    expect(result).toBe(1);
  });

  test('ativar deve retornar affectedRows = 1', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const result = await Utilizador.ativar(7);

    expect(pool.query).toHaveBeenCalledWith(
      'UPDATE utilizador SET Estado = "ativo" WHERE ID = ?',
      [7]
    );
    expect(result).toBe(1);
  });
});
