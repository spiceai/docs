"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[1824],{2230:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>a,contentTitle:()=>c,default:()=>p,frontMatter:()=>i,metadata:()=>o,toc:()=>l});var r=t(4848),s=t(8453);const i={title:"Keyring Secret Store",sidebar_label:"Keyring Secret Store",sidebar_position:4,description:"Keyring Secret Store Documentation",pagination_next:null},c=void 0,o={id:"components/secret-stores/keyring/index",title:"Keyring Secret Store",description:"Keyring Secret Store Documentation",source:"@site/docs/components/secret-stores/keyring/index.md",sourceDirName:"components/secret-stores/keyring",slug:"/components/secret-stores/keyring/",permalink:"/components/secret-stores/keyring/",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/components/secret-stores/keyring/index.md",tags:[],version:"current",sidebarPosition:4,frontMatter:{title:"Keyring Secret Store",sidebar_label:"Keyring Secret Store",sidebar_position:4,description:"Keyring Secret Store Documentation",pagination_next:null},sidebar:"docsSidebar",previous:{title:"Kubernetes Secret Store",permalink:"/components/secret-stores/kubernetes/"}},a={},l=[{value:"Example",id:"example",level:2}];function d(e){const n={code:"code",h2:"h2",li:"li",p:"p",pre:"pre",ul:"ul",...(0,s.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)(n.p,{children:["The ",(0,r.jsx)(n.code,{children:"keyring"})," store enables Spice to access secrets from the secure/credential store of the host operating system:"]}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsx)(n.li,{children:"Linux: The secret-service and kernel keyutils."}),"\n",(0,r.jsx)(n.li,{children:"macOS: The keychain."}),"\n",(0,r.jsx)(n.li,{children:"Windows: The Credential Manager."}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["The Keyring Store will read entries where the entry account or user is set to ",(0,r.jsx)(n.code,{children:"spiced"}),"."]}),"\n",(0,r.jsx)(n.h2,{id:"example",children:"Example"}),"\n",(0,r.jsxs)(n.p,{children:["To set the ",(0,r.jsx)(n.code,{children:"spiceai"})," API Key secret using macOS keychain, create a new keychain entry, and set the value with the API Key."]}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:'"<your spice.ai app api key>"'})}),"\n",(0,r.jsx)("img",{src:"/img/secrets-keychain-example.png",alt:"",width:"800"}),"\n",(0,r.jsxs)(n.p,{children:["The ",(0,r.jsx)(n.code,{children:"keyring"})," store is configured in the Spicepod manifest:"]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-yaml",children:"secrets:\n  - from: keyring\n    name: keyring\n"})}),"\n",(0,r.jsx)(n.p,{children:"And the secret can be referenced in parameters:"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-yaml",children:"datasets:\n  - from: spiceai:eth.recent_blocks\n    name: blocks\n    params:\n      spiceai_api_key: ${keyring:spiceai_api_key} # ${secrets:spiceai_api_key} can also be used\n"})})]})}function p(e={}){const{wrapper:n}={...(0,s.R)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(d,{...e})}):d(e)}},8453:(e,n,t)=>{t.d(n,{R:()=>c,x:()=>o});var r=t(6540);const s={},i=r.createContext(s);function c(e){const n=r.useContext(i);return r.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function o(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:c(e.components),r.createElement(i.Provider,{value:n},e.children)}}}]);