"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[947],{5999:(e,t,s)=>{s.r(t),s.d(t,{assets:()=>l,contentTitle:()=>i,default:()=>p,frontMatter:()=>c,metadata:()=>o,toc:()=>d});var r=s(4848),n=s(8453);const c={title:"Secret Stores",sidebar_label:"Secret Stores",description:"",sidebar_position:8},i=void 0,o={id:"secret-stores/index",title:"Secret Stores",description:"",source:"@site/docs/secret-stores/index.md",sourceDirName:"secret-stores",slug:"/secret-stores/",permalink:"/secret-stores/",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/secret-stores/index.md",tags:[],version:"current",sidebarPosition:8,frontMatter:{title:"Secret Stores",sidebar_label:"Secret Stores",description:"",sidebar_position:8},sidebar:"tutorialSidebar",previous:{title:"SQLite Data Accelerator",permalink:"/data-accelerators/sqlite"},next:{title:"Environment Secret Store",permalink:"/secret-stores/env/"}},l={},d=[{value:"Example",id:"example",level:2},{value:"Secret Stores",id:"secret-stores",level:2}];function a(e){const t={a:"a",code:"code",h2:"h2",li:"li",p:"p",pre:"pre",ul:"ul",...(0,n.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)(t.p,{children:["A Secret Store is a location where ",(0,r.jsx)(t.code,{children:"secret"})," objects are stored, used to store sensitive data, like passwords, tokens, secret keys."]}),"\n",(0,r.jsxs)(t.p,{children:["Spice supports multiple types of secret stores: ",(0,r.jsx)(t.code,{children:"file"}),", ",(0,r.jsx)(t.code,{children:"env"}),", ",(0,r.jsx)(t.code,{children:"kubernetes"})," and ",(0,r.jsx)(t.code,{children:"keyring"}),". The type of secret store is specified in the ",(0,r.jsx)(t.code,{children:"store"})," field of the ",(0,r.jsx)(t.code,{children:"secrets"})," section in the Spicepod manifest."]}),"\n",(0,r.jsx)(t.h2,{id:"example",children:"Example"}),"\n",(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-yaml",children:"secrets:\n  store: env\n"})}),"\n",(0,r.jsx)(t.h2,{id:"secret-stores",children:"Secret Stores"}),"\n",(0,r.jsxs)(t.ul,{children:["\n",(0,r.jsx)(t.li,{children:(0,r.jsx)(t.a,{href:"/secret-stores/env/",children:"Environment Secret Store"})}),"\n",(0,r.jsx)(t.li,{children:(0,r.jsx)(t.a,{href:"/secret-stores/file/",children:"File Secret Store"})}),"\n",(0,r.jsx)(t.li,{children:(0,r.jsx)(t.a,{href:"/secret-stores/kubernetes/",children:"Kubernetes Secret Store"})}),"\n",(0,r.jsx)(t.li,{children:(0,r.jsx)(t.a,{href:"/secret-stores/keyring/",children:"Keyring Secret Store"})}),"\n"]})]})}function p(e={}){const{wrapper:t}={...(0,n.R)(),...e.components};return t?(0,r.jsx)(t,{...e,children:(0,r.jsx)(a,{...e})}):a(e)}},8453:(e,t,s)=>{s.d(t,{R:()=>i,x:()=>o});var r=s(6540);const n={},c=r.createContext(n);function i(e){const t=r.useContext(c);return r.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function o(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(n):e.components||n:i(e.components),r.createElement(c.Provider,{value:t},e.children)}}}]);