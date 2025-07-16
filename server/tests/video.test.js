import { jest } from '@jest/globals';

// Mock do database
jest.unstable_mockModule('../database.js', () => ({
  default: {
    query: jest.fn(),
  },
}));

// Importações após o mock
const { Video } = await import('../models/videoModels.js');
const databaseModule = await import('../database.js');
const pool = databaseModule.default;

describe('Video Model', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('visualizar incrementa views quando o vídeo existe', async () => {
    // Mock do resultado da query: vídeo encontrado e atualizado
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const result = await Video.visualizar(5);

    expect(pool.query).toHaveBeenCalledWith(
      'UPDATE video SET views = views + 1 WHERE ID = ?',
      [5]
    );

    expect(result).toEqual({ affectedRows: 1 });
  });

  test('visualizar lança erro se vídeo não for encontrado', async () => {
    // Mock do resultado: nenhum vídeo afetado
    pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

    await expect(Video.visualizar(999)).rejects.toThrow('Video not found');

    expect(pool.query).toHaveBeenCalledWith(
      'UPDATE video SET views = views + 1 WHERE ID = ?',
      [999]
    );
  });

    test('publicarVideo insere vídeo e retorna insertId', async () => {
        const disciplinaID = 1;
        const utilizadorID = 2;
        const titulo = 'Vídeo Teste';
        const descricao = 'Descrição do vídeo';
        const videoPath = '/videos/teste.mp4';
        const fontePath = '/fonte/teste.pdf';
        const thumbnail = '/thumbs/teste.jpg';
        const duracao = 120;
        const textoFonte = 'Texto da fonte';

        const mockInsertResult = [{ insertId: 99 }];

        pool.query.mockResolvedValueOnce(mockInsertResult);

        const insertId = await Video.publicarVideo( disciplinaID, utilizadorID, titulo, descricao, videoPath, thumbnail, duracao, fontePath, textoFonte);

        expect(pool.query).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO Video'),
            [disciplinaID, utilizadorID, titulo, descricao, videoPath, thumbnail, duracao, fontePath, textoFonte]
        );

        expect(insertId).toBe(99);
    });
});
