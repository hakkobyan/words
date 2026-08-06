import {fetch as undiciFetch} from 'undici';
export default function handler(req: any, res: any) {
  res.status(200).json({probe: 'undici', hasFetch: typeof undiciFetch});
}
