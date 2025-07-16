import { jest } from '@jest/globals';

// Mock do pool (database.js)
jest.unstable_mockModule('../database.js', () => ({
  default: {
    query: jest.fn(),
  },
}));

// Importar após o mock
const { Review } = await import('../models/reviewModels.js');
const databaseModule = await import('../database.js');
const pool = databaseModule.default;

describe('Review Model', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('getReviews deve retornar todas as reviews', async () => {
    const fakeRows = [
      { ID: 1, VideoID: 1, UtilizadorID: 1, nota: 4 },
      { ID: 2, VideoID: 2, UtilizadorID: 2, nota: 5 },
    ];
    pool.query.mockResolvedValue([fakeRows]);

    const result = await Review.getReviews();

    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('FROM review'));
    expect(result).toEqual(fakeRows);
  });

  test('getReviewID deve retornar uma review pelo ID', async () => {
    const fakeRow = { ID: 1, VideoID: 1, UtilizadorID: 1, nota: 4 };
    pool.query.mockResolvedValue([[fakeRow]]);

    const result = await Review.getReviewID(1);

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringMatching(/SELECT .* FROM review .*WHERE ID = \?/i),
      [1]
    );
    expect(result).toEqual(fakeRow);
  });

  test('getReviewVideo deve retornar reviews por videoID e calcular média', async () => {
    const fakeRows = [
      { ID: 1, VideoID: 2, UtilizadorID: 1, nota: 4 },
      { ID: 2, VideoID: 2, UtilizadorID: 2, nota: 5 },
    ];
    pool.query.mockResolvedValue([fakeRows]);

    const result = await Review.getReviewVideo(2);

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('FROM review where videoID = ?'),
      [2]
    );
    expect(result).toEqual(fakeRows);

    // Verifica se a média é calculável corretamente
    const media = fakeRows.reduce((acc, r) => acc + r.nota, 0) / fakeRows.length;
    expect(media).toBeCloseTo(4.5);
  });

  test('getReview deve retornar uma review por utilizadorID e videoID', async () => {
    const fakeRow = { ID: 3, VideoID: 2, UtilizadorID: 1, nota: 3 };
    pool.query.mockResolvedValue([[fakeRow]]);

    const result = await Review.getReview(1, 2);

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringMatching(/SELECT .* FROM review .*utilizadorID = \? AND videoID = \?/i),
      [1, 2]
    );
    expect(result).toEqual(fakeRow);
  });

  test('adicionarReview deve inserir nova review ou atualizar existente', async () => {
    const fakeResult = { affectedRows: 1, insertId: 5 };
    pool.query.mockResolvedValue([fakeResult]);

    const result = await Review.adicionarReview(2, 1, 5);

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO review'),
      [2, 1, 5]
    );
    expect(result).toEqual(fakeResult);
  });

  test('adicionarReview deve lançar erro se falhar', async () => {
    pool.query.mockRejectedValue(new Error('Erro DB'));

    await expect(Review.adicionarReview(2, 1, 5)).rejects.toThrow('Falha ao adicionar review: Erro DB');
  });

  test('deleteReview deve apagar uma review e retornar true se sucesso', async () => {
    pool.query.mockResolvedValue([{ affectedRows: 1 }]);

    const result = await Review.deleteReview(1, 2);

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringMatching(/DELETE FROM review .*utilizadorID = \? AND videoID = \?/i),
      [1, 2]
    );
    expect(result).toBe(true);
  });

  test('deleteReview deve retornar false se nenhuma review for apagada', async () => {
    pool.query.mockResolvedValue([{ affectedRows: 0 }]);

    const result = await Review.deleteReview(999, 999);
    expect(result).toBe(false);
  });
});
