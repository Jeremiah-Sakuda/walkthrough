import { readFileSync, writeFileSync, mkdirSync, renameSync, existsSync } from 'node:fs';
import { join } from 'node:path';
export class Store {
  constructor(dir, initial) { this.dir=dir; this.path=join(dir,'walkthrough.json'); mkdirSync(dir,{recursive:true}); this.data=existsSync(this.path)?JSON.parse(readFileSync(this.path,'utf8')):initial(); this.save(); }
  save() { const temp=this.path+'.tmp'; writeFileSync(temp,JSON.stringify(this.data,null,2),{mode:0o600}); renameSync(temp,this.path); }
}
export class MemoryStore {constructor(initial){this.data=initial();}save(){}}
