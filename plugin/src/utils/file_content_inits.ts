export function entry_header_file_content(type: 'task' | 'project' | 'topic') {
    const file_lines = ['', '```krake', 'type:entry-header', '```', ''];

    if (type !== 'task') {
        if (type === 'topic') {
            file_lines.push(
                ...[
                    '#### Topics',
                    '```krake',
                    'type:topics',
                    'children:true',
                    '```',
                    '',
                    '#### Projects',
                    '```krake',
                    'type:projects',
                    'children:true',
                    '```',
                    '',
                ]
            );
        }

        file_lines.push(
            ...[
                '#### Tasks',
                '```krake',
                'type:tasks',
                'children:true',
                '```',
                '',
            ]
        );
    }

    file_lines.push('');

    return file_lines.join('\n');
}
