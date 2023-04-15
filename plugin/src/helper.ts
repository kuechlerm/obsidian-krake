import {
    add,
    differenceInDays,
    isAfter,
    isBefore,
    isSameDay,
    parse,
} from 'date-fns';
import type { DB, Entry, EntryType } from './types';
import { paths } from './paths';

export const create_date_filter = (config: string) => {
    let clean_config = config.replaceAll(' ', '');

    let modifier: '=' | '<' | '>' = '=';
    if (clean_config.startsWith('<') || clean_config.startsWith('>')) {
        modifier = clean_config.substring(0, 1) as '=' | '<' | '>';
        clean_config = clean_config.substring(1);
    }

    let plus_minus = '';
    if (clean_config.includes('+')) plus_minus = '+';
    if (clean_config.includes('-')) plus_minus = '-';

    let date_text = clean_config;
    const time_diff = { no: 0, domain: 'd' };

    if (plus_minus) {
        const [date_part, time] = clean_config.split(plus_minus);
        date_text = date_part;

        const domain_char = time.charAt(time.length - 1);
        time_diff.domain =
            domain_char === 'm'
                ? 'months'
                : domain_char === 'y'
                ? 'years'
                : 'days';
        time_diff.no = parseInt(time.substring(0, time.length - 1));
    }

    let config_date =
        date_text === 'today'
            ? new Date()
            : parse(date_text, 'dd.MM.yyyy', new Date());

    if (plus_minus) {
        config_date = add(config_date, { [time_diff.domain]: time_diff.no });
    }

    return (date: Date) =>
        modifier === '<'
            ? isBefore(date, config_date)
            : modifier === '>'
            ? isAfter(date, config_date)
            : isSameDay(date, config_date);
};

export const days_ago_text = (date: Date) => {
    const diff = differenceInDays(date, new Date());

    if (diff === 0) return 'today';

    if (diff > 0) return `in ${diff}d`;
    return `${Math.abs(diff)}d ago`;
};

export function get_collection(db: DB, entry_type: EntryType): Entry[] {
    if (entry_type === 0) return db.tasks;
    if (entry_type === 1) return db.projects;
    if (entry_type === 2) return db.topics;

    throw new Error('Not possible');
}

export function byStringProperty<T>(name: keyof T) {
    return (a: T, b: T) => {
        return String(a[name]).localeCompare(String(b[name]));
    };
}

export function name_from_file_path(path: string) {
    const parts = path.split('/');
    return parts[parts.length - 1].replace('.md', '');
}

export function parse_config(source: string) {
    const lines = source.split('\n');

    const config: any = lines.reduce((obj, l) => {
        const [key, value] = l.split(':').map((x) => x.trim());
        return { ...obj, [key]: value };
    }, {});

    config.type ??= '';

    return config;
}

export function path_to_collection(path: string): [EntryType, boolean] {
    if (path.startsWith(paths.task)) return [0, false];
    if (path.startsWith(paths.project)) return [1, false];
    if (path.startsWith(paths.topic)) return [2, false];

    if (path.startsWith(paths.task_archive)) return [0, true];
    if (path.startsWith(paths.project_archive)) return [1, true];
    if (path.startsWith(paths.topic_archive)) return [2, true];

    throw new Error('Unkown path');
}

export function entry_type_to_folder_path(entry_type: EntryType) {
    if (entry_type === 0) return paths.task;
    if (entry_type === 1) return paths.project;
    if (entry_type === 2) return paths.topic;

    throw new Error('Not possible');
}
