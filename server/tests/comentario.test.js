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
        const fakeRows = [{ ID: 1, Texto: 'Comentário 1' }, { ID: 2, Texto: 'Comentário 2' }];
        pool.query.mockResolvedValue([fakeRows]);

        const result = await Comentario.getComentarios();

        expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('FROM comentario'));
        expect(result).toEqual(fakeRows);
    });

    test('getComentario deve retornar o comentário com o ID especificado', async () => {
        const fakeRow = { ID: 1, Texto: 'Comentário específico' };
        pool.query.mockResolvedValue([[fakeRow]]);

        const result = await Comentario.getComentario(1);

        expect(pool.query).toHaveBeenCalledWith(expect.stringMatching(/SELECT .* FROM comentario .*WHERE ID = \?/i), [1]);
        expect(result).toEqual(fakeRow);
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

    test('createComentario deve criar um novo comentário e retornar o criado', async () => {
        const fakeInsertResult = { insertId: 1, affectedRows: 1 };
        const fakeComentario = { ID: 1, VideoID: 2, UtilizadorID: 5, Texto: 'Novo comentário' };

        pool.query.mockResolvedValueOnce([fakeInsertResult]); // mock do INSERT
        jest.spyOn(Comentario, 'getComentario').mockResolvedValueOnce(fakeComentario); // mock do SELECT

        const result = await Comentario.createComentario(2, 5, 'Novo comentário');

        expect(pool.query).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO comentario'),
            [2, 5, 'Novo comentário']
        );
        expect(Comentario.getComentario).toHaveBeenCalledWith(1);
        expect(result).toEqual(fakeComentario);

        Comentario.getComentario.mockRestore();
    });

    test('editComentarioID deve atualizar um comentário pelo ID', async () => {
        const updatedComentario = { ID: 1, Texto: 'Comentário atualizado' };

        pool.query
            .mockResolvedValueOnce([{ affectedRows: 1 }])    
            .mockResolvedValueOnce([[updatedComentario]]);  

        const result = await Comentario.editComentarioID(1, 'Comentário atualizado');

        expect(pool.query).toHaveBeenNthCalledWith(1,
            expect.stringContaining('UPDATE comentario SET Texto'),
            ['Comentário atualizado', 1]
        );

        expect(pool.query).toHaveBeenNthCalledWith(2,
            expect.stringMatching(/SELECT .* FROM comentario .*WHERE ID = \?/i),
            [1]
        );

  expect(result).toEqual(updatedComentario);
});

    test('deleteComentario deve apagar um comentário pelo ID', async () => {
        pool.query.mockResolvedValue([{ affectedRows: 1 }]);

        const result = await Comentario.deleteComentario(3);

        expect(pool.query).toHaveBeenCalledWith(expect.stringMatching(/DELETE FROM comentario .*WHERE ID = \?/i), [3]);
        expect(result).toBe(true);
    });
});
