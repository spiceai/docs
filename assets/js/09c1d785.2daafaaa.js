"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[7252],{6370:(e,r,n)=>{n.r(r),n.d(r,{assets:()=>l,contentTitle:()=>t,default:()=>o,frontMatter:()=>i,metadata:()=>d,toc:()=>a});var s=n(4848),c=n(8453);const i={title:"Spice.ai OSS CLI command reference",sidebar_label:"Spice CLI command reference",description:"Spice CLI command reference",pagination_next:null},t=void 0,d={id:"cli/reference/index",title:"Spice.ai OSS CLI command reference",description:"Spice CLI command reference",source:"@site/docs/cli/reference/index.md",sourceDirName:"cli/reference",slug:"/cli/reference/",permalink:"/cli/reference/",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/cli/reference/index.md",tags:[],version:"current",frontMatter:{title:"Spice.ai OSS CLI command reference",sidebar_label:"Spice CLI command reference",description:"Spice CLI command reference",pagination_next:null},sidebar:"docsSidebar",previous:{title:"CLI",permalink:"/cli/"}},l={},a=[{value:"spice",id:"spice",level:2},{value:"Usage",id:"usage",level:3},{value:"Full Command Reference",id:"full-command-reference",level:3},{value:"Command Flags",id:"command-flags",level:3}];function h(e){const r={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,c.R)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(r.h2,{id:"spice",children:"spice"}),"\n",(0,s.jsx)(r.h3,{id:"usage",children:"Usage"}),"\n",(0,s.jsx)(r.pre,{children:(0,s.jsx)(r.code,{className:"language-bash",children:"spice [command] [--help]\n"})}),"\n",(0,s.jsx)(r.h3,{id:"full-command-reference",children:"Full Command Reference"}),"\n",(0,s.jsxs)(r.table,{children:[(0,s.jsx)(r.thead,{children:(0,s.jsxs)(r.tr,{children:[(0,s.jsx)(r.th,{children:"Command"}),(0,s.jsx)(r.th,{children:"Description"})]})}),(0,s.jsxs)(r.tbody,{children:[(0,s.jsxs)(r.tr,{children:[(0,s.jsx)(r.td,{children:(0,s.jsx)(r.a,{href:"/cli/reference/add",children:"add"})}),(0,s.jsx)(r.td,{children:"Add Pod - adds a pod to the project"})]}),(0,s.jsxs)(r.tr,{children:[(0,s.jsx)(r.td,{children:(0,s.jsx)(r.a,{href:"/cli/reference/catalogs",children:"catalogs"})}),(0,s.jsxs)(r.td,{children:["List ",(0,s.jsx)(r.a,{href:"/components/catalogs",children:"catalogs"})," loaded by the Spice runtime"]})]}),(0,s.jsxs)(r.tr,{children:[(0,s.jsx)(r.td,{children:(0,s.jsx)(r.a,{href:"/cli/reference/completion",children:"completion"})}),(0,s.jsx)(r.td,{children:"Generate the autocompletion script for the specified shell"})]}),(0,s.jsxs)(r.tr,{children:[(0,s.jsx)(r.td,{children:(0,s.jsx)(r.a,{href:"/cli/reference/dataset",children:"dataset"})}),(0,s.jsx)(r.td,{children:"Dataset operations"})]}),(0,s.jsxs)(r.tr,{children:[(0,s.jsx)(r.td,{children:(0,s.jsx)(r.a,{href:"/cli/reference/datasets",children:"datasets"})}),(0,s.jsx)(r.td,{children:"Lists datasets loaded by the Spice runtime"})]}),(0,s.jsxs)(r.tr,{children:[(0,s.jsx)(r.td,{children:"help"}),(0,s.jsx)(r.td,{children:"Help about any command"})]}),(0,s.jsxs)(r.tr,{children:[(0,s.jsx)(r.td,{children:(0,s.jsx)(r.a,{href:"/cli/reference/init",children:"init"})}),(0,s.jsx)(r.td,{children:"Initialize Pod - initializes a new pod in the project"})]}),(0,s.jsxs)(r.tr,{children:[(0,s.jsx)(r.td,{children:(0,s.jsx)(r.a,{href:"/cli/reference/login",children:"login"})}),(0,s.jsx)(r.td,{children:"Login to the Spice.ai Platform"})]}),(0,s.jsxs)(r.tr,{children:[(0,s.jsx)(r.td,{children:(0,s.jsx)(r.a,{href:"/cli/reference/models",children:"models"})}),(0,s.jsx)(r.td,{children:"Lists models loaded by the Spice runtime"})]}),(0,s.jsxs)(r.tr,{children:[(0,s.jsx)(r.td,{children:(0,s.jsx)(r.a,{href:"/cli/reference/pods",children:"pods"})}),(0,s.jsx)(r.td,{children:"Lists Spicepods loaded by the Spice runtime"})]}),(0,s.jsxs)(r.tr,{children:[(0,s.jsx)(r.td,{children:(0,s.jsx)(r.a,{href:"/cli/reference/refresh",children:"refresh"})}),(0,s.jsx)(r.td,{children:"Refreshes an accelerated dataset loaded by the Spice runtime"})]}),(0,s.jsxs)(r.tr,{children:[(0,s.jsx)(r.td,{children:(0,s.jsx)(r.a,{href:"/cli/reference/run",children:"run"})}),(0,s.jsx)(r.td,{children:"Run Spice - starts the Spice runtime, installing if necessary"})]}),(0,s.jsxs)(r.tr,{children:[(0,s.jsx)(r.td,{children:(0,s.jsx)(r.a,{href:"/cli/reference/search",children:"search"})}),(0,s.jsx)(r.td,{children:"Perform embeddings-based searches across"})]}),(0,s.jsxs)(r.tr,{children:[(0,s.jsx)(r.td,{children:(0,s.jsx)(r.a,{href:"/cli/reference/sql",children:"sql"})}),(0,s.jsx)(r.td,{children:"Start an interactive SQL query session against the Spice runtime"})]}),(0,s.jsxs)(r.tr,{children:[(0,s.jsx)(r.td,{children:(0,s.jsx)(r.a,{href:"/cli/reference/status",children:"status"})}),(0,s.jsx)(r.td,{children:"Spice runtime status"})]}),(0,s.jsxs)(r.tr,{children:[(0,s.jsx)(r.td,{children:(0,s.jsx)(r.a,{href:"/cli/reference/upgrade",children:"upgrade"})}),(0,s.jsx)(r.td,{children:"Upgrades the Spice CLI to the latest release"})]}),(0,s.jsxs)(r.tr,{children:[(0,s.jsx)(r.td,{children:(0,s.jsx)(r.a,{href:"/cli/reference/version",children:"version"})}),(0,s.jsx)(r.td,{children:"Spice CLI version"})]})]})]}),"\n",(0,s.jsx)(r.h3,{id:"command-flags",children:"Command Flags"}),"\n",(0,s.jsxs)(r.p,{children:["All commands have a help flag ",(0,s.jsx)(r.strong,{children:"--help"})," or ",(0,s.jsx)(r.strong,{children:"-h"})," to print its usage documentation:"]}),"\n",(0,s.jsxs)(r.ul,{children:["\n",(0,s.jsxs)(r.li,{children:[(0,s.jsx)(r.strong,{children:"--help"})," | ",(0,s.jsx)(r.strong,{children:"-h"})," : Print the help message"]}),"\n"]})]})}function o(e={}){const{wrapper:r}={...(0,c.R)(),...e.components};return r?(0,s.jsx)(r,{...e,children:(0,s.jsx)(h,{...e})}):h(e)}},8453:(e,r,n)=>{n.d(r,{R:()=>t,x:()=>d});var s=n(6540);const c={},i=s.createContext(c);function t(e){const r=s.useContext(i);return s.useMemo((function(){return"function"==typeof e?e(r):{...r,...e}}),[r,e])}function d(e){let r;return r=e.disableParentContext?"function"==typeof e.components?e.components(c):e.components||c:t(e.components),s.createElement(i.Provider,{value:r},e.children)}}}]);