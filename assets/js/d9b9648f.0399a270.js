"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[4329],{7756:(e,n,s)=>{s.r(n),s.d(n,{assets:()=>c,contentTitle:()=>r,default:()=>h,frontMatter:()=>l,metadata:()=>o,toc:()=>t});var i=s(4848),d=s(8453);const l={title:"Models",sidebar_label:"Models",description:"Models YAML reference",pagination_next:null},r="models",o={id:"reference/spicepod/models",title:"Models",description:"Models YAML reference",source:"@site/docs/reference/spicepod/models.md",sourceDirName:"reference/spicepod",slug:"/reference/spicepod/models",permalink:"/reference/spicepod/models",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/reference/spicepod/models.md",tags:[],version:"current",frontMatter:{title:"Models",sidebar_label:"Models",description:"Models YAML reference",pagination_next:null},sidebar:"tutorialSidebar",previous:{title:"Datasets",permalink:"/reference/spicepod/datasets"}},c={},t=[{value:"<code>name</code>",id:"name",level:2},{value:"<code>from</code>",id:"from",level:2},{value:"<code>datasets</code>",id:"datasets",level:2},{value:"<code>files</code>",id:"files",level:2}];function a(e){const n={a:"a",admonition:"admonition",code:"code",h1:"h1",h2:"h2",li:"li",p:"p",pre:"pre",ul:"ul",...(0,d.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(n.admonition,{title:"Early Preview",type:"warning",children:(0,i.jsx)(n.p,{children:"The model specifications are in early preview and are subject to change."})}),"\n",(0,i.jsx)(n.p,{children:"A Spicepod can contain one or more models referenced by relative path, or defined inline."}),"\n",(0,i.jsx)(n.h1,{id:"models",children:(0,i.jsx)(n.code,{children:"models"})}),"\n",(0,i.jsx)(n.p,{children:"Inline example:"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"spicepod.yaml"})}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-yaml",children:"models:\n  - from: spiceai:spice.ai/lukekim/smart/models/drive_stats:latest\n    name: drive_stats\n    datasets:\n      - drive_stats_inferencing\n"})}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"spicepod.yaml"})}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-yaml",children:"models:\n  - from: huggingface:huggingface.co/spiceai/darts:latest\n    name: drive_stats\n    files:\n      - model.onnx\n    datasets:\n      - drive_stats_inferencing\n"})}),"\n",(0,i.jsx)(n.p,{children:"Relative path example:"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"spicepod.yaml"})}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-yaml",children:"models:\n  - from: models/drive_stats\n"})}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.code,{children:"models/drive_stats/model.yaml"})}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-yaml",children:"models:\n  - from: spiceai:spice.ai/lukekim/smart/models/drive_stats:latest\n    name: drive_stats\n    datasets:\n      - drive_stats_inferencing\n"})}),"\n",(0,i.jsx)(n.h2,{id:"name",children:(0,i.jsx)(n.code,{children:"name"})}),"\n",(0,i.jsx)(n.p,{children:"The name of the model. This is used to reference the model in the pod manifest, as well as in external data sources."}),"\n",(0,i.jsx)(n.h2,{id:"from",children:(0,i.jsx)(n.code,{children:"from"})}),"\n",(0,i.jsxs)(n.p,{children:["The ",(0,i.jsx)(n.code,{children:"from"})," field is a string that represents the Uniform Resource Identifier (URI) for the model. This URI is composed of two parts: a prefix indicating the source of the model, and the actual link to the model."]}),"\n",(0,i.jsxs)(n.p,{children:["The syntax for the ",(0,i.jsx)(n.code,{children:"from"})," field is as follows:"]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-yaml",children:"from: <source>:<link>:<version>\n"})}),"\n",(0,i.jsx)(n.p,{children:"Where:"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"<source>"}),": The source of the model"]}),"\n",(0,i.jsx)(n.p,{children:"Currently supported sources:"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"/machine-learning/model-deployment/spiceai",children:(0,i.jsx)(n.code,{children:"spiceai"})})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"/machine-learning/model-deployment/huggingface",children:(0,i.jsx)(n.code,{children:"huggingface"})})}),"\n"]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"<link>"}),": The actual link to the model."]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"<version>"}),": The version of the model. This is optional and if not specified, the latest version of the model will be used."]}),"\n"]}),"\n"]}),"\n",(0,i.jsx)(n.h2,{id:"datasets",children:(0,i.jsx)(n.code,{children:"datasets"})}),"\n",(0,i.jsx)(n.p,{children:"An array of dataset names needed for the model."}),"\n",(0,i.jsx)(n.h2,{id:"files",children:(0,i.jsx)(n.code,{children:"files"})}),"\n",(0,i.jsx)(n.p,{children:"Only for Huggingface models. List of model files to download from Huggingface."}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-yaml",children:"files:\n  - model.onnx\n  - model.onnx.data\n  ...\n"})})]})}function h(e={}){const{wrapper:n}={...(0,d.R)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(a,{...e})}):a(e)}},8453:(e,n,s)=>{s.d(n,{R:()=>r,x:()=>o});var i=s(6540);const d={},l=i.createContext(d);function r(e){const n=i.useContext(l);return i.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function o(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(d):e.components||d:r(e.components),i.createElement(l.Provider,{value:n},e.children)}}}]);