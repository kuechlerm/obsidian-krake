import { describe, test, expect } from 'vitest';
import { days_ago_text, name_from_file_path, parse_config } from './helper';
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

    describe('parse_config', () => {
        test('empty lines', () => {
            const config = parse_config('');
            expect(config).toEqual({
                type: '',
            });
        });

        test('only type specified', () => {
            const config = parse_config('type:entry-header');
            expect(config).toEqual({
                type: 'entry-header',
            });
        });

        test('multiple config lines', () => {
            const config = parse_config('type:entry-header\ndone:true');
            expect(config).toEqual({
                type: 'entry-header',
                done: 'true',
            });
        });
    });
});
