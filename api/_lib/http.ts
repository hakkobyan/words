import type {VercelRequest,VercelResponse} from '@vercel/node';

/**
 * The endpoints hold no user data and need no credentials, so any origin may
 * call them. This is what lets a local or preview build of the app talk to the
 * deployed API instead of needing its own backend.
 *
 * Returns true when the request was a preflight and is already answered.
 */
export function applyCors(req:VercelRequest,res:VercelResponse){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  res.setHeader('Access-Control-Max-Age','86400');
  if(req.method!=='OPTIONS')return false;
  res.status(204).end();
  return true;
}
