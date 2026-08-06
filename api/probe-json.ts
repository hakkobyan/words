import words from './_data/en.json';
export default function handler(req: any, res: any) {
  res.status(200).json({probe: 'json', count: (words as string[]).length});
}
