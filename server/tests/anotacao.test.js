import { jest } from '@jest/globals';

// Mock do pool (database.js)
jest.unstable_mockModule('../database.js', () => ({
  default: {
    query: jest.fn(),
  },
}));

// Depois do mock, importa o módulo que usa o pool (Anotacao)
const { Anotacao } = await import('../models/anotacaoModels.js');
const databaseModule = await import('../database.js');
const pool = databaseModule.default;

describe('Anotacao Model', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('getAnotacoes deve retornar todas as anotações', async () => {
    const fakeRows = [{ ID: 1, Texto: 'Teste' }, { ID: 2, Texto: 'Outro' }];
    pool.query.mockResolvedValue([fakeRows]);

    const result = await Anotacao.getAnotacoes();
    expect(pool.query).toHaveBeenCalledWith('SELECT * FROM anotacao where ID>0');
    expect(result).toEqual(fakeRows);
  });

  test('getAnotacaoID deve retornar a anotação com o ID 1', async () => {
    const fakeRow = { ID: 1, Texto: 'Teste' };
    pool.query.mockResolvedValue([[fakeRow]]);

    const result = await Anotacao.getAnotacaoID(1);
    expect(pool.query).toHaveBeenCalledWith('SELECT * FROM anotacao where ID = ?', [1]);
    expect(result).toEqual(fakeRow);
  });

  test('getAnotacaoUser deve retornar todas as anotações do Utilizador com ID 5', async () => {
    const fakeRows = [{ ID: 1, UtilizadorID: 5, Texto: 'Anotação', titulo: 'Vídeo', Thumbnail: 'img.jpg' }];
    pool.query.mockResolvedValue([fakeRows]);

    const result = await Anotacao.getAnotacaoUser(5);
    expect(pool.query).toHaveBeenCalledWith(expect.any(String), [5]);
    expect(result).toEqual(fakeRows);
  });

  test('deleteAnotacao deve apagar a anotação através do ID', async () => {
    const fakeResult = { affectedRows: 1 };
    pool.query.mockResolvedValue([fakeResult]);

    const result = await Anotacao.deleteAnotacao(3);
    expect(pool.query).toHaveBeenCalledWith('DELETE FROM anotacao where ID = ?', [3]);
    expect(result).toEqual(fakeResult);
  });

  test('getAnotacao deve obter a anotação através de VideoID e UtilizadorID', async () => {
    const fakeRow = { ID: 1, VideoID: 2, UtilizadorID: 5, Texto: 'Texto' };
    pool.query.mockResolvedValue([[fakeRow]]);

    const result = await Anotacao.getAnotacao(2, 5);
    expect(pool.query).toHaveBeenCalledWith('SELECT * FROM anotacao where videoID = ? AND utilizadorID = ?', [2, 5]);
    expect(result).toEqual(fakeRow);
  });

  test('adicionarAnotacao deve inserir ou atualizar uma anotação', async () => {
    const fakeResult = { insertId: 1, affectedRows: 1 };
    pool.query.mockResolvedValue([fakeResult]);

    const result = await Anotacao.adicionarAnotacao(2, 5, 'Nova anotação');
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO anotacao'),
      [2, 5, 'Nova anotação']
    );
    expect(result).toEqual(fakeResult);
  });
});
