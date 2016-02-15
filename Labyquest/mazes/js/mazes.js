var MersenneTwister;
MersenneTwister=(function()
{
	a.prototype.N=624;
	a.prototype.M=397;
	a.prototype.MATRIX_A=2567483615;
	a.prototype.UPPER_MASK=2147483648;
	a.prototype.LOWER_MASK=2147483647;
	function a(b)
	{
		this.mt=new Array(this.N);
		this.setSeed(b)
	}
	a.prototype.unsigned32=function(b)
	{
		if(b<0)
		{
			return(b^this.UPPER_MASK)+this.UPPER_MASK
		}
		else
		{
			return b
		}
	};
	a.prototype.subtraction32=function(c,b)
	{
		if(c<b)
		{
			return this.unsigned32((4294967296-(b-c))%4294967295)
		}
		else
		{
			return c-b
		}
	};
	a.prototype.addition32=function(c,b)
	{
		return this.unsigned32((c+b)&4294967295)
	};
	a.prototype.multiplication32=function(e,c)
	{
		var b,d;d=0;
		for(b=0;b<32;b++)
		{
			if((e>>>b)&1)
			{
				d=this.addition32(d,this.unsigned32(c<<b))
			}
		}
		return d
	};
	a.prototype.setSeed=function(b)
	{
		if(!b||typeof b==="number")
		{
			return this.seedWithInteger(b)
		}
		else
		{
			return this.seedWithArray(b)
		}
	};
	a.prototype.defaultSeed=function()
	{
		var b;
		b=new Date();
		return b.getMinutes()*60000+b.getSeconds()*1000+b.getMilliseconds()
	};
	a.prototype.seedWithInteger=function(c)
	{
		var b;
		this.seed=c!=null?c:this.defaultSeed();
		this.mt[0]=this.unsigned32(this.seed&4294967295);
		this.mti=1;
		b=[];
		while(this.mti<this.N)
		{
			this.mt[this.mti]=this.addition32(this.multiplication32(1812433253,this.unsigned32(this.mt[this.mti-1]^(this.mt[this.mti-1]>>>30))),this.mti);
			this.mti[this.mti]=this.unsigned32(this.mt[this.mti]&4294967295);
			b.push(this.mti++)
		}
		return b
	};
	a.prototype.seedWithArray=function(f){var e,d,b,c;this.seedWithInteger(19650218);
	e=1;
	d=0;
	b=this.N>f.length?this.N:f.length;
	while(b>0)
	{
		c=this.multiplication32(this.unsigned32(this.mt[e-1]^(this.mt[e-1]>>>30)),1664525);
		this.mt[e]=this.addition32(this.addition32(this.unsigned32(this.mt[e]^c),f[d]),d);
		this.mt[e]=this.unsigned32(this.mt[e]&4294967295);
		e++;
		d++;
		if(e>=this.N)
		{
			this.mt[0]=this.mt[this.N-1];
			e=1
		}
		if(d>=f.length)
		{
			d=0
		}
		b--
	}
	b=this.N-1;
	while(b>0)
	{
		this.mt[e]=this.subtraction32(this.unsigned32(this.mt[e]^this.multiplication32(this.unsigned32(this.mt[e-1]^(this.mt[e-1]>>>30)),1566083941)),e);
		this.mt[e]=this.unsigned32(this.mt[e]&4294967295);
		e++;
		if(e>=this.N)
		{
			this.mt[0]=this.mt[this.N-1];e=1
		}
	}
	return this.mt[0]=2147483648};
	a.prototype.nextInteger=function(b)
	{
		var c,d,e;
		if((b!=null?b:1)<1)
		{
			return 0
		}
		d=[0,this.MATRIX_A];
		if(this.mti>=this.N)
		{
			c=0;
			while(c<this.N-this.M)
			{
				e=this.unsigned32((this.mt[c]&this.UPPER_MASK)|(this.mt[c+1]&this.LOWER_MASK));
				this.mt[c]=this.unsigned32(this.mt[c+this.M]^(e>>>1)^d[e&1]);
				c++
			}
			while(c<this.N-1)
			{
				e=this.unsigned32((this.mt[c]&this.UPPER_MASK)|(this.mt[c+1]&this.LOWER_MASK));
				this.mt[c]=this.unsigned32(this.mt[c+this.M-this.N]^(e>>>1)^d[e&1]);
				c++
			}
			e=this.unsigned32((this.mt[this.N-1]&this.UPPER_MASK)|(this.mt[0]&this.LOWER_MASK));
			this.mt[this.N-1]=this.unsigned32(this.mt[this.M-1]^(e>>>1)^d[e&1]);
			this.mti=0
		}
		e=this.mt[this.mti++];
		e=this.unsigned32(e^(e>>>11));
		e=this.unsigned32(e^((e<<7)&2636928640));
		e=this.unsigned32(e^((e<<15)&4022730752));
		return this.unsigned32(e^(e>>>18))%(b!=null?b:4294967296)
	};
	a.prototype.nextFloat=function()
	{
		return this.nextInteger()/4294967295
	};
	a.prototype.nextBoolean=function()
	{
		return this.nextInteger()%2===0
	};
	return a
})();


var Maze;
Maze=(function()
{
	function a(e,b,c,d)
	{
		this.width=e;
		this.height=b;
		d!=null?d:d={};
		this.grid=new a.Grid(this.width,this.height);
		this.rand=d.rng||new MersenneTwister(d.seed);
		this.isWeave=d.weave;
		if(this.rand.randomElement==null)
		{
			this.rand.randomElement=function(f)
			{
				return f[this.nextInteger(f.length)]
			};
			this.rand.removeRandomElement=function(g)
			{
				var f;
				f=g.splice(this.nextInteger(g.length),1);
				if(f)
				{
					return f[0]
				}
			};
			this.rand.randomizeList=function(k)
			{
				var g,f,h;
				g=k.length-1;
				while(g>0)
				{
					f=this.nextInteger(g+1);
					h=[k[f],k[g]],k[g]=h[0],k[f]=h[1];
					g--
				}
				return k
			};
			this.rand.randomDirections=function()
			{
				return this.randomizeList(a.Direction.List.slice(0))
			}
		}
		this.algorithm=new c(this,d)
	}
	a.prototype.onUpdate=function(b)
	{
		return this.algorithm.onUpdate(b)
	};
	a.prototype.onEvent=function(b)
	{
		return this.algorithm.onEvent(b)
	};
	a.prototype.generate=function()
	{
		var b;
		b=[];
		while(true)
		{
			if(!this.step())
			{
				break
			}
		}
		return b
	};
	a.prototype.step=function()
	{
		return this.algorithm.step()
	};
	a.prototype.isEast=function(b,c)
	{
		return this.grid.isMarked(b,c,a.Direction.E)
	};
	a.prototype.isWest=function(b,c)
	{
		return this.grid.isMarked(b,c,a.Direction.W)
	};
	a.prototype.isNorth=function(b,c)
	{
		return this.grid.isMarked(b,c,a.Direction.N)
	};
	a.prototype.isSouth=function(b,c)
	{
		return this.grid.isMarked(b,c,a.Direction.S)
	};
	a.prototype.isUnder=function(b,c)
	{
		return this.grid.isMarked(b,c,a.Direction.U)
	};
	a.prototype.isValid=function(b,c)
	{
		return(0<=b&&b<this.width)&&(0<=c&&c<this.height)
	};
	a.prototype.carve=function(b,d,c)
	{
		return this.grid.mark(b,d,c)
	};
	a.prototype.uncarve=function(b,d,c)
	{
		return this.grid.clear(b,d,c)
	};
	a.prototype.isSet=function(b,d,c)
	{
		return this.grid.isMarked(b,d,c)
	};
	a.prototype.isBlank=function(b,c)
	{
		return this.grid.at(b,c)===0
	};
	a.prototype.isPerpendicular=function(b,d,c)
	{
		return(this.grid.at(b,d)&a.Direction.Mask)===a.Direction.cross[c]
	};
	return a
})();
	
Maze.Algorithms={};
Maze.Algorithm=(function()
{
	function a(c,b)
	{
		this.maze=c;
		b!=null?b:b={};
		this.updateCallback=function(f,d,e){};
		this.eventCallback=function(f,d,e){};
		this.rand=this.maze.rand
	}
	a.prototype.onUpdate=function(b)
	{
		return this.updateCallback=b
	};
	a.prototype.onEvent=function(b)
	{
		return this.eventCallback=b
	};
	a.prototype.updateAt=function(b,c)
	{
		return this.updateCallback(this.maze,b,c)
	};
	a.prototype.eventAt=function(b,c)
	{
		return this.eventCallback(this.maze,b,c)
	};
	a.prototype.canWeave=function(c,e,d)
	{
		var b,f;
		if(this.maze.isWeave&&this.maze.isPerpendicular(e,d,c))
		{
			b=e+Maze.Direction.dx[c];
			f=d+Maze.Direction.dy[c];
			return this.maze.isValid(b,f)&&this.maze.isBlank(b,f)
		}
	};
	a.prototype.performThruWeave=function(c,b)
	{
		if(this.rand.nextBoolean())
		{
			return this.maze.carve(c,b,Maze.Direction.U)
		}
		else
		{
			if(this.maze.isNorth(c,b))
			{
				this.maze.uncarve(c,b,Maze.Direction.N|Maze.Direction.S);
				return this.maze.carve(c,b,Maze.Direction.E|Maze.Direction.W|Maze.Direction.U)
			}
			else
			{
				this.maze.uncarve(c,b,Maze.Direction.E|Maze.Direction.W);
				return this.maze.carve(c,b,Maze.Direction.N|Maze.Direction.S|Maze.Direction.U)
			}
		}
	};
	a.prototype.performWeave=function(b,i,f,h)
	{
		var d,c,g,e;d=i+Maze.Direction.dx[b];
		c=f+Maze.Direction.dy[b];
		g=d+Maze.Direction.dx[b];
		e=c+Maze.Direction.dy[b];
		this.maze.carve(i,f,b);
		this.maze.carve(g,e,Maze.Direction.opposite[b]);
		this.performThruWeave(d,c);
		if(h){h(g,e)}this.updateAt(i,f);
		this.updateAt(d,c);
		return this.updateAt(g,e)
	};
	return a
})();
			
Maze.Direction=
{
	N:1,S:2,E:4,W:8,U:16,
		Mask:1|2|4|8|16,
		List:[1,2,4,8],
		dx:{1:0,2:0,4:1,8:-1},
		dy:{1:-1,2:1,4:0,8:0},
		opposite:{1:2,2:1,4:8,8:4},
		cross:{1:4|8,2:4|8,4:1|2,8:1|2}
};

Maze.Grid=(function()
{
	function a(d,c)
	{
		var b,e;
		this.width=d;this.height=c;
		this.data=(function()
		{
			var g,f;
			f=[];
			for(e=1,g=this.height;(1<=g?e<=g:e>=g);(1<=g?e+=1:e-=1))
			{
				f.push((function()
				{
					var i,h;
					h=[];
					for(b=1,i=this.width;(1<=i?b<=i:b>=i);(1<=i?b+=1:b-=1))
					{
						h.push(0)
					}
					return h
				}).call(this))
			}
			return f
		}).call(this)
	}
	a.prototype.at=function(b,c)
	{
		return this.data[c][b]
	};
	a.prototype.mark=function(b,d,c)
	{
		return this.data[d][b]|=c
	};
	a.prototype.clear=function(b,d,c)
	{
		return this.data[d][b]&=~c
	};
	a.prototype.isMarked=function(b,d,c)
	{
		return(this.data[d][b]&c)===c
	};
	return a
})();
			
var __bind=function(a,b)
{
	return function()
	{
		return a.apply(b,arguments)
	}
};

Maze.createWidget=function(j,c,n,p)
{
	var l,g,o,k,h,b,m,d,a,i,f,e;
	p!=null?p:p={};
	a=function(t,q,s,r)
	{
		if(t.isEast(q,s))
		{
			r.push("e")
		}
		if(t.isWest(q,s))
		{
			r.push("w")
		}
		if(t.isSouth(q,s))
		{
			r.push("s")
		}
		if(t.isNorth(q,s))
		{
			r.push("n")
		}
		if(t.isUnder(q,s))
		{
			return r.push("u")
		}
	};
	l=
	{
		HuntAndKill:function(t,q,s,r)
		{
			if(t.algorithm.isCurrent(q,s))
			{
				r.push("cursor")
			}
			if(!t.isBlank(q,s))
			{
				r.push("in");
				return a(t,q,s,r)
			}
		},
		
		"default":function(t,q,s,r)
		{
			if(!t.isBlank(q,s))
			{
				r.push("in");
				return a(t,q,s,r)
			}
		}
	};
	d=function(u,r,t)
	{
		var q,s;
		s=[];
		(l[j]||l["default"])(u,r,t,s);
		q=document.getElementById(""+u.element.id+"_y"+t+"x"+r);
		return q.className=s.join(" ")
	};
	o=function(s,q,r)
	{
		if(s.element.quickStep)
		{
			return s.element.mazePause()
		}
	};
	b=p.id||j.toLowerCase();
	(f=p.interval)!=null?f:p.interval=50;m="maze";
	if(p["class"])
	{
		m+=" "+p["class"]
	}
	k="grid";
	if(p.wallwise)
	{
		k+=" invert"
	}
	if(p.padded)
	{
		k+=" padded"
	}
	if((e=p.watch)!=null?e:true)
	{
		i="<a id='"+b+"_watch' href='#' onclick='document.getElementById(\""+b+"\").mazeQuickStep(); return false;'>Watch</a>"
	}
	else
	{
		i=""
	}
	h='<div id="'+b+'" class="'+m+'">\n  <div id="'+b+'_grid" class="'
		+k+'"></div>\n  <div class="operations">\n    <a id="'
		+b+'_reset" href="#" onclick="document.getElementById(\''
		+b+'\').mazeReset(); return false;">Reset</a>\n    <a id="'
		+b+'_step" href="#" onclick="document.getElementById(\''
		+b+"').mazeStep(); return false;\">Step</a>\n    "
		+i+'\n    <a id="'+b+'_run" href="#" onclick="document.getElementById(\''
		+b+"').mazeRun(); return false;\">Run</a>\n  </div>\n</div>";
	document.write(h);
	g=document.getElementById(b);
	g.addClassName=function(t,r)
	{
		var s,v,u,q;
		v=t.className.split(" ");
		for(u=0,q=v.length;u<q;u++)
		{
			s=v[u];
			if(s===r)
			{
				return
			}
		}
		return t.className+=" "+r
	};
	g.removeClassName=function(u,s)
	{
		var t,w,v,r,q;
		if(u.className.length>0)
		{
			w=u.className.split(" ");
			u.className="";
			q=[];
			for(v=0,r=w.length;v<r;v++)
			{
				t=w[v];
				q.push(t!==s?(u.className.length>0?u.className+=" ":void 0,u.className+=t):void 0)
			}
			return q
		}
	};
	g.mazePause=function()
	{
		if(this.mazeStepInterval!=null)
		{
			clearInterval(this.mazeStepInterval);
			this.mazeStepInterval=null;
			this.quickStep=false;
			return true
		}
	};
	g.mazeRun=function()
	{
		if(!this.mazePause())
		{
			return this.mazeStepInterval=setInterval((__bind(function()
			{
				return this.mazeStep()
			},this)),p.interval)
		}
	};
	g.mazeStep=function()
	{
		var q;
		if(!this.maze.step())
		{
			this.mazePause();
			this.addClassName(document.getElementById(""+this.id+"_step"),"disabled");
			if((q=p.watch)!=null?q:true)
			{
				this.addClassName(document.getElementById(""+this.id+"_watch"),"disabled")
			}
			return this.addClassName(document.getElementById(""+this.id+"_run"),"disabled")
		}
	};
	g.mazeQuickStep=function()
	{
		this.quickStep=true;
		return this.mazeRun()
	};
	g.mazeReset=function()
	{
		var q,u,r,A,z,w,v,t,s;
		this.mazePause();
		if(typeof p.input==="function")
		{
			A=p.input()
		}
		else
		{
			A=p.input
		}
		this.maze=new Maze
		(
			c,n,Maze.Algorithms[j],
			{
				seed:p.seed,rng:p.rng,input:A,
					weave:p.weave,weaveMode:p.weaveMode,
					weaveDensity:p.weaveDensity
			}
		);
		this.maze.element=this;
		this.maze.onUpdate(d);
		this.maze.onEvent(o);
		q="";
		for(w=0,v=this.maze.height;(0<=v?w<v:w>v);(0<=v?w+=1:w-=1))
		{
			r=""+this.id+"_y"+w;q+="<div class='row' id='"+r+"'>";
			for(z=0,t=this.maze.width;(0<=t?z<t:z>t);(0<=t?z+=1:z-=1))
			{
				q+="<div id='"+r+"x"+z+"'>";
				if(p.padded)
				{
					q+="<div class='np'></div>";
					q+="<div class='wp'></div>";
					q+="<div class='ep'></div>";
					q+="<div class='sp'></div>";
					q+="<div class='c'></div>"
				}
				q+="</div>"
			}
			q+="</div>"
		}
		u=document.getElementById(""+this.id+"_grid");
		u.innerHTML=q;
		this.removeClassName(document.getElementById(""+this.id+"_step"),"disabled");
		if((s=p.watch)!=null?s:true)
		{
			this.removeClassName(document.getElementById(""+this.id+"_watch"),"disabled")
		}
		return this.removeClassName(document.getElementById(""+this.id+"_run"),"disabled")
	};
	return g.mazeReset()
};
				
var __hasProp=Object.prototype.hasOwnProperty,__extends=function(d,b)
{
	for(var a in b)
	{
		if(__hasProp.call(b,a))
		{
			d[a]=b[a]
		}
	}
	function c()
	{
		this.constructor=d
	}
	c.prototype=b.prototype;
	d.prototype=new c;
	d.__super__=b.prototype;
	return d
},
__bind=function(a,b)
{
	return function()
	{
		return a.apply(b,arguments)
	}
};



///
Maze.Algorithms.HuntAndKill=(function()
{
	__extends(a,Maze.Algorithm);
	a.prototype.IN=4096;
	function a(c,b)
	{
		a.__super__.constructor.apply(this,arguments);
		this.state=0
	}
	a.prototype.isCurrent=function(b,d)
	{
		var c;
		return((c=this.x)!=null?c:b)===b&&this.y===d
	};
	a.prototype.isWalking=function()
	{
		return this.state===1
	};
	a.prototype.isHunting=function()
	{
		return this.state===2
	};
	
	var lastCheckedX=0, lastCheckedY=0;
	a.prototype.callbackRow=function(e)//линия проверки
	{
		var b,d,c;
		c=[];
		for(b=0,d=this.maze.width;
		(0<=d?b<d:b>d);
		(0<=d?b+=1:b-=1))
		{
			c.push(this.updateAt(b,e))
		}
		lastCheckedY=e;
		return c
	};
	a.prototype.startStep=function()
	{
		this.x=this.rand.nextInteger(this.maze.width);
		this.y=this.rand.nextInteger(this.maze.height);
		this.maze.carve(this.x,this.y,this.IN);
		this.updateAt(this.x,this.y);
		return this.state=1
	};
	a.prototype.walkStep=function()
	{
		var i,g,f,k,h,d,j,e,c,b;
		e=this.rand.randomDirections();
		for(d=0,j=e.length;d<j;d++)
		{
			i=e[d];
			g=this.x+Maze.Direction.dx[i];
			f=this.y+Maze.Direction.dy[i];
			if(this.maze.isValid(g,f))
			{
				if(this.maze.isBlank(g,f))
				{
					c=[this.x,this.y,g,f],k=c[0],h=c[1],this.x=c[2],this.y=c[3];
					this.maze.carve(k,h,i);
					this.maze.carve(g,f,Maze.Direction.opposite[i]);
					this.updateAt(k,h);
					this.updateAt(g,f);
					return
				}
				else
				{
					if(this.canWeave(i,g,f))
					{
						this.performWeave(i,this.x,this.y,__bind(function(l,n)
						{
							var m;
							return m=[this.x,this.y,l,n],l=m[0],n=m[1],this.x=m[2],this.y=m[3],m
						},this));
						return
					}
				}
			}
		}
		b=[this.x,this.y],k=b[0],h=b[1];
		delete this.x;
		delete this.y;
		this.updateAt(k,h);
		this.eventAt(k,h);
		this.y=0;///this.y=0;
		this.callbackRow(lastCheckedY);//this.callbackRow(0);//lastCheckedY
		return this.state=2
	};
	a.prototype.huntStep=function()
	{
		var f,d,c,g,b,e;
		for(b=0,e=this.maze.width;
		(0<=e?b<e:b>e);
		(0<=e?b+=1:b-=1))
		{
			if(this.maze.isBlank(b,this.y))
			{
				d=[];
				if(this.y>0&&!this.maze.isBlank(b,this.y-1))
				{
					d.push(Maze.Direction.N)
				}
				if(b>0&&!this.maze.isBlank(b-1,this.y))
				{
					d.push(Maze.Direction.W)
				}
				if(this.y+1<this.maze.height&&!this.maze.isBlank(b,this.y+1))
				{
					d.push(Maze.Direction.S)
				}
				if(b+1<this.maze.width&&!this.maze.isBlank(b+1,this.y))
				{
					d.push(Maze.Direction.E)
				}
				f=this.rand.randomElement(d);
				if(f)
				{
					this.x=b;
					c=this.x+Maze.Direction.dx[f];
					g=this.y+Maze.Direction.dy[f];
					this.maze.carve(this.x,this.y,f);
					this.maze.carve(c,g,Maze.Direction.opposite[f]);
					this.state=1;
					this.updateAt(c,g);
					this.callbackRow(this.y);///this.callbackRow(this.y);//lastCheckedY
					this.y=lastCheckedY;///
					this.eventAt(c,g);
					return
				}
			}
		}
		this.y++;
		this.callbackRow(lastCheckedY);///this.callbackRow(this.y-1);
		if(this.y>=this.maze.height)
		{
			this.state=3;
			delete this.x;
			return delete this.y
		}
		else
		{
			return this.callbackRow(this.y-1)//this.callbackRow(this.y)
		}
	};
	a.prototype.step=function()
	{
		switch(this.state)
		{
			case 0:
				this.startStep();
				break;
			case 1:
				this.walkStep();
				break;
			case 2:
				this.huntStep()
		}
		return this.state!==3
	};
	return a
})();

var __hasProp=Object.prototype.hasOwnProperty,__extends=function(d,b)
{
	for(var a in b)
	{
		if(__hasProp.call(b,a))
		{
			d[a]=b[a]
		}
	}
	function c()
	{
		this.constructor=d
	}
	c.prototype=b.prototype;
	d.prototype=new c;
	d.__super__=b.prototype;
	return d
};
