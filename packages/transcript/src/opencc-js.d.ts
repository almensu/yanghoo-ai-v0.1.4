declare module 'opencc-js' {
  export function Converter(options: { from: string; to: string }): (text: string) => string;
  export function ConverterFactory(...dicts: any[]): (text: string) => string;
  export function CustomConverter(dict: any): (text: string) => string;
  export function HTMLConverter(converter: (text: string) => string, element: any, from: string, to: string): any;
  export const Locale: any;
  export class Trie {
    constructor();
    addWord(word: string, val: string): void;
    loadDict(dict: string | string[][]): void;
    loadDictGroup(dicts: any[]): void;
    convert(text: string): string;
  }
}
