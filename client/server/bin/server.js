!function(e){var n={};function t(r){if(n[r])return n[r].exports;var o=n[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,t),o.l=!0,o.exports}t.m=e,t.c=n,t.d=function(e,n,r){t.o(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:r})},t.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},t.t=function(e,n){if(1&n&&(e=t(e)),8&n)return e;if(4&n&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(t.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&n&&"string"!=typeof e)for(var o in e)t.d(r,o,function(n){return e[n]}.bind(null,o));return r},t.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},t.p="C:\\Users\\kangmin\\Documents\\gtwio\\client\\server\\bin",t(t.s=1)}([function(e,n){e.exports=require("express")},function(e,n,t){"use strict";t.r(n);var r=t(0),o=t.n(r),i=t(2),u=o()(),l=process.cwd().replace(/\\/g,"/"),c=l+"/server/public/";u.use(o.a.static(c));var s=i.join(c,"index.html");console.log(s),console.log(l),console.log(c),u.get("/*",function(e,n){n.sendFile(s)}),u.listen(8001,function(){console.log("Sever listening on port 8001")})},function(e,n){e.exports=require("path")}]);