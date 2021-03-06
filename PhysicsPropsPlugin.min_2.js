/*!
 * PhysicsPropsPlugin 3.3.4
 * https://greensock.com
 * 
 * @license Copyright 2020, GreenSock. All rights reserved.
 * Subject to the terms at https://greensock.com/standard-license or for Club GreenSock members, the agreement issued with that membership.
 * @author: Jack Doyle, jack@greensock.com
 */

!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e=e||self).window=e.window||{})}(this,function(e){"use strict";function g(){return t||"undefined"!=typeof window&&(t=window.gsap)&&t.registerPlugin&&t}function h(e){return Math.round(1e4*e)/1e4}function i(e){t=e||g(),u||(a=t.utils.getUnit,u=1)}function j(e,t,i,s,r,n){var o=e._gsap,f=o.get(e,t);this.p=t,this.set=o.set(e,t),this.s=this.val=parseFloat(f),this.u=a(f)||0,this.vel=i||0,this.v=this.vel/n,s||0===s?(this.acc=s,this.a=this.acc/(n*n)):this.acc=this.a=0,this.fr=1-(r||0)}var t,u,a,s={version:"3.3.4",name:"physicsProps",register:i,init:function init(e,t,s){u||i();var r,n=this;for(r in n.target=e,n.tween=s,n.step=0,n.sps=30,n.vProps=[],t){var o=t[r],f=o.velocity,a=o.acceleration,p=o.friction;(f||a)&&(n.vProps.push(new j(e,r,f,a,p,n.sps)),n._props.push(r),p&&(n.hasFr=1))}},render:function render(e,t){var i,s,r,n,o,f=t.vProps,a=t.tween,p=t.target,u=t.step,v=t.hasFr,l=t.sps,c=f.length,d=a._from?a._dur-a._time:a._time;if(v){if(r=(d*=l)%1,0<=(s=(0|d)-u))for(;c--;){for(i=f[c],n=s;n--;)i.v+=i.a,i.v*=i.fr,i.val+=i.v;i.set(p,i.p,h(i.val+i.v*r)+i.u)}else for(;c--;){for(i=f[c],n=-s;n--;)i.val-=i.v,i.v/=i.fr,i.v-=i.a;i.set(p,i.p,h(i.val+i.v*r)+i.u)}t.step+=s}else for(o=d*d*.5;c--;)(i=f[c]).set(p,i.p,h(i.s+i.vel*d+i.acc*o)+i.u)},kill:function kill(e){for(var t=this.vProps,i=t.length;i--;)t[i].p===e&&t.splice(i,1)}};g()&&t.registerPlugin(s),e.PhysicsPropsPlugin=s,e.default=s;if (typeof(window)==="undefined"||window!==e){Object.defineProperty(e,"__esModule",{value:!0})} else {delete e.default}});

