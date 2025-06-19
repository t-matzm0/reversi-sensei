import React from 'react';
import { render, screen } from '@testing-library/react';
import { Loading } from '@/components/Loading';

describe('Loading Component', () => {
  it('should render with default props', () => {
    render(<Loading />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
  });

  it('should display custom message', () => {
    render(<Loading message="Loading data..." />);
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('should apply size classes correctly', () => {
    const { rerender } = render(<Loading size="small" />);
    let spinner = screen.getByRole('status').firstChild as HTMLElement;
    expect(spinner.className).toContain('w-6 h-6');

    rerender(<Loading size="medium" />);
    spinner = screen.getByRole('status').firstChild as HTMLElement;
    expect(spinner.className).toContain('w-8 h-8');

    rerender(<Loading size="large" />);
    spinner = screen.getByRole('status').firstChild as HTMLElement;
    expect(spinner.className).toContain('w-12 h-12');
  });

  it('should have aria-label for accessibility', () => {
    render(<Loading />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
  });

  it('should render with all props combined', () => {
    render(<Loading message="Please wait..." size="large" />);
    expect(screen.getByText('Please wait...')).toBeInTheDocument();
    const spinner = screen.getByRole('status').firstChild as HTMLElement;
    expect(spinner.className).toContain('w-12 h-12');
  });
});
