import { describe, test, expect } from 'vitest';
import { days_ago_text, name_from_file_path } from './helper';
import { add } from 'date-fns';

describe('helper', () => {
    describe('days_ago_text', () => {
        test('today', () => {
            expect(days_ago_text(new Date())).toBe('today');
        });

        test('yesterday', () => {
            const yesterday = add(new Date(), { days: -1 });
            expect(days_ago_text(yesterday)).toBe('1d ago');
        });

        test('2 days ago', () => {
            const two_days_ago = add(new Date(), { days: -2 });
            expect(days_ago_text(two_days_ago)).toBe('2d ago');
        });

        test('in future', () => {
            const in_future = add(new Date(), { days: 1 });
            expect(days_ago_text(in_future)).toBe('in 1d');
        });
    });

    describe('name_from_file_path', () => {
        test('simple', () => {
            expect(name_from_file_path('foo.md')).toBe('foo');
        });

        test('with path', () => {
            expect(name_from_file_path('foo/bar.md')).toBe('bar');
        });

        test('with deep path', () => {
            expect(name_from_file_path('baz/foo/bar.md')).toBe('bar');
        });
    });
});
