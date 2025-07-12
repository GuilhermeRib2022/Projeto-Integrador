import { jest } from '@jest/globals';

// Mock do pool para simular consultas SQL (assumindo que Disciplina usa pool.query)
jest.unstable_mockModule('../database.js', () => ({
  default: {
    query: jest.fn(),
  },
}));

// Importa o módulo do modelo após mockar
const { Disciplina } = await import('../models/disciplinaModels.js');
const databaseModule = await import('../database.js');
const pool = databaseModule.default;

describe('Disciplina Model', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('listarDisciplina retorna lista para utilizador', async () => {
    const fakeDisciplinas = [{ ID: 1, Nome: 'Matemática' }, { ID: 2, Nome: 'Física' }];
    pool.query.mockResolvedValue([fakeDisciplinas]);

    const result = await Disciplina.listarDisciplina(1);

    // Ajustado para bater com a query real
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('FROM disciplina d'), [1]);
    expect(result).toEqual(fakeDisciplinas);
  });

  test('getEstatisticasDisciplina retorna dados estatísticos', async () => {
    const fakeStats = [{ DisciplinaID: 1, TotalVideos: 10 }];
    pool.query.mockResolvedValue([fakeStats]);

    const result = await Disciplina.getEstatisticasDisciplina();

    // Ajustado para bater com a query real, que começa com FROM disciplina d LEFT JOIN video v
    expect(pool.query).toHaveBeenCalledWith(expect.stringMatching(/FROM\s+disciplina\s+d/i));
    expect(result).toEqual(fakeStats);
  });

  test('listarDisciplinaUser retorna disciplinas por id do utilizador', async () => {
    const fakeDisciplinas = [{ ID: 1, Nome: 'Química' }];
    pool.query.mockResolvedValue([fakeDisciplinas]);

    const result = await Disciplina.listarDisciplinaUser(2);

    // Ajustado para bater com a query real (usa alias disciplina d e LEFT JOIN disciplinaUtilizador)
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('FROM disciplina d'), [2]);
    expect(result).toEqual(fakeDisciplinas);
  });

  test('getDisciplina retorna disciplina por id', async () => {
    const fakeDisciplina = { ID: 3, Nome: 'Biologia' };
    pool.query.mockResolvedValue([[fakeDisciplina]]);

    const result = await Disciplina.getDisciplina(3);

    // Ajustado para bater com a query real (note que no erro a query foi "SELECT * FROM disciplina where ID = ?")
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('FROM disciplina where ID = ?'), [3]);
    expect(result).toEqual(fakeDisciplina);
  });

test('createDisciplina cria nova disciplina', async () => {
  const fakeInsert = { ID: 3, Nome: 'Biologia' };
  pool.query.mockResolvedValueOnce([fakeInsert]); // resolve o array com o objeto

  const result = await Disciplina.createDisciplina('História', 'Descrição', '#ff0000');

  expect(pool.query).toHaveBeenCalledWith(
    expect.stringContaining('INSERT INTO disciplina'),
    ['História', 'Descrição', '#ff0000']
  );
  expect(result).toEqual(fakeInsert);
});

  test('editDisciplina edita disciplina', async () => {
    const fakeDisciplina = { ID: 1, Nome: 'Geo', Descricao: 'Descrição nova', Cor: '#00ff00' };

    // Simula a chamada para verificar se disciplina existe (SELECT)
    pool.query.mockResolvedValueOnce([[fakeDisciplina]]);

    // Simula o UPDATE
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    // Simula SELECT atualizado
    pool.query.mockResolvedValueOnce([[fakeDisciplina]]);

    const result = await Disciplina.editDisciplina(1, 'Geo', 'Descrição nova', '#00ff00');

    expect(pool.query).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('FROM disciplina where ID = ?'),
      [1]
    );

    expect(pool.query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('UPDATE disciplina SET'),
      ['Geo', 'Descrição nova', '#00ff00', 1]
    );

    expect(pool.query).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining('FROM disciplina where ID = ?'),
      [1]
    );

    expect(result).toEqual(fakeDisciplina);
  });

  test('deleteDisciplina apaga disciplina', async () => {
    pool.query.mockResolvedValue([{ affectedRows: 1 }]);

    const result = await Disciplina.deleteDisciplina(4);

    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM disciplina where ID = ?'), [4]);
    expect(result).toEqual({ affectedRows: 1 });
  });

    test('associarDisciplina associa utilizador a disciplina', async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // insert
        pool.query.mockResolvedValueOnce([[{ ID: 3, Nome: 'Disciplina Dummy' }]]); // select com ID correto

        const result = await Disciplina.associarDisciplina(3, 2);

        // Checa a chamada do insert
        expect(pool.query).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO disciplinaUtilizador'),
            [2, 3]  // agora aqui o array tem que ser [UtilizadorID, DisciplinaID] = [2, 3]
        );

        expect(pool.query).toHaveBeenCalledWith(
            expect.stringContaining('SELECT * FROM disciplina where ID = ?'),
            [3]
        );

        expect(result).toEqual({ ID: 3, Nome: 'Disciplina Dummy' });
    });

    test('desassociarDisciplina desassocia utilizador da disciplina', async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // delete
        pool.query.mockResolvedValueOnce([[{ ID: 3, Nome: 'Disciplina Dummy' }]]); // select

        const result = await Disciplina.desassociarDisciplina(3, 2); // Corrigido aqui

        expect(pool.query).toHaveBeenCalledWith(
            expect.stringContaining('DELETE FROM disciplinaUtilizador'),
            [2, 3]  // [UtilizadorID, DisciplinaID]
        );

        expect(pool.query).toHaveBeenCalledWith(
            expect.stringContaining('SELECT * FROM disciplina where ID = ?'),
            [3]  // DisciplinaID para o select
        );

        expect(result).toEqual({ ID: 3, Nome: 'Disciplina Dummy' });
    });
});
