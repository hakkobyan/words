export function normalizeAnswer(value:string):string{
  return value.trim().toLowerCase().replace(/[.,!?;:"'()]/g,'').replace(/ё/g,'е').replace(/\s+/g,' ');
}

export function isCorrectAnswer(input:string,answers:string[]):boolean{
  const normalized=normalizeAnswer(input);
  if(!normalized)return false;
  return answers.some(answer=>normalizeAnswer(answer)===normalized);
}
