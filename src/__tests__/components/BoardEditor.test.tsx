import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BoardEditor from '@/components/BoardEditor';

describe('BoardEditor', () => {
  const mockOnApply = jest.fn();

  beforeEach(() => {
    mockOnApply.mockClear();
  });

  it('should render the toggle button when closed', () => {
    render(<BoardEditor onApply={mockOnApply} />);
    expect(screen.getByText('盤面編集 (Dev)')).toBeInTheDocument();
  });

  it('should open the editor when toggle button is clicked', () => {
    render(<BoardEditor onApply={mockOnApply} />);
    fireEvent.click(screen.getByText('盤面編集 (Dev)'));

    expect(screen.getByText('盤面編集')).toBeInTheDocument();
    expect(screen.getByText('この盤面でプレイ')).toBeInTheDocument();
    expect(screen.getByText('初期盤面')).toBeInTheDocument();
    expect(screen.getByText('閉じる')).toBeInTheDocument();
  });

  it('should close the editor when close button is clicked', () => {
    render(<BoardEditor onApply={mockOnApply} />);
    fireEvent.click(screen.getByText('盤面編集 (Dev)'));
    fireEvent.click(screen.getByText('閉じる'));

    expect(screen.getByText('盤面編集 (Dev)')).toBeInTheDocument();
    expect(screen.queryByText('この盤面でプレイ')).not.toBeInTheDocument();
  });

  it('should cycle cell state on pointer down: null → black → white → null', () => {
    render(<BoardEditor onApply={mockOnApply} />);
    fireEvent.click(screen.getByText('盤面編集 (Dev)'));

    // Use querySelectorAll to find grid cells
    const container = document.querySelector('.inline-grid')!;
    const gridCells = container.querySelectorAll('.w-7');

    // (0,0) should be empty initially
    const cell = gridCells[0] as HTMLElement;
    expect(cell.querySelector('.bg-piece-black')).toBeNull();
    expect(cell.querySelector('.bg-piece-white')).toBeNull();

    // PointerDown 1: null → black
    fireEvent.pointerDown(cell);
    expect(cell.querySelector('.bg-piece-black')).not.toBeNull();

    // PointerDown 2: black → white
    fireEvent.pointerDown(cell);
    expect(cell.querySelector('.bg-piece-white')).not.toBeNull();

    // PointerDown 3: white → null
    fireEvent.pointerDown(cell);
    expect(cell.querySelector('.bg-piece-black')).toBeNull();
    expect(cell.querySelector('.bg-piece-white')).toBeNull();
  });

  it('should switch current player between black and white', () => {
    render(<BoardEditor onApply={mockOnApply} />);
    fireEvent.click(screen.getByText('盤面編集 (Dev)'));

    const blackBtn = screen.getByText('黒');
    const whiteBtn = screen.getByText('白');

    // Default is black (has darker styling)
    expect(blackBtn.className).toContain('bg-gray-800');
    expect(whiteBtn.className).not.toContain('bg-gray-800');

    // Switch to white
    fireEvent.click(whiteBtn);
    expect(whiteBtn.className).toContain('bg-gray-800');
    expect(blackBtn.className).not.toContain('bg-gray-800');
  });

  it('should call onApply with the edited board and selected player', () => {
    render(<BoardEditor onApply={mockOnApply} />);
    fireEvent.click(screen.getByText('盤面編集 (Dev)'));

    // Apply with default initial board and black
    fireEvent.click(screen.getByText('この盤面でプレイ'));

    expect(mockOnApply).toHaveBeenCalledTimes(1);
    const [board, player] = mockOnApply.mock.calls[0];
    expect(player).toBe('black');
    expect(board).toHaveLength(8);
    expect(board[0]).toHaveLength(8);
    // Initial board center pieces
    expect(board[3][3]).toBe('white');
    expect(board[3][4]).toBe('black');
    expect(board[4][3]).toBe('black');
    expect(board[4][4]).toBe('white');
  });

  it('should show validation error for invalid board', () => {
    render(<BoardEditor onApply={mockOnApply} />);
    fireEvent.click(screen.getByText('盤面編集 (Dev)'));

    // Clear board by clicking all pieces off (use reset to initial, then clear center)
    const container = document.querySelector('.inline-grid')!;
    const gridCells = container.querySelectorAll('.w-7');

    // Click center pieces to cycle them to null: white→null, black→white→null, etc.
    // (3,3)=white: click once → null
    fireEvent.pointerDown(gridCells[3 * 8 + 3] as HTMLElement);
    // (3,4)=black: click twice → white → null
    fireEvent.pointerDown(gridCells[3 * 8 + 4] as HTMLElement);
    fireEvent.pointerDown(gridCells[3 * 8 + 4] as HTMLElement);
    // (4,3)=black: click twice → white → null
    fireEvent.pointerDown(gridCells[4 * 8 + 3] as HTMLElement);
    fireEvent.pointerDown(gridCells[4 * 8 + 3] as HTMLElement);
    // (4,4)=white: click once → null
    fireEvent.pointerDown(gridCells[4 * 8 + 4] as HTMLElement);

    // Try to apply empty board
    fireEvent.click(screen.getByText('この盤面でプレイ'));
    expect(mockOnApply).not.toHaveBeenCalled();
    expect(screen.getByText('石が4個未満です（初期配置は4個）')).toBeInTheDocument();
  });

  it('should reset to initial board when reset button is clicked', () => {
    render(<BoardEditor onApply={mockOnApply} />);
    fireEvent.click(screen.getByText('盤面編集 (Dev)'));

    // Modify a cell first
    const container = document.querySelector('.inline-grid')!;
    const gridCells = container.querySelectorAll('.w-7');
    fireEvent.pointerDown(gridCells[0] as HTMLElement);

    // Reset
    fireEvent.click(screen.getByText('初期盤面'));

    // Apply and check initial board
    fireEvent.click(screen.getByText('この盤面でプレイ'));
    const [board] = mockOnApply.mock.calls[0];
    expect(board[3][3]).toBe('white');
    expect(board[3][4]).toBe('black');
    expect(board[4][3]).toBe('black');
    expect(board[4][4]).toBe('white');
    expect(board[0][0]).toBeNull();
  });

  it('should close the editor after applying', () => {
    render(<BoardEditor onApply={mockOnApply} />);
    fireEvent.click(screen.getByText('盤面編集 (Dev)'));
    fireEvent.click(screen.getByText('この盤面でプレイ'));

    // Should be back to the toggle button
    expect(screen.getByText('盤面編集 (Dev)')).toBeInTheDocument();
    expect(screen.queryByText('この盤面でプレイ')).not.toBeInTheDocument();
  });
});
