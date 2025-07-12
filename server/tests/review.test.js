import { jest } from '@jest/globals';

// Mock do pool (database.js)
jest.unstable_mockModule('../database.js', () => ({
  default: {
    query: jest.fn(),
  },
}));

// Importa os módulos depois do mock
const { Comentario } = await import('../models/comentarioModels.js');
const databaseModule = await import('../database.js');
const pool = databaseModule.default;

describe('Comentario Model', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('getComentarios deve retornar todos os comentários', async () => {
    const fakeRows = [
      { ID: 1, Texto: 'Comentário 1' },
      { ID: 2, Texto: 'Comentário 2' },
    ];
    pool.query.mockResolvedValue([fakeRows]);

    const result = await Comentario.getComentarios();

    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('FROM comentario'));
    expect(result).toEqual(fakeRows);
  });

  test('getComentario deve retornar o comentário com o ID especificado', async () => {
    const fakeRow = { ID: 1, Texto: 'Comentário específico' };
    pool.query.mockResolvedValue([[fakeRow]]);

    const result = await Comentario.getComentario(1);

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringMatching(/SELECT .* FROM comentario .*WHERE ID = \?/i),
      [1]
    );
    expect(result).toEqual(fakeRow);
  });

  test('getComentario deve lançar erro se comentário não encontrado', async () => {
    pool.query.mockResolvedValue([[]]);

    await expect(Comentario.getComentario(999)).rejects.toThrow('Comentario with ID 999 not found');
  });

  test('getComentariosVideo deve retornar comentários paginados de um vídeo', async () => {
    const fakeRows = [{ ID: 1, VideoID: 2, Texto: 'Comentário 1' }];
    pool.query.mockResolvedValue([fakeRows]);

    const result = await Comentario.getComentariosVideo(2, 10, 0);

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('FROM comentario'),
      [2, 10, 0]
    );
    expect(result).toEqual(fakeRows);
  });

  test('createComentario deve criar um novo comentário e retornar lista atualizada', async () => {
    const fakeInsertResult = { insertId: 1, affectedRows: 1 };
    const fakeCommentsList = [{ ID: 1, VideoID: 2, Texto: 'Novo comentário' }];

    pool.query
      .mockResolvedValueOnce([fakeInsertResult])  // insert
      .mockResolvedValueOnce([fakeCommentsList]); // getComentariosVideo

    const result = await Comentario.createComentario(2, 5, 'Novo comentário');

    expect(pool.query).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('INSERT INTO comentario'),
      [2, 5, 'Novo comentário']
    );
    expect(pool.query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('FROM comentario'),
      [2, 10, 0]
    );
    expect(result).toEqual(fakeCommentsList);
  });

  test('editComentarioID deve atualizar um comentário pelo ID e retornar o atualizado', async () => {
    const updatedComentario = { ID: 1, Texto: 'Comentário atualizado' };

    pool.query
      .mockResolvedValueOnce([{ affectedRows: 1 }])    // UPDATE
      .mockResolvedValueOnce([[updatedComentario]]);  // SELECT após UPDATE

    const result = await Comentario.editComentarioID(1, 'Comentário atualizado');

    expect(pool.query).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('UPDATE comentario SET Texto'),
      ['Comentário atualizado', 1]
    );

    expect(pool.query).toHaveBeenNthCalledWith(
      2,
      expect.stringMatching(/SELECT .* FROM comentario .*WHERE ID = \?/i),
      [1]
    );

    expect(result).toEqual(updatedComentario);
  });

  test('editComentarioID deve lançar erro se comentário não encontrado para atualização', async () => {
    pool.query.mockResolvedValue([{ affectedRows: 0 }]);

    await expect(Comentario.editComentarioID(999, 'Texto')).rejects.toThrow('Comentário não encontrado para atualização');
  });

  test('deleteComentario deve apagar um comentário pelo ID e retornar true', async () => {
    pool.query.mockResolvedValue([{ affectedRows: 1 }]);

    const result = await Comentario.deleteComentario(3);

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringMatching(/DELETE FROM comentario .*WHERE ID = \?/i),
      [3]
    );
    expect(result).toBe(true);
  });

  test('deleteComentario deve retornar false se nenhum comentário foi apagado', async () => {
    pool.query.mockResolvedValue([{ affectedRows: 0 }]);

    const result = await Comentario.deleteComentario(999);

    expect(result).toBe(false);
  });

  test('editComentario deve atualizar comentário completo e retornar o comentário atualizado', async () => {
    const currentComentario = { ID: 1, VideoID: 2, UtilizadorID: 5, Texto: 'Texto antigo' };
    const updatedComentario = { ID: 1, VideoID: 3, UtilizadorID: 6, Texto: 'Texto novo' };

    // Mock getComentario para retornar currentComentario
    jest.spyOn(Comentario, 'getComentario').mockResolvedValue(currentComentario);

    pool.query.mockResolvedValue([{ affectedRows: 1 }]);

    // Mock getComentario para retornar updatedComentario após update
    jest.spyOn(Comentario, 'getComentario').mockResolvedValueOnce(currentComentario).mockResolvedValueOnce(updatedComentario);

    const result = await Comentario.editComentario(1, 3, 6, 'Texto novo');

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE comentario SET VideoID = ?, utilizadorID = ?, Texto = ?, EditTime = NOW() WHERE ID = ?'),
      [3, 6, 'Texto novo', 1]
    );

    expect(result).toEqual(updatedComentario);

    // Restaurar mock original
    Comentario.getComentario.mockRestore();
  });

  test('editComentario deve lançar erro se nenhum comentário for atualizado', async () => {
    const currentComentario = { ID: 1, VideoID: 2, UtilizadorID: 5, Texto: 'Texto antigo' };

    jest.spyOn(Comentario, 'getComentario').mockResolvedValue(currentComentario);
    pool.query.mockResolvedValue([{ affectedRows: 0 }]);

    await expect(Comentario.editComentario(1, 3, 6, 'Texto novo')).rejects.toThrow('No comentario found with ID 1');

    Comentario.getComentario.mockRestore();
  });
});
