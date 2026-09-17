// Dependency-free local preview. GitHub Pages serves the same public files.
import http from 'node:http';
import {readFile} from 'node:fs/promises';
const port=Number(process.env.PORT || 4173);
const routes=new Map([['/','index.html'],['/index.html','index.html'],['/styles.css','styles.css'],['/app.js','app.js'],['/favicon.svg','favicon.svg'],['/data/vehicles.json','data/vehicles.json']]);
const types={html:'text/html; charset=utf-8',css:'text/css; charset=utf-8',js:'text/javascript; charset=utf-8',svg:'image/svg+xml',json:'application/json; charset=utf-8'};
http.createServer(async(req,res)=>{
  const path=new URL(req.url,'http://localhost').pathname;
  if (!['GET','HEAD'].includes(req.method)) {res.writeHead(405);res.end();return;}
  const file=routes.get(path);
  if (!file) {res.writeHead(404);res.end('Not found');return;}
  try {
    const body=await readFile(new URL(file,import.meta.url));
    res.writeHead(200,{'Content-Type':types[file.split('.').pop()],'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
    res.end(req.method==='HEAD'?undefined:body);
  } catch {res.writeHead(500);res.end('Could not read the requested file');}
}).listen(port,'127.0.0.1',()=>console.log(`LaneKind preview: http://127.0.0.1:${port}`));
