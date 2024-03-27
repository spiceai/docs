"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[261],{2085:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>a,contentTitle:()=>c,default:()=>l,frontMatter:()=>o,metadata:()=>i,toc:()=>u});var s=r(4848),n=r(8453);const o={title:"Kubernetes Secret Store",sidebar_label:"Kubernetes Secret Store",sidebar_position:3,description:"Kubernetes Secret Store Documentation"},c=void 0,i={id:"secret-stores/kubernetes/index",title:"Kubernetes Secret Store",description:"Kubernetes Secret Store Documentation",source:"@site/docs/secret-stores/kubernetes/index.md",sourceDirName:"secret-stores/kubernetes",slug:"/secret-stores/kubernetes/",permalink:"/secret-stores/kubernetes/",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/secret-stores/kubernetes/index.md",tags:[],version:"current",sidebarPosition:3,frontMatter:{title:"Kubernetes Secret Store",sidebar_label:"Kubernetes Secret Store",sidebar_position:3,description:"Kubernetes Secret Store Documentation"},sidebar:"tutorialSidebar",previous:{title:"File Secret Store",permalink:"/secret-stores/file/"},next:{title:"Keyring Secret Store",permalink:"/secret-stores/keyring/"}},a={},u=[{value:"Example",id:"example",level:2}];function d(e){const t={code:"code",h2:"h2",p:"p",pre:"pre",...(0,n.R)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsxs)(t.p,{children:["The ",(0,s.jsx)(t.code,{children:"kubernetes"})," store enables Spice to read Kubernetes secrets."]}),"\n",(0,s.jsx)(t.h2,{id:"example",children:"Example"}),"\n",(0,s.jsx)(t.pre,{children:(0,s.jsx)(t.code,{className:"language-yaml",children:"secrets:\n  store: kubernetes\n"})}),"\n",(0,s.jsxs)(t.p,{children:["Note: This method requires the Kubernetes service account, which is running the ",(0,s.jsx)(t.code,{children:"spiced"})," pod, to have extended roles for secrets API access. Make sure to configure this service account with the necessary permissions to read secrets from the Kubernetes API."]}),"\n",(0,s.jsx)(t.p,{children:"Example of Kubernetes role configuration for a custom service account:"}),"\n",(0,s.jsx)(t.pre,{children:(0,s.jsx)(t.code,{className:"language-yaml",children:"kind: Role\napiVersion: rbac.authorization.k8s.io/v1\nmetadata:\n  name: spiced-account-role\nrules:\n  - apiGroups: ['']\n    resources: ['secrets']\n    verbs: ['get']\n"})})]})}function l(e={}){const{wrapper:t}={...(0,n.R)(),...e.components};return t?(0,s.jsx)(t,{...e,children:(0,s.jsx)(d,{...e})}):d(e)}},8453:(e,t,r)=>{r.d(t,{R:()=>c,x:()=>i});var s=r(6540);const n={},o=s.createContext(n);function c(e){const t=s.useContext(o);return s.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function i(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(n):e.components||n:c(e.components),s.createElement(o.Provider,{value:t},e.children)}}}]);