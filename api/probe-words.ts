import englishWords from 'an-array-of-english-words';
export default function handler(req: any, res: any) {
  res.status(200).json({probe: 'words', count: (englishWords as string[]).length});
}
