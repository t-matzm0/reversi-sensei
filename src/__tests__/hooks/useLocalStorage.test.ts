import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should initialize with default value', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'defaultValue'));
    expect(result.current[0]).toBe('defaultValue');
  });

  it('should retrieve existing value from localStorage', () => {
    localStorage.setItem('testKey', JSON.stringify('existingValue'));
    const { result } = renderHook(() => useLocalStorage('testKey', 'defaultValue'));
    expect(result.current[0]).toBe('existingValue');
  });

  it('should update localStorage when value changes', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'initialValue'));

    act(() => {
      result.current[1]('newValue');
    });

    expect(result.current[0]).toBe('newValue');
    expect(localStorage.getItem('testKey')).toBe(JSON.stringify('newValue'));
  });

  it('should handle objects and arrays', () => {
    const { result } = renderHook(() =>
      useLocalStorage('testObject', { name: 'test', value: 123 })
    );

    expect(result.current[0]).toEqual({ name: 'test', value: 123 });

    act(() => {
      result.current[1]({ name: 'updated', value: 456 });
    });

    expect(result.current[0]).toEqual({ name: 'updated', value: 456 });
  });

  it('should handle localStorage errors gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    localStorage.setItem('testKey', 'invalid json');

    const { result } = renderHook(() => useLocalStorage('testKey', 'fallback'));
    expect(result.current[0]).toBe('fallback');

    consoleSpy.mockRestore();
  });

  it('should remove item when using removeValue', () => {
    const { result } = renderHook(() => useLocalStorage<string>('testKey', 'value'));

    act(() => {
      result.current[1]('someValue');
    });
    expect(localStorage.getItem('testKey')).toBe(JSON.stringify('someValue'));

    // Use removeValue (third element of returned tuple) to remove from localStorage
    act(() => {
      result.current[2]();
    });
    expect(localStorage.getItem('testKey')).toBeNull();
    // Value should reset to initial value
    expect(result.current[0]).toBe('value');
  });
});
