export default function handler(req: any, res: any) {
  res.status(200).json({probe: 'bare', node: process.version});
}
