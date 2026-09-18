export const ANSWERS = new Map([
  [1,['4689']], [2,['WEITER']], [3,['3174']], [4,['KERZE']], [5,['STERN']], [6,['FROST']],
  [7,['EIS']], [8,['FENSTER']], [9,['5283']], [10,['1526']], [11,['SCHLEIFE']], [12,['SCHLEIFE']],
  [13,['FLOCKE']], [14,['435']], [15,['BAND']], [16,['7419']], [17,['12357']], [18,['GLOCKE']],
  [19,['628']], [20,['TORF']], [21,['742']], [22,['ADVENT']], [23,['WEG']], [24,['4729']]
]);
export const SEALS = new Map([[6,{roman:'I',digit:'4',piece:1}],[12,{roman:'II',digit:'7',piece:2}],[18,{roman:'III',digit:'2',piece:3}],[23,{roman:'IV',digit:'9',piece:4}]]);
export const TOTAL_STAGES = 24;
export function normalize(v){return String(v??'').normalize('NFKC').toLocaleUpperCase('de-DE').replace(/s+/g,'').replace(/Ä/g,'AE').replace(/Ö/g,'OE').replace(/Ü/g,'UE').replace(/ẞ|ß/g,'SS')}
export function accepts(stage,value){const a=ANSWERS.get(Number(stage))||[]; const n=normalize(value); return a.some(x=>normalize(x)===n)}
