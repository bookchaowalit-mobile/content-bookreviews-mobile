import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen } from '@testing-library/react-native';
import LibraryScreen from '../app/(tabs)/index';
import { BookProvider } from '../lib/BookContext';
import { saveBooks } from '../lib/storage';
import type { Book } from '../lib/books';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));
// Icons load fonts through native modules; keep the real screen and context.
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));

const dune: Book = {
  id: 'dune', title: 'Dune', author: 'Frank Herbert', status: 'reading',
  pages: 400, currentPage: 100, rating: 0, notes: '', coverColor: '#000000',
  dateAdded: '2026-10-01T00:00:00.000Z',
};
const foundation: Book = {
  ...dune, id: 'foundation', title: 'Foundation', author: 'Isaac Asimov',
  status: 'completed', currentPage: 400, rating: 5,
};

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
});

function renderLibrary() {
  return render(<BookProvider><LibraryScreen /></BookProvider>);
}

it('loads the empty library and opens the add-book route', async () => {
  renderLibrary();
  expect(screen.getByText('Loading...')).toBeTruthy();
  expect(await screen.findByText(/No books yet/)).toBeTruthy();
  fireEvent.press(screen.getByLabelText('Add book'));
  expect(mockPush).toHaveBeenCalledWith('/add');
});

it('renders persisted books, counts and reading progress', async () => {
  await saveBooks([dune, foundation]);
  renderLibrary();
  expect(await screen.findByText('Dune')).toBeTruthy();
  expect(screen.getByText('Foundation')).toBeTruthy();
  expect(screen.getByText('25%')).toBeTruthy();
  expect(screen.getByLabelText('Show All: 2')).toBeTruthy();
  expect(screen.getByLabelText('Show Reading: 1')).toBeTruthy();
  expect(screen.getByLabelText('Show Done: 1')).toBeTruthy();
});

it('combines status filtering with title/author search and resets the filter', async () => {
  await saveBooks([dune, foundation]);
  renderLibrary();
  await screen.findByText('Dune');
  fireEvent.press(screen.getByLabelText('Show Done: 1'));
  expect(screen.queryByText('Dune')).toBeNull();
  expect(screen.getByText('Foundation')).toBeTruthy();
  fireEvent.changeText(screen.getByLabelText('Search books'), 'HERBERT');
  expect(screen.getByText('No books match this filter.')).toBeTruthy();
  fireEvent.press(screen.getByLabelText('Show All: 2'));
  expect(screen.getByText('Dune')).toBeTruthy();
  expect(screen.queryByText('Foundation')).toBeNull();
  fireEvent.changeText(screen.getByLabelText('Search books'), 'Foundation');
  expect(screen.getByText('Foundation')).toBeTruthy();
  expect(screen.queryByText('Dune')).toBeNull();
});

it('opens the selected persisted book', async () => {
  await saveBooks([dune]);
  renderLibrary();
  fireEvent.press(await screen.findByText('Dune'));
  expect(mockPush).toHaveBeenCalledWith('/book/dune');
});
