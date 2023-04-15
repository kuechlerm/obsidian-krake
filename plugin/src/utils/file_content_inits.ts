export function entry_header_file_content() {
    const file_lines = ['', '```krake', 'type:entry-header', '```', ''];

    return file_lines.join('\n');
}
