/*!
 * DrawSVGPlugin 3.3.4
 * https://greensock.com
 * 
 * @license Copyright 2020, GreenSock. All rights reserved.
 * Subject to the terms at https://greensock.com/standard-license or for Club GreenSock members, the agreement issued with that membership.
 * @author: Jack Doyle, jack@greensock.com
 */

!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e=e||self).window=e.window||{})}(this,function(e){"use strict";function i(){return"undefined"!=typeof window}function j(){return t||i()&&(t=window.gsap)&&t.registerPlugin&&t}function m(e){return Math.round(1e4*e)/1e4}function n(e){return parseFloat(e||0)}function o(e,t){return n(e.getAttribute(t))}function q(e,t,s,r,i,o){return P(Math.pow((n(s)-n(e))*i,2)+Math.pow((n(r)-n(t))*o,2))}function r(e){return console.warn(e)}function s(e){return"non-scaling-stroke"===e.getAttribute("vector-effect")}function v(e){if(!(e=k(e)[0]))return 0;var t,n,i,a,f,h,d,l=e.tagName.toLowerCase(),u=e.style,c=1,g=1;s(e)&&(g=e.getScreenCTM(),c=P(g.a*g.a+g.b*g.b),g=P(g.d*g.d+g.c*g.c));try{n=e.getBBox()}catch(e){r("Some browsers won't measure invisible elements (like display:none or masks inside defs).")}var _=n||{x:0,y:0,width:0,height:0},p=_.x,x=_.y,y=_.width,m=_.height;if(n&&(y||m)||!M[l]||(y=o(e,M[l][0]),m=o(e,M[l][1]),"rect"!==l&&"line"!==l&&(y*=2,m*=2),"line"===l&&(p=o(e,"x1"),x=o(e,"y1"),y=Math.abs(y-p),m=Math.abs(m-x))),"path"===l)a=u.strokeDasharray,u.strokeDasharray="none",t=e.getTotalLength()||0,c!==g&&r("Warning: <path> length cannot be measured when vector-effect is non-scaling-stroke and the element isn't proportionally scaled."),t*=(c+g)/2,u.strokeDasharray=a;else if("rect"===l)t=2*y*c+2*m*g;else if("line"===l)t=q(p,x,p+y,x+m,c,g);else if("polyline"===l||"polygon"===l)for(i=e.getAttribute("points").match(b)||[],"polygon"===l&&i.push(i[0],i[1]),t=0,f=2;f<i.length;f+=2)t+=q(i[f-2],i[f-1],i[f],i[f+1],c,g)||0;else"circle"!==l&&"ellipse"!==l||(h=y/2*c,d=m/2*g,t=Math.PI*(3*(h+d)-P((3*h+d)*(h+3*d))));return t||0}function w(e,t){if(!(e=k(e)[0]))return[0,0];t=t||v(e)+1;var s=h.getComputedStyle(e),r=s.strokeDasharray||"",i=n(s.strokeDashoffset),o=r.indexOf(",");return o<0&&(o=r.indexOf(" ")),t<(r=o<0?t:n(r.substr(0,o))||1e-5)&&(r=t),[Math.max(0,-i),Math.max(0,r-i)]}function x(){i()&&(h=window,l=t=j(),k=t.utils.toArray,d=-1!==((h.navigator||{}).userAgent||"").indexOf("Edge"))}var t,k,h,d,l,b=/[-+=\.]*\d+[\.e\-\+]*\d*[e\-\+]*\d*/gi,M={rect:["width","height"],circle:["r","r"],ellipse:["rx","ry"],line:["x2","y2"]},P=Math.sqrt,a={version:"3.3.4",name:"drawSVG",register:function register(e){t=e,x()},init:function init(e,t){if(!e.getBBox)return!1;l||x();var r,i,o,a,f=v(e)+1;return this._style=e.style,this._target=e,t+""=="true"?t="0 100%":t?-1===(t+"").indexOf(" ")&&(t="0 "+t):t="0 0",i=function _parse(e,t,s){var r,i,o=e.indexOf(" ");return i=o<0?(r=void 0!==s?s+"":e,e):(r=e.substr(0,o),e.substr(o+1)),r=~r.indexOf("%")?n(r)/100*t:n(r),(i=~i.indexOf("%")?n(i)/100*t:n(i))<r?[i,r]:[r,i]}(t,f,(r=w(e,f))[0]),this._length=m(f+10),0===r[0]&&0===i[0]?(o=Math.max(1e-5,i[1]-f),this._dash=m(f+o),this._offset=m(f-r[1]+o),this._offsetPT=this.add(this,"_offset",this._offset,m(f-i[1]+o))):(this._dash=m(r[1]-r[0])||1e-6,this._offset=m(-r[0]),this._dashPT=this.add(this,"_dash",this._dash,m(i[1]-i[0])||1e-5),this._offsetPT=this.add(this,"_offset",this._offset,m(-i[0]))),d&&(a=h.getComputedStyle(e)).strokeLinecap!==a.strokeLinejoin&&(i=n(a.strokeMiterlimit),this.add(e.style,"strokeMiterlimit",i,i+.01)),this._live=s(e)||~(t+"").indexOf("live"),this._props.push("drawSVG"),1},render:function render(e,t){var n,s,r,i,o=t._pt,a=t._style;if(o){for(t._live&&(n=v(t._target)+11)!==t._length&&(s=n/t._length,t._length=n,t._offsetPT.s*=s,t._offsetPT.c*=s,t._dashPT?(t._dashPT.s*=s,t._dashPT.c*=s):t._dash*=s);o;)o.r(e,o.d),o=o._next;r=t._dash,i=t._offset,n=t._length,a.strokeDashoffset=t._offset,1!==e&&e?a.strokeDasharray=r+"px,"+n+"px":(r-i<.001&&n-r<=10&&(a.strokeDashoffset=i+1),a.strokeDasharray=i<.001&&n-r<=10?"none":i===r?"0px, 999999px":r+"px,"+n+"px")}},getLength:v,getPosition:w};j()&&t.registerPlugin(a),e.DrawSVGPlugin=a,e.default=a;if (typeof(window)==="undefined"||window!==e){Object.defineProperty(e,"__esModule",{value:!0})} else {delete e.default}});

