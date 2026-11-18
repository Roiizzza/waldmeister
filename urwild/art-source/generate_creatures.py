import bpy, math, os, json
from mathutils import Vector
from math import sin,cos,pi
SRC=os.path.dirname(os.path.abspath(__file__))
OUT=os.path.abspath(os.path.join(SRC,'../assets'))
os.makedirs(OUT,exist_ok=True)
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
M={}
def mat(n,c):
 c=tuple(v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in c)
 m=bpy.data.materials.new(n); m.diffuse_color=(*c,1); m.use_nodes=True
 bs=m.node_tree.nodes.get('Principled BSDF'); bs.inputs['Base Color'].default_value=(*c,1); bs.inputs['Roughness'].default_value=.82
 M[n]=m; return m
for n,c in {'mint':(.37,.65,.39),'mintLight':(.65,.76,.43),'teal':(.075,.32,.29),'rust':(.62,.24,.10),'rustLight':(.82,.39,.16),'rustDark':(.37,.13,.07),'ivory':(.9,.79,.52),'claw':(.34,.29,.21),'black':(.025,.025,.017),'eye':(.91,.64,.20),'white':(.96,.92,.77),'leather':(.29,.12,.052),'leatherLight':(.49,.25,.10),'blanket':(.045,.34,.34),'brass':(.69,.47,.16),'skin':(.64,.36,.19),'tunic':(.68,.57,.36),'pants':(.22,.24,.17),'hair':(.055,.035,.025),'dodo':(.57,.49,.34),'feather':(.79,.73,.56),'beak':(.69,.38,.105),'blue':(.13,.39,.43),'blueLight':(.26,.59,.57),'blueDark':(.055,.20,.26),'purple':(.40,.34,.38),'plate':(.63,.35,.23),'ank':(.42,.43,.24),'ankLight':(.64,.59,.34)}.items():mat(n,c)
root=None; joints=[]; parts=[]; bodyshape=[]
def emp(n,loc=(0,0,0),par=None):
 o=bpy.data.objects.new(n,None); bpy.context.collection.objects.link(o); o.location=loc
 if par: parent(o,par)
 return o
def parent(o,p):
 mw=o.matrix_world.copy(); bpy.context.view_layer.update(); mw=o.matrix_world.copy(); o.parent=p; o.matrix_world=mw
 return o
def mesh(n,verts,faces,material,par=None):
 me=bpy.data.meshes.new(n); me.from_pydata(verts,[],faces); me.update(); o=bpy.data.objects.new(n,me); bpy.context.collection.objects.link(o); o.data.materials.append(M[material]);
 for f in me.polygons:f.use_smooth=True
 parent(o,par or root); parts.append(o); return o
def uv(n,loc,scale,ma,par=None,seg=14,rings=9):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=seg,ring_count=rings,location=loc); o=bpy.context.object; o.name=n; o.scale=scale; bpy.ops.object.transform_apply(location=False,rotation=False,scale=True); o.data.materials.append(M[ma]);
 for f in o.data.polygons:f.use_smooth=True
 parent(o,par or root); parts.append(o); return o
def tube(n,pts,ma,par=None,sides=12):
 # points: x,y,z,radius in local cross section, optional aspect
 verts=[]
 for i,p in enumerate(pts):
  c=Vector(p[:3]); prev=Vector(pts[max(0,i-1)][:3]); nxt=Vector(pts[min(len(pts)-1,i+1)][:3]); t=(nxt-prev).normalized(); ref=Vector((1,0,0));
  if abs(t.dot(ref))>.95:ref=Vector((0,1,0))
  u=(ref-t*t.dot(ref)).normalized(); v=t.cross(u).normalized(); asp=p[4] if len(p)>4 else 1
  for j in range(sides):
   a=j*2*pi/sides; vv=c+p[3]*(cos(a)*u+sin(a)*v*asp); verts.append(tuple(vv))
 faces=[]
 for i in range(len(pts)-1):
  for j in range(sides):a=i*sides+j;b=i*sides+(j+1)%sides;faces.append((a,b,b+sides,a+sides))
 faces.append(tuple(reversed(range(sides)))); faces.append(tuple((len(pts)-1)*sides+j for j in range(sides)))
 return mesh(n,verts,faces,ma,par)
def loft(n,sections,ma,par=None):
 # y, z, width, height
 global bodyshape
 if n in ['PearShapedBody','MassiveBarrel','AthleticTorso']:bodyshape=sections
 vs=[]; sides=20
 for y,z,w,h in sections:
  for j in range(sides):a=j*2*pi/sides;vs.append((w*cos(a),y,z+h*sin(a)))
 fs=[]
 for i in range(len(sections)-1):
  for j in range(sides):a=i*sides+j;b=i*sides+(j+1)%sides;fs.append((a,b,b+sides,a+sides))
 fs.extend([tuple(reversed(range(sides))),tuple((len(sections)-1)*sides+j for j in range(sides))]);return mesh(n,vs,fs,ma,par)
def box(n,loc,scale,ma,par=None,bev=.06):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=n;o.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(M[ma]);b=o.modifiers.new('Rounded stitched edges','BEVEL');b.width=bev;b.segments=3;bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=b.name)
 for p in o.data.polygons:p.use_smooth=True
 parent(o,par or root);parts.append(o);return o
def eyes(y,z,w,par=None,scale=.10):
 for s in [-1,1]:
  uv('EyeSocket', (s*w,y,z),(scale*.50,scale*1.18,scale*1.15),'claw',par)
  uv('AmberEye',(s*(w+scale*.25),y-scale*.10,z),(scale*.35,scale*.81,scale*.84),'eye',par)
  uv('Pupil',(s*(w+scale*.45),y-scale*.27,z),(scale*.13,scale*.39,scale*.52),'black',par)
  uv('EyeGlint',(s*(w+scale*.55),y-scale*.42,z+scale*.24),(scale*.07,scale*.16,scale*.16),'white',par,12,8)
def joint(n,loc,p=None,kind='leg',phase=0):
 o=emp(n,loc,p or root);joints.append((o,kind,phase));return o
def dleg(side,y,z,ma,size=1,fore=False):
 x=side*(.46 if fore else .53)*size
 hip=joint(('Front' if fore else 'Hind')+('Left' if side<0 else 'Right'),(x,y,z),phase=(0 if side<0 else pi)+(pi if fore else 0))
 knee=(x*1.06,y+(.10 if fore else -.22)*size,z-.48*size)
 tube('MuscularUpperLeg',[(x,y,z,.23*size),(x*1.05,y-.03,z-.19*size,.25*size),(*knee,.16*size)],ma,hip)
 low=joint('Knee',knee,hip,kind='knee',phase=(0 if side<0 else pi)+(pi if fore else 0))
 ankle=(x*1.05,y+.03*size,.16*size)
 tube('TaperedShin',[(*knee,.16*size),(x*1.08,y+.12*size,.34*size,.12*size),(*ankle,.13*size)],ma,low)
 uv('Foot',(x*1.05,y-.09*size,.13*size),(.20*size,.31*size,.13*size),ma,low)
 for k in [-1,0,1]: uv('ToeClaw',(x*1.05+k*.115*size,y-.31*size,.105*size),(.065*size,.12*size,.065*size),'claw',low,12,8)
def saddle(z,width=.7,length=.9):
 s=emp('Saddle',(0,0,0),root);b=emp('Bags',(0,0,0),root)
 # blanket curved over barrel
 verts=[];fs=[]
 for yy in [-length*.6,length*.6]:
  for k in range(13):a=-1.25+k*2.5/12;verts.append((width*sin(a),yy,z-.48*(1-cos(a))))
 for k in range(12):fs.append((k,k+1,k+14,k+13))
 mesh('TealWovenBlanket',verts,fs,'blanket',s)
 for yy in [-length*.60,length*.60]:tube('BlanketGoldHem',[(width*sin(-1.25+k*2.5/12),yy,z-.48*(1-cos(-1.25+k*2.5/12)),.018) for k in range(13)],'ivory',s,6)
 uv('LeatherSeat',(0,0,z+.035),(width*.67,length*.54,.12),'leatherLight',s)
 for yy in [-length*.48,length*.45]:tube('RaisedSaddleRoll',[(-width*.57,yy,z+.09,.08),(0,yy,z+.23,.095),(width*.57,yy,z+.09,.08)],'leather',s)
 for k in range(7):tube('WovenSeatLacing',[(-width*.52,-length*.35+k*length*.11,z+.13,.012),(width*.52,-length*.35+k*length*.11,z+.13,.012)],'ivory',s,5)
 for sign in [-1,1]:
  for yy in [-length*.4,length*.37]:tube('LeatherGirth',[(sign*width*.55,yy,z+.09,.035),(sign*width*.97,yy,z-.16,.035),(sign*width,yy,z-.45,.035)],'leather',s,8)
  x=sign*width*1.05
  box('LeatherPannier',(x,.04,z-.40),(.26,length*.62,.43),'leather',b,.055)
  box('PannierFlap',(x,.01,z-.20),(.29,length*.68,.13),'leatherLight',b,.045)
  for yy in [-length*.17,length*.17]:
   box('PannierStrap',(x+sign*.14,yy,z-.39),(.026,.055,.36),'leatherLight',b,.01)
   box('BrassBuckle',(x+sign*.16,yy,z-.35),(.025,.085,.09),'brass',b,.012)
 emp('RiderSeat',(0,0,z+.32),root)
 return s,b

def stripe(n,sign,y,w,cz,bw,bh,ma):
 vs=[]
 for i in range(7):
  a=.20+i*.20
  for edge in [-1,1]:
   yy=y+edge*w*(.3+.7*sin(a))+sin(a*3)*.04
   sect=sorted(bodyshape)
   for p,q in zip(sect,sect[1:]):
    if p[0]<=yy<=q[0]:
     t=(yy-p[0])/(q[0]-p[0]); cz,bw,bh=[p[k]*(1-t)+q[k]*t for k in [1,2,3]];break
   vs.append((sign*(bw+.007)*sin(a),yy,cz+(bh+.007)*cos(a)))
 return mesh(n,vs,[(i*2,i*2+1,i*2+3,i*2+2) for i in range(6)],ma)

def parasaur():
 loft('PearShapedBody',[(1.05,1.25,.12,.13),(.75,1.24,.62,.61),(.15,1.32,.73,.66),(-.5,1.42,.60,.62),(-.9,1.52,.36,.45),(-1.1,1.65,.18,.30)],'mint')
 tail=joint('Tail',(0,.72,1.35),kind='tail');tube('LongTaperingTail',[(0,.72,1.35,.43),(0,1.4,1.12,.34),(0,2.15,.83,.20),(0,2.8,.63,.075),(0,3.03,.62,.012)],'mint',tail,16)
 neck=joint('Neck',(0,-.78,1.52),kind='neck');tube('UprightCurvedNeck',[(0,-.78,1.48,.34),(0,-1.15,2.22,.28),(0,-1.43,3.00,.22),(0,-1.62,3.46,.23)],'mint',neck,16)
 tube('CreamThroat',[(0,-1.08,1.46,.18),(0,-1.43,2.35,.17),(0,-1.66,3.20,.15)],'mintLight',neck,12)
 loft('DuckBillHead',[(-1.35,3.42,.13,.16),(-1.65,3.49,.26,.25),(-1.95,3.45,.24,.18),(-2.22,3.36,.22,.115),(-2.36,3.34,.17,.07)],'mint',neck)
 uv('DuckBill',(0,-2.29,3.32),(.235,.16,.10),'mintLight',neck)
 tube('SweepingIvoryCrest',[(0,-1.93,3.67,.13),(0,-1.70,3.88,.14),(0,-1.40,3.97,.125),(0,-1.1,3.95,.095),(0,-.90,3.84,.055),(0,-.85,3.78,.018)],'ivory',neck,14)
 eyes(-1.80,3.55,.241,neck,.09)
 for sign in [-1,1]:
  tube('MouthLine',[(sign*.17,-2.34,3.29,.012),(sign*.23,-2.17,3.28,.012),(sign*.22,-2.01,3.30,.01)],'teal',neck,6)
  uv('Nostril',(sign*.18,-2.30,3.38),(.025,.034,.023),'teal',neck,10,6)
  for i in range(5):
   yy=.69-i*.27; stripe('TealFlankMark',sign,yy,.07,1.32,.68 if i<3 else .59,.65,'teal')
  for i in range(3):uv('NeckStripe',(sign*.245,-1.3-i*.10,2.65+i*.27),(.03,.10,.12),'teal',neck,12,8)
 for s in [-1,1]:dleg(s,.40,1.25,'mint',1.1);dleg(s,-.73,1.12,'mint',.75,True)
 saddle(1.98,.74,.94)

def trike():
 loft('MassiveBarrel',[(1.12,1.18,.13,.18),(.88,1.20,.66,.68),(.1,1.25,.84,.73),(-.62,1.27,.79,.71),(-1.04,1.23,.48,.47)],'rust')
 tail=joint('Tail',(0,.9,1.3),kind='tail');tube('HeavyTail',[(0,.9,1.3,.40),(0,1.7,1.08,.28),(0,2.4,.81,.12),(0,2.9,.72,.015)],'rust',tail,14)
 head=joint('Neck',(0,-.92,1.25),kind='neck');loft('WedgeFace',[(-.95,1.36,.48,.43),(-1.25,1.27,.49,.44),(-1.67,1.04,.34,.29),(-2.07,.90,.24,.20),(-2.27,.85,.16,.14)],'rustLight',head)
 uv('BeakedMuzzle',(0,-2.18,.81),(.26,.23,.17),'rustDark',head)
 # fan frill, rim follows raised scalloped shield
 v=[(0,-1.0,1.38)]; outline=[]
 for j in range(21):
  a=-pi*.05+pi*1.1*j/20;outline.append((.92*cos(a),-.97+.12*sin(a),1.44+.98*sin(a)))
 v+=outline;mesh('WideScallopedFrill',v,[(0,j+1,j+2) for j in range(20)],'rust',head)
 tube('CreamFrillRim',[(*p,.065) for p in outline],'rustLight',head,8)
 for j in range(1,20,2):
  x,y,z=outline[j];uv('FrillIvoryNodule',(x,y-.02,z),(.09,.07,.10),'ivory',head,12,8)
 for x in [-.43,.43]:
  tube('GreatBrowHorn',[(x,-1.40,1.55,.14),(x*1.13,-1.78,1.80,.105),(x*1.12,-2.18,1.99,.045),(x*1.05,-2.43,2.04,.006)],'ivory',head,12)
 tube('NasalHorn',[(0,-2.04,1.02,.11),(0,-2.20,1.30,.07),(0,-2.35,1.48,.006)],'ivory',head,12)
 eyes(-1.51,1.35,.405,head,.095)
 for s in [-1,1]:
  for i in range(6):stripe('TigerFlankStripe',s,.73-i*.25,.055,1.25,.80 if i>0 and i<5 else .67,.72,'rustDark')
  dleg(s,.62,1.10,'rust',1.04);dleg(s,-.75,1.05,'rust',1.02,True)
 saddle(2.00,.83,1.08)

def dodo():
 loft('PlumpFeatheredBody',[(.44,.54,.06,.09),(.29,.61,.31,.35),(0,.65,.40,.40),(-.28,.67,.30,.32),(-.38,.77,.15,.20)],'dodo')
 neck=joint('Neck',(0,-.27,.76),kind='neck');tube('CurvedFeatherNeck',[(0,-.27,.75,.17),(0,-.39,.96,.13),(0,-.44,1.18,.13),(0,-.53,1.27,.15)],'feather',neck,12)
 uv('DodoHead',(0,-.56,1.29),(.22,.24,.22),'feather',neck)
 tube('LargeHookedBeak',[(0,-.70,1.29,.16),(0,-.88,1.25,.16),(0,-1.0,1.18,.11),(0,-1.02,1.08,.025)],'beak',neck,12)
 eyes(-.62,1.35,.197,neck,.061)
 for s in [-1,1]:
  uv('TinyWing',(s*.34,.01,.69),(.10,.25,.22),'feather')
  for k in range(3):tube('WingFeather',[(s*.37,.06+k*.08,.72,.06),(s*.40,.20+k*.08,.49,.015)],'dodo',sides=8)
  leg=joint('Leg', (s*.14,.05,.31),phase=0 if s<0 else pi)
  tube('ScaledLeg',[(s*.14,.05,.34,.05),(s*.14,.04,.14,.043),(s*.14,-.04,.06,.035)],'beak',leg,8)
  for j in [-1,0,1]:tube('SplayedToe',[(s*.14,-.02,.055,.026),(s*.14+j*.065,-.21,.035,.017)],'beak',leg,8)
 for i in range(5):tube('TailFeather',[(0,.30,.75,.08),((i-2)*.06,.53,.87+sin(i)*.05,.085),((i-2)*.08,.60,.97,.015)],'feather',sides=8)
 emp('RiderSeat',(0,0,1.0),root)

def predator(rex=False):
 ma='rustDark' if rex else 'blue';light='rustLight' if rex else 'blueLight';dark='rust' if rex else 'blueDark'
 f=1.40 if rex else 1
 loft('AthleticTorso',[(.70,1.31,.15,.20),(.39,1.37,.42,.47),(-.17,1.45,.43,.49),(-.62,1.49,.30,.38),(-.85,1.62,.20,.28)],ma)
 tail=joint('Tail',(0,.53,1.43),kind='tail');tube('CounterbalanceTail',[(0,.53,1.43,.30),(0,1.16,1.45,.25),(0,1.92,1.40,.15),(0,2.60,1.36,.06),(0,2.85,1.39,.008)],ma,tail,14)
 neck=joint('Neck',(0,-.67,1.57),kind='neck');tube('SNeck',[(0,-.68,1.52,.25),(0,-1.00,1.83,.23),(0,-1.18,2.02,.22)],ma,neck,14)
 loft('PredatorSkull',[(-1.00,2.06,.17,.23),(-1.29,2.12,.34 if rex else .23,.25),(-1.65,2.09,.31 if rex else .21,.20),(-1.98,2.04,.23 if rex else .15,.12)],ma,neck)
 loft('Jaw',[(-1.20,1.93,.23,.08),(-1.6,1.91,.25 if rex else .18,.065),(-1.95,1.95,.21 if rex else .14,.06)],light,neck)
 eyes(-1.38,2.21,.32 if rex else .225,neck,.085)
 for s in [-1,1]:
  tube('SharpMouthLine',[(s*(.24 if rex else .17),-1.94,1.99,.013),(s*(.30 if rex else .21),-1.56,1.98,.013)],'black',neck,6)
  for k in range(5):tube('IvoryTeeth',[(s*(.23 if rex else .16),-1.89+k*.13,1.975,.024),(s*(.23 if rex else .16),-1.89+k*.13,1.91,.002)],'ivory',neck,6)
  dleg(s,.25,1.28,ma,1.04)
  arm=joint('SmallArm',(s*.26,-.63,1.46),kind='arm',phase=s)
  tube('BentArm',[(s*.27,-.62,1.45,.085),(s*.40,-.78,1.17,.07),(s*.39,-1.00,1.26,.045)],ma,arm,10)
  for i in [-1,1]:tube('HandClaw',[(s*.39+i*.035,-1.0,1.26,.028),(s*.39+i*.035,-1.12,1.20,.004)],'ivory',arm,8)
  for i in range(5):stripe('BackStripe',s,.38-i*.20,.045,1.42,.415 if i<4 else .31,.47,dark)
 saddle(1.94,.46,.75)
 if rex:
  # scale geometry, empties and joint positions uniformly as one root transform; applied export
  root.scale=(1.52,1.52,1.52)

def armored(stego=False):
 ma='purple' if stego else 'ank';light='plate' if stego else 'ankLight'
 loft('ArmoredBarrel',[(1.04,.96,.14,.15),(.74,1.03,.67,.59),(0,1.07,.82,.64),(-.67,1.05,.64,.55),(-1.02,1.01,.34,.33)],ma)
 neck=joint('Neck',(0,-.86,1.02),kind='neck');tube('LowNeck',[(0,-.84,1.04,.30),(0,-1.3,.85,.22),(0,-1.60,.79,.20)],ma,neck,12)
 loft('LowGrazingHead',[(-1.35,.84,.21,.22),(-1.64,.80,.25,.20),(-1.94,.71,.23,.14),(-2.06,.70,.15,.09)],ma,neck);eyes(-1.63,.91,.24,neck,.065)
 tail=joint('Tail',(0,.85,1.1),kind='tail');tube('ArmoredTail',[(0,.85,1.1,.35),(0,1.55,.90,.24),(0,2.26,.78,.13),(0,2.8,.79,.06)],ma,tail,12)
 if stego:
  for side in [-1,1]:
   for i in range(7):
    yy=-.85+i*.32; h=.38+.50*sin((i+1)*pi/8); x=side*.20;z=1.45+.12*sin(i*pi/7)
    mesh('DiamondBackPlate',[(x-.07,yy-.19,z),(x+.07,yy-.19,z),(x+.08,yy+.1,z+h*.75),(x,yy,z+h),(x-.08,yy+.1,z+h*.75)],[(0,1,2,3,4)],light)
  for side in [-1,1]:
   for y in [2.20,2.55]:tube('TailSpike',[(side*.07,y,.83,.08),(side*.52,y+.17,1.03,.006)],'ivory',tail,8)
 else:
  for row in range(5):
   y=-.6+row*.35
   for col in [-2,-1,0,1,2]:
    x=col*.27; z=1.1+.57*math.sqrt(max(0,1-(x/.83)**2));uv('RaisedArmorScute',(x,y,z),(.19,.22,.095),light,seg=12,rings=6)
  for side in [-1,1]:
   for y in [-.55,0,.55]:tube('FlankSpike',[(side*.72,y,1.25,.115),(side*1.03,y+.10,1.38,.005)],'ivory',sides=8)
  uv('TailClub',(0,2.75,.80),(.35,.35,.20),light,tail)
 for s in [-1,1]:dleg(s,.59,.89,ma,.82);dleg(s,-.72,.82,ma,.78,True)
 saddle(1.74,.77,.84)

def player():
 # fitted vest is shaped around shoulders and waist, with overlapping ivory lapels
 tube('TrouserHips',[(0,0,.80,.24,.68),(0,0,.94,.23,.66)],'pants',sides=16)
 tube('TailoredVest',[(0,0,.89,.21,.67),(0,0,1.04,.19,.70),(0,0,1.25,.27,.64),(0,0,1.34,.25,.62)],'tunic',sides=16)
 for side in [-1,1]:
  tube('VestLapels',[(side*.20,-.13,1.31,.045),(side*.09,-.16,1.14,.045),(side*.05,-.15,.98,.025)],'ivory',sides=8)
 tube('NeckSkin',[(0,0,1.30,.095),(0,0,1.43,.09)],'skin',sides=12)
 uv('Face',(0,-.005,1.51),(.15,.135,.19),'skin',seg=16,rings=10)
 uv('Nose',(0,-.143,1.505),(.034,.047,.038),'skin',seg=12,rings=8)
 for side in [-1,1]:
  uv('Ear',(side*.147,0,1.50),(.035,.035,.055),'skin',seg=12,rings=8)
  uv('EyeWhite',(side*.062,-.119,1.55),(.036,.016,.025),'white',seg=12,rings=8)
  uv('DarkEye',(side*.061,-.135,1.55),(.018,.008,.021),'hair',seg=12,rings=8)
  tube('Eyebrow',[(side*.032,-.134,1.587,.011),(side*.086,-.119,1.59,.009)],'hair',sides=6)
 tube('Smile',[(-.046,-.126,1.445,.006),(0,-.143,1.438,.006),(.043,-.126,1.45,.006)],'leather',sides=6)
 uv('HairCap',(0,.021,1.61),(.158,.136,.131),'hair',seg=16,rings=10)
 uv('TiedHairBun',(0,.145,1.64),(.105,.10,.11),'hair',seg=16,rings=10)
 for i in range(6):
  ang=i*pi/3;tube('SweptHairLock',[(.12*cos(ang),.06,1.67,.035),(.13*cos(ang),-.09,1.65,.032),(.12*cos(ang),-.14,1.55-.035*sin(ang),.008)],'hair',sides=8)
 tube('Ponytail',[(0,.17,1.66,.07),(.04,.23,1.53,.065),(.10,.25,1.39,.018)],'hair',sides=10)
 tube('TealWaistSash',[(0,0,.92,.238,.73),(0,0,.99,.235,.73)],'blanket',sides=16)
 for x in [-.08,.08]:tube('SashHangingEnds',[(x,-.15,.94,.045),(x+.02,-.17,.69,.048),(x+.04,-.16,.62,.02)],'blanket',sides=8)
 for side in [-1,1]:
  phase=0 if side<0 else pi;x=side*.12
  hip=joint('HipLeft' if side<0 else 'HipRight',(x,0,.85),phase=phase)
  tube('TrouserThigh',[(x,0,.85,.115),(x,.01,.64,.105),(x,-.02,.48,.075)],'pants',hip,12)
  knee=joint('Knee',(x,-.02,.48),hip,kind='knee',phase=phase)
  tube('BareShin',[(x,-.02,.49,.074),(x,0,.28,.064)],'skin',knee,12)
  tube('TallBoot',[(x,0,.33,.083),(x,.005,.13,.074)],'leather',knee,12)
  uv('LeatherBootFoot',(x,-.075,.075),(.087,.16,.075),'leather',knee)
  for zz in [.18,.27]:tube('BootStrap',[(x-.08,-.008,zz,.016),(x,-.078,zz,.016),(x+.08,-.008,zz,.016)],'leatherLight',knee,6)
  shoulder=joint('ShoulderLeft' if side<0 else 'ShoulderRight',(side*.24,0,1.29),kind='arm',phase=phase+pi)
  tube('UpperArm',[(side*.24,0,1.29,.09),(side*.32,.015,1.10,.075),(side*.33,-.015,1.04,.062)],'skin',shoulder,12)
  elbow=joint('Elbow',(side*.33,-.015,1.04),shoulder,kind='elbow',phase=phase)
  tube('Forearm',[(side*.33,-.015,1.04,.061),(side*.35,-.065,.88,.055)],'skin',elbow,12)
  tube('LeatherBracer',[(side*.34,-.03,.99,.070),(side*.35,-.06,.89,.064)],'leather',elbow,12)
  uv('Hand',(side*.35,-.08,.835),(.058,.044,.075),'skin',elbow)
  uv('Thumb',(side*.31,-.105,.85),(.028,.030,.046),'skin',elbow,12,8)
  if side>0:emp('HandAnchor',(side*.35,-.10,.83),elbow)

def batch_meshes():
 global parts
 groups={}
 for o in list(parts):
  groups.setdefault((o.parent.name,o.data.materials[0].name),[]).append(o)
 for (par,ma),objs in groups.items():
  if len(objs)<2:continue
  bpy.ops.object.select_all(action='DESELECT')
  for o in objs:o.select_set(True)
  bpy.context.view_layer.objects.active=objs[0];bpy.ops.object.join();objs[0].name=par+'_'+ma
 parts=[o for o in bpy.context.scene.objects if o.type=='MESH']

def animate():
 # NLA tracks with identical names are combined into one animation per glTF clip.
 for o,kind,phase in joints:
  o.rotation_mode='XYZ';baseloc=o.location.copy();baserot=o.rotation_euler.copy()
  for clip,frames in [('Idle',48),('Walk',32),('Run',24),('Attack',28),('Eat',48),('KO',36)]+([('Ride',24)] if root.name=='Player' else []):
   act=bpy.data.actions.new(o.name+'_'+clip);o.animation_data_create();o.animation_data.action=act
   for f in range(1,frames+1,4):
    t=(f-1)/(frames-1)*2*pi;rx=ry=rz=0
    if clip in ['Walk','Run']:
     a=.43 if clip=='Walk' else .70
     if kind=='leg':rx=a*sin(t+phase)
     if kind=='knee':rx=max(0,sin(t+phase))*.75
     if kind=='arm':rx=.50*sin(t+phase)
     if kind=='elbow':rx=-.24-.15*sin(t+phase)
     if kind=='tail':rz=.10*sin(t)
     if kind=='neck':rx=.04*sin(t*2)
    elif clip=='Idle':
     if kind=='tail':rz=.07*sin(t)
     if kind=='neck':rx=.025*sin(t)
     if kind=='body':rz=.012*sin(t)
    elif clip=='Attack':
     if kind=='neck':rx=-.48*sin(t*.5)
     if kind=='arm':rx=-.9*sin(t*.5)
     if kind=='tail':rz=.23*sin(t)
    elif clip=='Eat':
     if kind=='neck':rx=.5*(.5-.5*cos(t))
     if kind=='body':rx=.09*(.5-.5*cos(t))
     if kind=='tail':rz=.04*sin(t)
    elif clip=='KO':
     amount=min(1,(f-1)/12)
     if kind=='leg':rx=.85*amount
     if kind=='knee':rx=.6*amount
     if kind=='neck':rx=.55*amount
    elif clip=='Ride':
     amount=min(1,(f-1)/4)
     if kind=='leg':rx=-1.4*amount
     if kind=='knee':rx=1.2*amount
     if kind=='arm':rx=-.55*amount
     if kind=='elbow':rx=-.8*amount
    o.rotation_euler=(baserot.x+rx,baserot.y+ry,baserot.z+rz);o.keyframe_insert('rotation_euler',frame=f)
   # explicit matching loop endpoint for locomotion
   if clip not in ['KO','Ride']:
    for fc in act.fcurves:
     fc.keyframe_points.insert(frames,fc.evaluate(1))
   for fc in act.fcurves:
    for k in fc.keyframe_points:k.interpolation='LINEAR'
   track=o.animation_data.nla_tracks.new();track.name=clip;track.mute=True;strip=track.strips.new(clip,1,act);strip.name=clip
   o.animation_data.action=None
  o.rotation_euler=baserot
 bpy.context.scene.frame_set(1);bpy.context.view_layer.update()

def setup_render():
 world=bpy.context.scene.world;world.color=(.18,.20,.18);world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.21,.26,.25,1);world.node_tree.nodes['Background'].inputs[1].default_value=.6
 for loc,power,size in [((-4,-5,8),850,5),((5,1,6),650,4)]:
  data=bpy.data.lights.new('StudioSoftbox','AREA');data.energy=power;data.shape='DISK';data.size=size;o=bpy.data.objects.new('StudioSoftbox',data);bpy.context.collection.objects.link(o);o.location=loc;o.rotation_euler=(Vector((0,0,1))-o.location).to_track_quat('-Z','Y').to_euler()
 camd=bpy.data.cameras.new('Camera');cam=bpy.data.objects.new('Camera',camd);bpy.context.collection.objects.link(cam);bpy.context.scene.camera=cam;camd.type='ORTHO'
 scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=24;scene.cycles.use_denoising=False;scene.render.resolution_x=700;scene.render.resolution_y=700;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG';scene.render.film_transparent=True
 scene.view_settings.view_transform='AgX';return cam
metadata={}
for name,fn in [('player',player),('parasaur',parasaur),('dodo',dodo),('trike',trike),('raptor',predator),('anky',lambda:armored(False)),('stego',lambda:armored(True)),('rex',lambda:predator(True))]:
 bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False);root=emp(name.title());joints=[];parts=[];fn();root.rotation_euler.z=pi
 if name=='player':root.scale=(.943,.943,.943)
 if name=='dodo':root.scale=(.60,.60,.60);root.location.z=-.01086
 if name=='raptor':root.scale=(.72,.72,.72)
 if name=='trike':root.scale=(1.10,1.10,1.10)
 if name=='player':joints.append((root,'body',0))
 bpy.context.view_layer.update();batch_meshes();animate()
 # footprint dimensions from all undeformed body nodes except accessories
 bverts=[o.matrix_world@Vector(c) for o in parts for c in o.bound_box];mi=[min(v[k] for v in bverts) for k in range(3)];ma=[max(v[k] for v in bverts) for k in range(3)]
 triangles=sum(len(o.data.polygons)*2 for o in parts)
 bpy.ops.object.select_all(action='SELECT');bpy.ops.wm.save_as_mainfile(filepath=f'{SRC}/{name}.blend')
 bpy.ops.export_scene.gltf(filepath=f'{OUT}/{name}.glb',export_format='GLB',use_selection=True,export_animations=True,export_animation_mode='NLA_TRACKS',export_yup=True,export_apply=False,export_force_sampling=True)
 for o,kind,phase in joints:
  o.animation_data_clear();o.rotation_euler=(0,0,pi) if o==root else (0,0,0)
 bpy.context.view_layer.update()
 metadata[name]={'dimensions_blender_xyz':[round(ma[k]-mi[k],3) for k in range(3)],'feetAt':0,'forward':'-Z in glTF; authored -Y and root rotated pi around Blender Z','up':'+Y in glTF (+Z in Blender)','animations':['Idle','Walk','Run','Attack','Eat','KO']+(['Ride'] if name=='player' else []),'nodes':[o.name for o in bpy.context.scene.objects],'triangle_estimate':triangles,'riderSeat':next((list(o.matrix_world.translation) for o in bpy.context.scene.objects if o.name=='RiderSeat'),None)}
 for o in bpy.context.scene.objects:
  if o.name in ['Saddle','Bags']:
   o.hide_render=True
   for c in o.children_recursive:c.hide_render=True
 cam=setup_render();center=Vector((0,(mi[1]+ma[1])*.5,(mi[2]+ma[2])*.5));cam.location=center+Vector((5,-7,8.5));cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=max(ma[1]-mi[1],ma[2]-mi[2],ma[0]-mi[0])*1.22; bpy.context.scene.render.filepath=f'{SRC}/{name}_preview.png';bpy.ops.render.render(write_still=True)
 if name=='parasaur':
  for o in bpy.context.scene.objects:o.hide_render=False
  bpy.context.scene.render.filepath=f'{SRC}/parasaur_equipped_preview.png';bpy.ops.render.render(write_still=True)
 print('FINISHED_ASSET',name,flush=True)
with open(f'{OUT}/creature-metadata.json','w') as f:json.dump(metadata,f,indent=2)
