import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AddPost from './AddPost';
import { predictBlogTag } from '../services/tagApi';

jest.mock('../services/tagApi', () => ({
  BLOG_TAGS: ['Entertainment', 'Sports', 'Food', 'Travel', 'Fashion', 'Photography', 'Science'],
  predictBlogTag: jest.fn(),
}));
jest.mock('react-router-dom', () => ({ useNavigate: () => jest.fn() }));
jest.mock('../config/firebaseConfig', () => ({ storage: {}, auth: {} }));
jest.mock('../context/userContext', () => ({ useUser: () => ({ userData: {} }) }));
jest.mock('firebase/storage', () => ({ ref: jest.fn(), uploadBytes: jest.fn(), getDownloadURL: jest.fn() }));
jest.mock('uuid', () => ({ v4: () => 'test' }));

const begin = () => {
  render(<AddPost isAuth={true} setAlert={jest.fn()} />);
  fireEvent.change(screen.getAllByRole('textbox')[1], { target: { value: 'The cricket team won a tournament match.' } });
  fireEvent.click(screen.getByRole('button', { name: 'Suggest tag with AI' }));
};

afterEach(() => jest.clearAllMocks());

test('uses the returned blogTag in the existing select', async () => {
  predictBlogTag.mockResolvedValue({ blogTag: 'Sports', demo: true });
  begin();
  await waitFor(() => expect(screen.getByRole('combobox')).toHaveValue('Sports'));
  expect(screen.getByRole('status')).toHaveTextContent('Demo model');
});

test('late prediction cannot overwrite a manually selected tag', async () => {
  let resolve;
  predictBlogTag.mockImplementation(() => new Promise(done => { resolve = done; }));
  begin();
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Food' } });
  resolve({ blogTag: 'Sports', demo: true });
  await waitFor(() => expect(screen.getByRole('button', { name: 'Suggest tag with AI' })).toBeEnabled());
  expect(screen.getByRole('combobox')).toHaveValue('Food');
});

test('API failure leaves manual selection available', async () => {
  predictBlogTag.mockRejectedValue(new Error('Service unavailable'));
  begin();
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Service unavailable'));
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Travel' } });
  expect(screen.getByRole('combobox')).toHaveValue('Travel');
});
