import AsyncStorage from '@react-native-async-storage/async-storage';
import { addBook, deleteBook, getBooks, saveBooks, updateBook } from '../lib/storage';
import type { Book } from '../lib/books';

const key = '@bookeverything:books';
const input = {
  title: 'Dune', author: 'Frank Herbert', status: 'reading' as const,
  pages: 400, currentPage: 100, rating: 0, notes: '',
};

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
});

it('adds a book with generated identity and persists it across reads', async () => {
  const added = await addBook(input);
  expect(added).toHaveLength(1);
  expect(added[0]).toMatchObject(input);
  expect(added[0].id).toEqual(expect.any(String));
  expect(added[0].id.length).toBeGreaterThan(0);
  expect(Number.isNaN(Date.parse(added[0].dateAdded))).toBe(false);
  expect(added[0].coverColor).toMatch(/^#[0-9a-f]{6}$/);
  expect(await getBooks()).toEqual(added);
});

it('updates one book and preserves its completion date on later edits', async () => {
  const [book] = await addBook(input);
  await addBook({ ...input, title: 'Foundation' });
  const completed = await updateBook(book.id, { status: 'completed', currentPage: 400 });
  const done = completed.find(b => b.id === book.id)!;
  expect(done).toMatchObject({ title: 'Dune', status: 'completed', currentPage: 400 });
  expect(Number.isNaN(Date.parse(done.dateCompleted!))).toBe(false);
  await updateBook(book.id, { rating: 5 });
  expect(await getBooks()).toEqual([
    expect.objectContaining({ title: 'Foundation', status: 'reading', currentPage: 100 }),
    expect.objectContaining({ id: book.id, rating: 5, dateCompleted: done.dateCompleted }),
  ]);
});

it('deletes only the requested book from the persisted library', async () => {
  const [first] = await addBook(input);
  await addBook({ ...input, title: 'Foundation' });
  await deleteBook(first.id);
  expect(await getBooks()).toEqual([expect.objectContaining({ title: 'Foundation' })]);
});

it('records the completion date when adding an already completed book', async () => {
  await addBook({ ...input, status: 'completed', currentPage: 400 });
  const [book] = await getBooks();
  expect(Number.isNaN(Date.parse(book.dateCompleted!))).toBe(false);
});

it.each(['add', 'update', 'delete'] as const)('refuses a %s without overwriting unreadable data', async operation => {
  const unreadable = '{broken json';
  await AsyncStorage.setItem(key, unreadable);
  const writes = {
    add: () => addBook(input),
    update: () => updateBook('unknown', { rating: 5 }),
    delete: () => deleteBook('unknown'),
  };
  await expect(writes[operation]()).rejects.toThrow(/refusing to overwrite/);
  expect(await AsyncStorage.getItem(key)).toBe(unreadable);
});

it('rejects a failed write and leaves the stored library intact', async () => {
  const saved: Book[] = await addBook(input);
  jest.mocked(AsyncStorage.setItem).mockRejectedValueOnce(new Error('Storage full'));
  await expect(saveBooks([])).rejects.toThrow('Storage full');
  expect(await getBooks()).toEqual(saved);
});
