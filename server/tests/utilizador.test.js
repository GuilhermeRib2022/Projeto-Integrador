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
  compare: jest.fn((password, hash) => Promise.resolve(password === '123')),
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


  //REGISTAR UTILIZADOR COM SUCESSO
  test('Registar insere utilizador e retorna dados completos', async () => {
    // Dados simulados
    const mockUserData = {
      nome: 'Maria',
      email: 'maria@email.com',
      password: 'abc123',
    };

    const mockInsertResult = [{ insertId: 42 }];
    const mockUserReturn = [{ ID: 42, Nome: 'Maria', Email: 'maria@email.com', Cargo: 'Admin' }];

    // Mock das queries
    pool.query
      .mockResolvedValueOnce(mockInsertResult)  // Resposta do INSERT
      .mockResolvedValueOnce([mockUserReturn]); // Resposta do getUtilizador (SELECT)

    const result = await Utilizador.Registar(mockUserData);

    // Valida chamadas ao pool.query
    expect(pool.query).toHaveBeenCalledTimes(2);

    expect(pool.query).toHaveBeenNthCalledWith(
      1,
      'INSERT INTO Utilizador (nome, email, password, cargoID) VALUES (?, ?, ?, 1)',
      ['Maria', 'maria@email.com', expect.any(String)]
    );

    expect(pool.query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('FROM utilizador'),
      [42]
    );

    expect(result).toEqual(mockUserReturn[0]);
  });


//REGISTAR UTILIZADOR SEM EMAIL
  test('Registar lança erro se email não for fornecido', async () => {
    const dadosIncompletos = { nome: 'Maria', password: 'abc123' }; // Sem email

    await expect(Utilizador.Registar(dadosIncompletos)).rejects.toThrow(
      'Campos obrigatórios: nome, password, email e cargo'
    );

    expect(pool.query).not.toHaveBeenCalled();
  });




  //OBTER PERFIL DE UTILIZADOR
  test('getPerfil retorna perfil do utilizador', async () => {
    const fakePerfil = [{ ID: 1, Nome: 'Joao', Email: 'joao@email.com' }];
    pool.query.mockResolvedValueOnce([fakePerfil]);

    const result = await Utilizador.getPerfil(1);

    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('FROM utilizador'), [1]);
    expect(result).toEqual(fakePerfil);
  });


  //CONTAR NUMERO DE UTILIZDORES
  test('countUtilizador retorna contagem de utilizadores', async () => {
    const fakeCount = [{ count: 10 }];
    pool.query.mockResolvedValueOnce([fakeCount]);

    const result = await Utilizador.countUtilizador();

    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('COUNT'));
    expect(result).toEqual(fakeCount[0]);
  });

  //VERIFICAR PASSWORD CORRETA
  test('VerifyPassword retorna true para senha correta', async () => {
    const isValid = await bcrypt.compare('123', 'hash');
    expect(isValid).toBe(true);
  });

  //VERIFICAR PASSWORD ERRADA
  test('VerifyPassword retorna false para senha incorreta', async () => {
    const isValid = await bcrypt.compare('wrong', 'hash');
    expect(isValid).toBe(false);
  });

  //EDITAR DADOS DE UTILIZADOR
  test('editarConta atualiza os dados do utilizador', async () => {
    pool.query
      .mockResolvedValueOnce([[]]) // SELECT email
      .mockResolvedValueOnce([[]]) // SELECT nome
      .mockResolvedValueOnce([{ affectedRows: 1 }]); // UPDATE

    const userData = {
      nome: 'Joao',
      email: 'joao@novoemail.com',
      password: 'senhaNova123',
      utilizadorID: 7
    };

    const result = await Utilizador.editarConta(userData);

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE Utilizador SET'),
      expect.arrayContaining(['Joao', 'joao@novoemail.com', expect.any(String), 7])
    );

    expect(result).toBe(1);
  });

  //APAGAR DADOS DE UTILIZADOR
  test('deleteUtilizador apaga utilizador', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const result = await Utilizador.deleteUtilizador(1);

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM Utilizador where ID = ?'),
      [1]
    );
    expect(result).toBe(1);
  });

  //DESATIVAR UTILIZADOR
  test('desativar deve retornar affectedRows = 1', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const result = await Utilizador.desativar(7);

    expect(pool.query).toHaveBeenCalledWith(
      'UPDATE utilizador SET Estado = "inativo" WHERE ID = ?',
      [7]
    );
    expect(result).toBe(1);
  });

  //ATIVAR UTILIZADOR
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
