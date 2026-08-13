import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Upload from '../src/pages/Upload/Upload';
import { BrowserRouter } from 'react-router-dom';
import api from '../src/services/api';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../src/services/api', () => ({
  default: {
    post: vi.fn()
  }
}));

describe('Upload Component', () => {
  beforeEach(() => {
    api.post.mockReset();
    api.post.mockResolvedValue({ data: { message: 'File uploaded successfully' } });
  });

  it('renders correctly', () => {
    render(
      <BrowserRouter>
        <Upload />
      </BrowserRouter>
    );
    expect(screen.getByText('File Upload')).toBeInTheDocument();
  });

  it('upload button is disabled when no file is selected', () => {
    render(
      <BrowserRouter>
        <Upload />
      </BrowserRouter>
    );
    
    const submitBtn = screen.getByText('Upload File');
    expect(submitBtn).toBeDisabled();
  });

  it('uploads a selected valid image file', async () => {
    render(
      <BrowserRouter>
        <Upload />
      </BrowserRouter>
    );

    const file = new File(['image'], 'student.png', { type: 'image/png' });
    fireEvent.change(screen.getByLabelText('Choose image file'), {
      target: { files: [file] }
    });

    fireEvent.click(screen.getByText('Upload File'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/upload',
        expect.any(FormData),
        expect.objectContaining({
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      );
    });
    expect(await screen.findByText('File uploaded successfully')).toBeInTheDocument();
  });
});
