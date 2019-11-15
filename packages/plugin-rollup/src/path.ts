export const isAbsolutePath = (path: string) => /^(?:\/|(?:[A-Za-z]:)?[\\|/])/.test(path);

export const isRelativePath = (path: string) => /^\.?\.\//.test(path);
