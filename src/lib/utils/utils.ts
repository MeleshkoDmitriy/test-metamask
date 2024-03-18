export const cutString = (text: string | Array<string>): string | null => {
    let shortString = null;
    if (typeof text === 'string') {
        shortString = `${text.substring(0, 4)}...${text.substring(text.length - 4)}`;
    } else if (Array.isArray(text)) {
        text = text[0];
        shortString = `${text.substring(0, 4)}...${text.substring(text.length - 4)}`;
    }

    return shortString;
}
