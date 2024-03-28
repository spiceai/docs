"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[8328],{8561:(e,n,i)=>{i.r(n),i.d(n,{assets:()=>c,contentTitle:()=>o,default:()=>m,frontMatter:()=>r,metadata:()=>s,toc:()=>l});var t=i(4848),a=i(8453);const r={title:"Machine Learning",sidebar_label:"Machine Learning",description:"",sidebar_position:8},o=void 0,s={id:"machine-learning/index",title:"Machine Learning",description:"",source:"@site/docs/machine-learning/index.md",sourceDirName:"machine-learning",slug:"/machine-learning/",permalink:"/machine-learning/",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/machine-learning/index.md",tags:[],version:"current",sidebarPosition:8,frontMatter:{title:"Machine Learning",sidebar_label:"Machine Learning",description:"",sidebar_position:8},sidebar:"tutorialSidebar",previous:{title:"Keyring Secret Store",permalink:"/secret-stores/keyring/"},next:{title:"ML Model Deployment",permalink:"/machine-learning/model-deployment/"}},c={},l=[];function d(e){const n={admonition:"admonition",code:"code",p:"p",pre:"pre",...(0,a.R)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(n.admonition,{title:"Early Preview",type:"warning",children:(0,t.jsx)(n.p,{children:"The Spice ML runtime is in its early preview phase and is subject to modifications."})}),"\n",(0,t.jsx)(n.p,{children:"Machine learning models can be added to the Spice runtime similarly to datasets. The Spice runtime will load it, just like a dataset."}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-yaml",children:"name: my_spicepod\nversion: v1beta1\nkind: Spicepod\n\nmodels:\n  - from: file:/model_path.onnx\n    name: my_model_name\n    datasets:\n      - my_inference_view\n\ndatasets:\n  - from: localhost\n    name: my_inference_view\n    sql_ref: inference.sql\n\n    # All your other datasets\n  - from: spice.ai/eth.recent_blocks\n    name: eth_recent_blocks\n    acceleration:\n        enabled: true\n        refresh_mode: append\n"})})]})}function m(e={}){const{wrapper:n}={...(0,a.R)(),...e.components};return n?(0,t.jsx)(n,{...e,children:(0,t.jsx)(d,{...e})}):d(e)}},8453:(e,n,i)=>{i.d(n,{R:()=>o,x:()=>s});var t=i(6540);const a={},r=t.createContext(a);function o(e){const n=t.useContext(r);return t.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function s(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(a):e.components||a:o(e.components),t.createElement(r.Provider,{value:n},e.children)}}}]);