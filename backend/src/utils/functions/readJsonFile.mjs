import fs from 'fs/promises';

async function readJsonFile(filePath) {
    try {
        const fileContents = await fs.readFile(filePath, 'utf8');
        return JSON.parse(fileContents);
    } catch (error) {
        if (error.code === 'ENOENT') {
            throw new Error(`File not found: ${filePath}`);
        } else if (error instanceof SyntaxError) {
            throw new Error(`Invalid JSON format in file: ${filePath}`);
        } else {
            throw error;
        }
    }
}

export default readJsonFile;