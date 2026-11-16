#!/usr/bin/env python3
"""Focused HTML regression check for observed generic business media. Stdlib only."""
import argparse,json,re,sys
from pathlib import Path
from html.parser import HTMLParser
VOID={'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
WRAPPERS={'biz-cover','bz-cover','bz-media','sp-cover','business-media','business-photo'}
ART=re.compile(r'art-(?:cover|sticker)-|/art/(?:sticker|cover)|(?:^|\s)(?:ed-art|bz-stk|sp-stk|outline-stk)(?:\s|$)',re.I)
class Audit(HTMLParser):
 def __init__(self):super().__init__();self.stack=[];self.findings=[];self.cover_images=[];self.all_media=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs);classes=set(a.get('class','').split());scope=bool(classes&WRAPPERS) or (tag=='a' and re.search(r'(?:^|https?://[^/]+)/b/',a.get('href','')) is not None)
  inside=scope or any(x[1] for x in self.stack)
  detail='biz-cover' in classes or any(x[2] for x in self.stack)
  vals=' '.join(a.get(k,'') for k in ('src','srcset','style','class','data-src','data-srcset','poster'))
  if inside and ART.search(vals):self.findings.append({'line':self.getpos()[0],'tag':tag,'src':a.get('src',''),'class':a.get('class',''),'style':a.get('style','')})
  if inside and tag in {'img','source'}:self.all_media.append(a)
  if detail and tag in {'img','source'}:self.cover_images.append(a)
  if tag not in VOID:self.stack.append((tag,scope,detail))
 def handle_endtag(self,tag):
  for i in range(len(self.stack)-1,-1,-1):
   if self.stack[i][0]==tag:self.stack=self.stack[:i];break
 def handle_startendtag(self,tag,attrs):self.handle_starttag(tag,attrs);self.handle_endtag(tag)
def main():
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('directory');p.add_argument('--output',default='business-art-findings.json');a=p.parse_args();rows=[];files=list(Path(a.directory).rglob('*.html'))
 for f in files:
  x=Audit();x.feed(f.read_text(errors='replace'))
  if x.findings:rows.append({'file':str(f),'findings':x.findings})
 Path(a.output).write_text(json.dumps({'html_files_scanned':len(files),'files_with_findings':len(rows),'results':rows},indent=2))
 print(f'{len(files)} HTML files scanned; {len(rows)} contain known business artwork. CSS/JS/dynamic and unknown artwork require separate review.')
 return 1 if rows else 0
if __name__=='__main__':sys.exit(main())
