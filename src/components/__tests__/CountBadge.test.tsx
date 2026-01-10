/**
 * @file components/__tests__/CountBadge.test.tsx
 * @description Unit tests for CountBadge component.
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { CountBadge } from '../CountBadge';

describe('CountBadge', () => {
  describe('rendering', () => {
    it('renders the count when positive', () => {
      render(<CountBadge count={5} />);
      expect(screen.getByText('5')).toBeTruthy();
    });

    it('renders count up to 99', () => {
      render(<CountBadge count={99} />);
      expect(screen.getByText('99')).toBeTruthy();
    });

    it('renders "99+" when count exceeds 99', () => {
      render(<CountBadge count={100} />);
      expect(screen.getByText('99+')).toBeTruthy();
    });

    it('renders "99+" for very large counts', () => {
      render(<CountBadge count={9999} />);
      expect(screen.getByText('99+')).toBeTruthy();
    });
  });

  describe('edge cases - returns null', () => {
    it('returns null when count is 0', () => {
      const { toJSON } = render(<CountBadge count={0} />);
      expect(toJSON()).toBeNull();
    });

    it('returns null when count is negative', () => {
      const { toJSON } = render(<CountBadge count={-5} />);
      expect(toJSON()).toBeNull();
    });

    it('returns null when count is NaN', () => {
      const { toJSON } = render(<CountBadge count={NaN} />);
      expect(toJSON()).toBeNull();
    });

    it('returns null when count is Infinity', () => {
      const { toJSON } = render(<CountBadge count={Infinity} />);
      expect(toJSON()).toBeNull();
    });

    it('returns null when count is -Infinity', () => {
      const { toJSON } = render(<CountBadge count={-Infinity} />);
      expect(toJSON()).toBeNull();
    });
  });

  describe('props', () => {
    it('accepts animateOnMount prop without crashing', () => {
      render(<CountBadge count={10} animateOnMount={true} />);
      expect(screen.getByText('10')).toBeTruthy();
    });

    it('defaults animateOnMount to false', () => {
      render(<CountBadge count={10} />);
      expect(screen.getByText('10')).toBeTruthy();
    });
  });
});
