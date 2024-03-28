"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[6673],{3614:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>s,contentTitle:()=>a,default:()=>m,frontMatter:()=>l,metadata:()=>c,toc:()=>r});var o=t(4848),i=t(8453);const l={title:"Local",sidebar_label:"Local",sidebar_position:3},a=void 0,c={id:"machine-learning/model-deployment/local",title:"Local",description:"Local models can be used by specifying the file's path in from key.",source:"@site/docs/machine-learning/model-deployment/local.md",sourceDirName:"machine-learning/model-deployment",slug:"/machine-learning/model-deployment/local",permalink:"/machine-learning/model-deployment/local",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/machine-learning/model-deployment/local.md",tags:[],version:"current",sidebarPosition:3,frontMatter:{title:"Local",sidebar_label:"Local",sidebar_position:3},sidebar:"tutorialSidebar",previous:{title:"SpiceAI",permalink:"/machine-learning/model-deployment/spiceai"},next:{title:"Machine Learning Inference",permalink:"/machine-learning/inference/"}},s={},r=[{value:"Example",id:"example",level:3}];function d(e){const n={code:"code",h3:"h3",p:"p",pre:"pre",...(0,i.R)(),...e.components};return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)(n.p,{children:["Local models can be used by specifying the file's path in ",(0,o.jsx)(n.code,{children:"from"})," key."]}),"\n",(0,o.jsx)(n.h3,{id:"example",children:"Example"}),"\n",(0,o.jsx)(n.pre,{children:(0,o.jsx)(n.code,{className:"language-yaml",children:"models:\n  - from: file:/absolute/path/to/my/model.onnx\n    name: local_model\n    datasets:\n      - taxi_trips\n"})})]})}function m(e={}){const{wrapper:n}={...(0,i.R)(),...e.components};return n?(0,o.jsx)(n,{...e,children:(0,o.jsx)(d,{...e})}):d(e)}},8453:(e,n,t)=>{t.d(n,{R:()=>a,x:()=>c});var o=t(6540);const i={},l=o.createContext(i);function a(e){const n=o.useContext(l);return o.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function c(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:a(e.components),o.createElement(l.Provider,{value:n},e.children)}}}]);