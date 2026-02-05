export type TagType = 'STRATEGY' | 'MISTAKE';

export interface Tag {
    id: string;
    name: string;
    type: TagType;
    color: string; // Hex code, e.g., "#FF0000"
}
