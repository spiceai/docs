"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[7285],{5624:(e,n,s)=>{s.r(n),s.d(n,{assets:()=>r,contentTitle:()=>c,default:()=>p,frontMatter:()=>l,metadata:()=>o,toc:()=>a});var i=s(4848),t=s(8453);const l={title:"pods",sidebar_label:"pods",pagination_prev:null,pagination_next:null},c=void 0,o={id:"cli/reference/pods",title:"pods",description:"Lists Spicepods loaded by the Spice runtime",source:"@site/docs/cli/reference/pods.md",sourceDirName:"cli/reference",slug:"/cli/reference/pods",permalink:"/cli/reference/pods",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/cli/reference/pods.md",tags:[],version:"current",frontMatter:{title:"pods",sidebar_label:"pods",pagination_prev:null,pagination_next:null},sidebar:"docsSidebar"},r={},a=[{value:"Usage",id:"usage",level:3},{value:"Flags",id:"flags",level:4},{value:"Examples",id:"examples",level:3},{value:"Additional Example",id:"additional-example",level:3}];function d(e){const n={code:"code",h3:"h3",h4:"h4",li:"li",p:"p",pre:"pre",ul:"ul",...(0,t.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(n.p,{children:"Lists Spicepods loaded by the Spice runtime"}),"\n",(0,i.jsx)(n.h3,{id:"usage",children:"Usage"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-shell",children:"spice pods [flags]\n"})}),"\n",(0,i.jsx)(n.h4,{id:"flags",children:"Flags"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"--tls-root-certificate-file"}),"   The path to the root certificate file used to verify the Spice.ai runtime server certificate"]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"-h"}),", ",(0,i.jsx)(n.code,{children:"--help"}),"   help for pods"]}),"\n"]}),"\n",(0,i.jsx)(n.h3,{id:"examples",children:"Examples"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-shell",children:">>> spice pods\n\nVERSION NAME        DATASETSCOUNT MODELSCOUNT DEPENDENCIESCOUNT\nv1beta1 demo        2             1           0\nv1beta1 another_pod 3             0           1\n"})}),"\n",(0,i.jsx)(n.h3,{id:"additional-example",children:"Additional Example"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-shell",children:">>> spice pods --tls-root-certificate-file /path/to/cert.pem\n\nVERSION NAME        DATASETSCOUNT MODELSCOUNT DEPENDENCIESCOUNT\nv1beta1 demo        2             1           0\nv1beta1 another_pod 3             0           1\n"})})]})}function p(e={}){const{wrapper:n}={...(0,t.R)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(d,{...e})}):d(e)}},8453:(e,n,s)=>{s.d(n,{R:()=>c,x:()=>o});var i=s(6540);const t={},l=i.createContext(t);function c(e){const n=i.useContext(l);return i.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function o(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(t):e.components||t:c(e.components),i.createElement(l.Provider,{value:n},e.children)}}}]);