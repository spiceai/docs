"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[4183],{3572:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>a,contentTitle:()=>o,default:()=>p,frontMatter:()=>i,metadata:()=>c,toc:()=>l});var r=n(4848),s=n(8453);const i={title:"Environment Secret Store",sidebar_label:"Environment Secret Store",sidebar_position:1,description:"Environment Variables Secret Store Documentation"},o=void 0,c={id:"secret-stores/env/index",title:"Environment Secret Store",description:"Environment Variables Secret Store Documentation",source:"@site/docs/secret-stores/env/index.md",sourceDirName:"secret-stores/env",slug:"/secret-stores/env/",permalink:"/secret-stores/env/",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/secret-stores/env/index.md",tags:[],version:"current",sidebarPosition:1,frontMatter:{title:"Environment Secret Store",sidebar_label:"Environment Secret Store",sidebar_position:1,description:"Environment Variables Secret Store Documentation"},sidebar:"tutorialSidebar",previous:{title:"Secret Stores",permalink:"/secret-stores/"},next:{title:"File Secret Store",permalink:"/secret-stores/file/"}},a={},l=[{value:"Example",id:"example",level:2}];function d(e){const t={code:"code",h2:"h2",p:"p",pre:"pre",...(0,s.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)(t.p,{children:["The ",(0,r.jsx)(t.code,{children:"env"})," store type enables Spice to read secrets from environment variables. Environment variables should be formatted ",(0,r.jsx)(t.code,{children:"SPICE_SECRET_<secret-name>_<secret-value-key>"}),"."]}),"\n",(0,r.jsxs)(t.p,{children:["All variables with the same prefix ",(0,r.jsx)(t.code,{children:"SPICE_SECRET_<secret-name>"})," are combined into a single secret. This allows grouping of related secret values under a single secret name."]}),"\n",(0,r.jsx)(t.h2,{id:"example",children:"Example"}),"\n",(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-yaml",children:"secrets:\n  store: env\n"})}),"\n",(0,r.jsxs)(t.p,{children:["Setting ",(0,r.jsx)(t.code,{children:"spiceai"})," secret with spice.ai API key in ",(0,r.jsx)(t.code,{children:"key"})," secret value:"]}),"\n",(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-bash",children:'SPICE_SECRET_SPICEAI_KEY="343533|**************" \\\n  spice run\n'})})]})}function p(e={}){const{wrapper:t}={...(0,s.R)(),...e.components};return t?(0,r.jsx)(t,{...e,children:(0,r.jsx)(d,{...e})}):d(e)}},8453:(e,t,n)=>{n.d(t,{R:()=>o,x:()=>c});var r=n(6540);const s={},i=r.createContext(s);function o(e){const t=r.useContext(i);return r.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function c(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:o(e.components),r.createElement(i.Provider,{value:t},e.children)}}}]);