import sys,glob
from PIL import Image
pat,out,cols=sys.argv[1],sys.argv[2],int(sys.argv[3]) if len(sys.argv)>3 else 6
fs=sorted(glob.glob(pat)); w,h=270,480
rows=(len(fs)+cols-1)//cols
S=Image.new('RGB',(cols*w,rows*h),'black')
for i,f in enumerate(fs):
    S.paste(Image.open(f).convert('RGB').resize((w,h)),((i%cols)*w,(i//cols)*h))
S.save(out,quality=88)
