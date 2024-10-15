"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[3201],{6847:(e,n,l)=>{l.r(n),l.d(n,{assets:()=>d,contentTitle:()=>t,default:()=>h,frontMatter:()=>r,metadata:()=>c,toc:()=>a});var i=l(4848),s=l(8453);const r={title:"run",sidebar_label:"run",pagination_prev:null,pagination_next:null},t=void 0,c={id:"cli/reference/run",title:"run",description:"Run Spice - starts the Spice runtime, installing if necessary",source:"@site/docs/cli/reference/run.md",sourceDirName:"cli/reference",slug:"/cli/reference/run",permalink:"/cli/reference/run",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/cli/reference/run.md",tags:[],version:"current",frontMatter:{title:"run",sidebar_label:"run",pagination_prev:null,pagination_next:null},sidebar:"docsSidebar"},d={},a=[{value:"Usage",id:"usage",level:3},{value:"Flags",id:"flags",level:4},{value:"Spiced Flags",id:"spiced-flags",level:4},{value:"Examples",id:"examples",level:3},{value:"Additional Example",id:"additional-example",level:3}];function o(e){const n={code:"code",h3:"h3",h4:"h4",li:"li",p:"p",pre:"pre",ul:"ul",...(0,s.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(n.p,{children:"Run Spice - starts the Spice runtime, installing if necessary"}),"\n",(0,i.jsx)(n.h3,{id:"usage",children:"Usage"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-shell",children:"spice run [flags]\nspice run [flags] -- [spiced flags]\n"})}),"\n",(0,i.jsx)(n.h4,{id:"flags",children:"Flags"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"-h"}),", ",(0,i.jsx)(n.code,{children:"--help"}),"   Print this help message"]}),"\n"]}),"\n",(0,i.jsx)(n.h4,{id:"spiced-flags",children:"Spiced Flags"}),"\n",(0,i.jsxs)(n.p,{children:["Flags that are passed to the ",(0,i.jsx)(n.code,{children:"spiced"})," runtime directly."]}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"--http"}),"  Configure runtime HTTP address [default: 127.0.0.1:8090]"]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"--flight"})," Configure runtime Flight address [default: 127.0.0.1:50051]"]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"--open_telemetry"})," Configure runtime OpenTelemetry address [default: 127.0.0.1:50052]"]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"--tls-enabled"}),"  Enable TLS"]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"--tls-certificate"}),"   The TLS PEM-encoded certificate"]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"--tls-certificate-file"}),"  Path to the TLS PEM-encoded certificate file"]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"--tls-key"}),"   The TLS PEM-encoded key"]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"--tls-key-file"}),"   Path to the TLS PEM-encoded key file"]}),"\n"]}),"\n",(0,i.jsx)(n.h3,{id:"examples",children:"Examples"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-shell",children:"spice run\n"})}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-shell",children:"# Expose the HTTP server on all interfaces\nspice run -- --http 0.0.0.0:8090\n"})}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-shell",children:"# Expose the HTTP & Flight servers on all interfaces with TLS\nspice run -- --http 0.0.0.0:8090 --flight 0.0.0.0:50051 --tls-enabled true --tls-certificate-file /path/to/cert.pem --tls-key-file /path/to/key.pem\n"})}),"\n",(0,i.jsx)(n.h3,{id:"additional-example",children:"Additional Example"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-shell",children:"# Run Spice with OpenTelemetry enabled\nspice run -- --open_telemetry 0.0.0.0:50052\n"})})]})}function h(e={}){const{wrapper:n}={...(0,s.R)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(o,{...e})}):o(e)}},8453:(e,n,l)=>{l.d(n,{R:()=>t,x:()=>c});var i=l(6540);const s={},r=i.createContext(s);function t(e){const n=i.useContext(r);return i.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function c(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:t(e.components),i.createElement(r.Provider,{value:n},e.children)}}}]);