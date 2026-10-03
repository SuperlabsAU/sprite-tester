"""Draw and export authored poses through the real pixel-plugin MCP server."""
import json,sys
from pathlib import Path
from mcp_client import PixelMCP,ROOT
from poses import pose

def decoded(result):
    if 'structuredContent' in result:return result['structuredContent']
    for item in result.get('content',[]):
        if item.get('type')=='text':
            try:return json.loads(item['text'])
            except json.JSONDecodeError:pass
    raise ValueError(result)

def generate(views,actions):
    client=PixelMCP()
    try:
        for view in views:
            for action in actions:
                folder=ROOT/f'runs/d/{view}/{action}';folder.mkdir(parents=True,exist_ok=True)
                n=128 if view=='street' else 64
                result=decoded(client.call('create_canvas',width=n,height=n,color_mode='rgb'));path=result['file_path']
                client.call('add_layer',sprite_path=path,layer_name='Character')
                timing=[120]*6 if action=='walk' else [90]*6 if action=='run' else [140,70,100,140,100,130]
                # Allocate all frames while the document is blank, avoiding copied pose ghosts.
                for duration in timing[1:]:client.call('add_frame',sprite_path=path,duration_ms=duration)
                records=[]
                for i in range(6):
                    pixels,record=pose(view,action,i);records.append(record)
                    client.call('draw_pixels',sprite_path=path,layer_name='Character',frame_number=i+1,pixels=pixels)
                    client.call('set_frame_duration',sprite_path=path,frame_number=i+1,duration_ms=timing[i])
                client.call('create_tag',sprite_path=path,tag_name=action,from_frame=1,to_frame=6,direction='forward')
                info=decoded(client.call('get_sprite_info',sprite_path=path));assert info['frame_count']==6
                client.call('save_as',sprite_path=path,output_path=str(folder/'character.aseprite'))
                out=decoded(client.call('export_spritesheet',sprite_path=path,output_path=str(folder/'strip.png'),layout='horizontal',padding=0,include_json=True))
                (folder/'pose-metadata.json').write_text(json.dumps({'frames':records,'timing':timing,'info':info,'export':out},indent=2))
                print(f'Exported {view}/{action}: 6 frames through pixel-plugin',flush=True)
    finally:client.close()
if __name__=='__main__':
    generate([sys.argv[1]] if len(sys.argv)>1 else ['platform','street','isometric','rpg'],[sys.argv[2]] if len(sys.argv)>2 else ['walk','run','jump'])
