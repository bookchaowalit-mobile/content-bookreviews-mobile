import {
  applyPageDelta,
  computeStats,
  filterBooks,
  parsePages,
  parseStoredBooks,
  progressPercent,
  toNewBook,
  validateNewBook,
  type Book,
} from './books';

const book = (over: Partial<Book> = {}): Book => ({
  id: '1',
  title: 'Dune',
  author: 'Frank Herbert',
  status: 'reading',
  rating: 0,
  pages: 400,
  currentPage: 100,
  notes: '',
  coverColor: '#000',
  dateAdded: '2025-01-01T00:00:00.000Z',
  ...over,
});

describe('progressPercent', () => {
  it('rounds and clamps', () => {
    expect(progressPercent(book())).toBe(25);
    expect(progressPercent(book({ currentPage: 999 }))).toBe(100);
  });
  it('is 0 (not NaN) when pages are unknown', () => {
    expect(progressPercent(book({ pages: 0, currentPage: 0 }))).toBe(0);
  });
});

describe('applyPageDelta', () => {
  it('clamps to the page range', () => {
    expect(applyPageDelta(book(), -500)).toEqual({ currentPage: 0, status: 'reading' });
    expect(applyPageDelta(book(), 50)).toEqual({ currentPage: 150, status: 'reading' });
  });
  it('completes at the last page and resumes reading when going back', () => {
    expect(applyPageDelta(book({ currentPage: 390 }), 50)).toEqual({ currentPage: 400, status: 'completed' });
    expect(applyPageDelta(book({ currentPage: 400, status: 'completed' }), -10)).toEqual({ currentPage: 390, status: 'reading' });
  });
});

describe('new book input', () => {
  const input = { title: ' Dune ', author: ' Herbert ', pages: '412', status: 'completed' as const, rating: 5 };
  it('parses pages strictly', () => {
    expect(parsePages('')).toBe(0);
    expect(parsePages(' 320 ')).toBe(320);
    expect(parsePages('-5')).toBeNull();
    expect(parsePages('12abc')).toBeNull();
    expect(parsePages('1000000')).toBeNull();
  });
  it('validates', () => {
    expect(validateNewBook(input)).toBeNull();
    expect(validateNewBook({ ...input, title: ' ' })).toMatch(/title and author/);
    expect(validateNewBook({ ...input, pages: '-1' })).toMatch(/Pages/);
    expect(validateNewBook({ ...input, rating: 6 })).toMatch(/Rating/);
  });
  it('builds a new book', () => {
    expect(toNewBook(input)).toEqual({ title: 'Dune', author: 'Herbert', pages: 412, currentPage: 412, status: 'completed', rating: 5, notes: '' });
    expect(toNewBook({ ...input, status: 'want-to-read' })).toMatchObject({ currentPage: 0, rating: 0 });
  });
});

describe('computeStats', () => {
  it('aggregates the library', () => {
    const books = [
      book({ id: 'a', status: 'completed', pages: 300, currentPage: 300, rating: 4, author: 'B' }),
      book({ id: 'b', status: 'reading', pages: 200, currentPage: 50, rating: 0, author: 'A' }),
      book({ id: 'c', status: 'want-to-read', pages: 100, currentPage: 0, rating: 0, author: 'B' }),
      book({ id: 'd', status: 'completed', pages: 0, currentPage: 0, rating: 2, author: 'C' }),
    ];
    expect(computeStats(books)).toEqual({
      total: 4,
      reading: 1,
      completed: 2,
      wantToRead: 1,
      pagesRead: 350,
      totalPages: 600,
      averageRating: 3,
      topAuthors: [
        { author: 'B', count: 2 },
        { author: 'A', count: 1 },
        { author: 'C', count: 1 },
      ],
    });
  });
  it('handles an empty library', () => {
    expect(computeStats([])).toMatchObject({ total: 0, averageRating: null, topAuthors: [] });
  });
});

describe('parseStoredBooks', () => {
  it('returns [] for missing, corrupt or non-array data', () => {
    expect(parseStoredBooks(null)).toEqual([]);
    expect(parseStoredBooks('{not json')).toEqual([]);
    expect(parseStoredBooks('{"a":1}')).toEqual([]);
  });
  it('drops malformed entries', () => {
    const good = book();
    expect(parseStoredBooks(JSON.stringify([good, { id: 2 }, null]))).toEqual([good]);
  });
});

describe('filterBooks', () => {
  const books = [
    book({ id: 'a', title: 'Dune', author: 'Frank Herbert', status: 'reading' }),
    book({ id: 'b', title: 'Emma', author: 'Jane Austen', status: 'completed' }),
  ];
  it('filters by status and query', () => {
    expect(filterBooks(books, 'all').map((b) => b.id)).toEqual(['a', 'b']);
    expect(filterBooks(books, 'completed').map((b) => b.id)).toEqual(['b']);
    expect(filterBooks(books, 'all', '  herb ').map((b) => b.id)).toEqual(['a']);
    expect(filterBooks(books, 'reading', 'austen')).toEqual([]);
  });
});
