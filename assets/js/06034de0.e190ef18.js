"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[8337],{2718:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>r,contentTitle:()=>o,default:()=>p,frontMatter:()=>c,metadata:()=>a,toc:()=>d});var i=n(4848),s=n(8453);const c={title:"Dotnet SDK",description:"Connect to Spice using Spice Dotnet SDK",pagination_prev:null,pagination_next:null},o="Dotnet SDK for Spice.ai",a={id:"sdks/dotnet/index",title:"Dotnet SDK",description:"Connect to Spice using Spice Dotnet SDK",source:"@site/docs/sdks/dotnet/index.md",sourceDirName:"sdks/dotnet",slug:"/sdks/dotnet/",permalink:"/sdks/dotnet/",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/sdks/dotnet/index.md",tags:[],version:"current",frontMatter:{title:"Dotnet SDK",description:"Connect to Spice using Spice Dotnet SDK",pagination_prev:null,pagination_next:null},sidebar:"docsSidebar"},r={},d=[{value:"Install",id:"install",level:3},{value:"Connect to spice runtime",id:"connect-to-spice-runtime",level:3}];function l(e){const t={a:"a",code:"code",h1:"h1",h3:"h3",p:"p",pre:"pre",...(0,s.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(t.h1,{id:"dotnet-sdk-for-spiceai",children:"Dotnet SDK for Spice.ai"}),"\n",(0,i.jsx)(t.p,{children:(0,i.jsx)(t.a,{href:"https://github.com/spiceai/spice-dotnet",children:"https://github.com/spiceai/spice-dotnet"})}),"\n",(0,i.jsx)(t.h3,{id:"install",children:"Install"}),"\n",(0,i.jsx)(t.pre,{children:(0,i.jsx)(t.code,{className:"language-shell",children:"dotnet add package spiceai\n"})}),"\n",(0,i.jsx)(t.h3,{id:"connect-to-spice-runtime",children:"Connect to spice runtime"}),"\n",(0,i.jsxs)(t.p,{children:["Create a ",(0,i.jsx)(t.code,{children:"SpiceClient"})," using default configuration:"]}),"\n",(0,i.jsx)(t.pre,{children:(0,i.jsx)(t.code,{className:"language-csharp",children:'using Spice;\n\nvar client = new SpiceClientBuilder().Build();\n\nvar data = await client.query("SELECT trip_distance, total_amount FROM taxi_trips ORDER BY trip_distance DESC LIMIT 10;");\n'})}),"\n",(0,i.jsx)(t.p,{children:"Or pass custom flight address:"}),"\n",(0,i.jsx)(t.pre,{children:(0,i.jsx)(t.code,{className:"language-csharp",children:'using Spice;\n\nvar client = new SpiceClientBuilder()\n    .WithFlightAddress("http://my_remote_spice_instance:50051")\n    .Build();\n\nvar data = await client.query("SELECT trip_distance, total_amount FROM taxi_trips ORDER BY trip_distance DESC LIMIT 10;");\n'})})]})}function p(e={}){const{wrapper:t}={...(0,s.R)(),...e.components};return t?(0,i.jsx)(t,{...e,children:(0,i.jsx)(l,{...e})}):l(e)}},8453:(e,t,n)=>{n.d(t,{R:()=>o,x:()=>a});var i=n(6540);const s={},c=i.createContext(s);function o(e){const t=i.useContext(c);return i.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function a(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:o(e.components),i.createElement(c.Provider,{value:t},e.children)}}}]);