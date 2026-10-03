"""Small stdio client for the unmodified pixel-plugin bundled MCP server."""
import json, subprocess, time, select
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
class PixelMCP:
    def __init__(self):
        self.log=open(ROOT/'runs/d/mcp-calls.jsonl','a')
        self.errors=open(ROOT/'runs/d/mcp-stderr.log','a')
        self.proc=subprocess.Popen([str(ROOT/'vendor/skills/pixel-plugin/bin/pixel-mcp')],stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=self.errors,text=True,bufsize=1)
        self.seq=0
        self.request('initialize',{'protocolVersion':'2024-11-05','capabilities':{},'clientInfo':{'name':'sprite-lab-test','version':'1.0'}})
        self.proc.stdin.write(json.dumps({'jsonrpc':'2.0','method':'notifications/initialized'})+'\n');self.proc.stdin.flush()
    def request(self,method,params):
        self.seq+=1;payload={'jsonrpc':'2.0','id':self.seq,'method':method,'params':params};self.proc.stdin.write(json.dumps(payload)+'\n');self.proc.stdin.flush()
        deadline=time.monotonic()+90
        while time.monotonic()<deadline:
            if not select.select([self.proc.stdout],[],[],1)[0]:continue
            line=self.proc.stdout.readline()
            if not line:raise RuntimeError('MCP server exited; see mcp-stderr.log')
            result=json.loads(line)
            if result.get('id')!=self.seq:continue
            self.log.write(json.dumps({'request':payload,'response':result})+'\n');self.log.flush()
            if 'error' in result:raise RuntimeError(result['error'])
            if result.get('result',{}).get('isError'):raise RuntimeError(result['result'])
            return result['result']
        raise TimeoutError(method)
    def call(self,name,**args):return self.request('tools/call',{'name':name,'arguments':args})
    def close(self):
        self.proc.terminate();self.proc.wait(timeout=10);self.log.close();self.errors.close()
if __name__=='__main__':
    client=PixelMCP()
    try:
        schemas=client.request('tools/list',{})
        (ROOT/'runs/d/tool-schemas.json').write_text(json.dumps(schemas,indent=2))
        print('Available tools:',', '.join(t['name'] for t in schemas['tools']))
    finally:client.close()
