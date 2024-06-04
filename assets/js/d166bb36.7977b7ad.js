"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[2673],{5928:(e,s,t)=>{t.r(s),t.d(s,{assets:()=>d,contentTitle:()=>o,default:()=>p,frontMatter:()=>a,metadata:()=>r,toc:()=>c});var n=t(4848),i=t(8453);const a={title:"Spicepods",sidebar_label:"Spicepods",sidebar_position:2,description:"An introduction to Spicepods",pagination_next:null},o=void 0,r={id:"getting-started/spicepods",title:"Spicepods",description:"An introduction to Spicepods",source:"@site/docs/getting-started/spicepods.md",sourceDirName:"getting-started",slug:"/getting-started/spicepods",permalink:"/getting-started/spicepods",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/getting-started/spicepods.md",tags:[],version:"current",sidebarPosition:2,frontMatter:{title:"Spicepods",sidebar_label:"Spicepods",sidebar_position:2,description:"An introduction to Spicepods",pagination_next:null},sidebar:"docsSidebar",previous:{title:"Spice.ai Cloud Platform",permalink:"/getting-started/spiceai"}},d={},c=[{value:"Overview",id:"overview",level:2},{value:"Structure",id:"structure",level:2},{value:"Example Manifest",id:"example-manifest",level:2},{value:"Key Components",id:"key-components",level:2},{value:"Datasets",id:"datasets",level:3},{value:"Models",id:"models",level:3},{value:"Secrets",id:"secrets",level:3}];function l(e){const s={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,i.R)(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(s.h2,{id:"overview",children:"Overview"}),"\n",(0,n.jsxs)(s.p,{children:["A ",(0,n.jsx)(s.strong,{children:"Spicepod"})," is a package that encapsulates application-centric datasets and machine learning (ML) models."]}),"\n",(0,n.jsx)(s.p,{children:"Spicepods are analogous to code packaging systems, like NPM, however differ by expanding the concepts to data and ML models."}),"\n",(0,n.jsx)(s.h2,{id:"structure",children:"Structure"}),"\n",(0,n.jsxs)(s.p,{children:["A Spicepod is described by a YAML manifest file, typically named ",(0,n.jsx)(s.code,{children:"spicepod.yaml"}),", which includes the following key sections:"]}),"\n",(0,n.jsxs)(s.ul,{children:["\n",(0,n.jsxs)(s.li,{children:[(0,n.jsx)(s.strong,{children:"Metadata:"})," Basic information about the Spicepod, such as its name and version."]}),"\n",(0,n.jsxs)(s.li,{children:[(0,n.jsx)(s.strong,{children:"Datasets:"})," Definitions of datasets that are used or produced within the Spicepod."]}),"\n",(0,n.jsxs)(s.li,{children:[(0,n.jsx)(s.strong,{children:"Models:"})," Definitions of ML models that the Spicepod manages, including their sources and associated datasets."]}),"\n",(0,n.jsxs)(s.li,{children:[(0,n.jsx)(s.strong,{children:"Secrets:"})," Configuration for any secret stores used by the Spicepod."]}),"\n"]}),"\n",(0,n.jsx)(s.h2,{id:"example-manifest",children:"Example Manifest"}),"\n",(0,n.jsx)(s.pre,{children:(0,n.jsx)(s.code,{className:"language-yaml",children:"version: v1beta1\nkind: Spicepod\nname: my_spicepod\n\ndatasets:\n  - from: spice.ai/spiceai/quickstart\n    name: qs\n    acceleration:\n      enabled: true\n      refresh_mode: append\n\nmodels:\n  - from: file://model_path.onnx\n    name: my_model\n    datasets:\n      - qs\n\nsecrets:\n  store: env\n"})}),"\n",(0,n.jsx)(s.h2,{id:"key-components",children:"Key Components"}),"\n",(0,n.jsx)(s.h3,{id:"datasets",children:"Datasets"}),"\n",(0,n.jsx)(s.p,{children:"Datasets in a Spicepod can be sourced from various locations, including local files or remote databases. They can be materialized and accelerated using different engines such as DuckDB, SQLite, or PostgreSQL to optimize performance."}),"\n",(0,n.jsxs)(s.p,{children:["Learn more at ",(0,n.jsx)(s.a,{href:"/reference/spicepod/datasets",children:"Datasets"}),"."]}),"\n",(0,n.jsx)(s.h3,{id:"models",children:"Models"}),"\n",(0,n.jsx)(s.p,{children:"ML models are integrated into the Spicepod similarly to datasets. The models can be specified using paths to local files or remote locations. ML inference can be performed using the models and datasets defined within the Spicepod."}),"\n",(0,n.jsxs)(s.p,{children:["Learn more at ",(0,n.jsx)(s.a,{href:"/reference/spicepod/models",children:"Datasets"}),"."]}),"\n",(0,n.jsx)(s.h3,{id:"secrets",children:"Secrets"}),"\n",(0,n.jsx)(s.p,{children:"Spice.ai supports various secret stores to manage sensitive information such as API keys or database credentials. Supported secret store types include environment variables, files, AWS Secrets Manager, Kubernetes secrets, and keyrings."}),"\n",(0,n.jsxs)(s.p,{children:["Learn more at ",(0,n.jsx)(s.a,{href:"/secret-stores/",children:"Secret Stores"})]})]})}function p(e={}){const{wrapper:s}={...(0,i.R)(),...e.components};return s?(0,n.jsx)(s,{...e,children:(0,n.jsx)(l,{...e})}):l(e)}},8453:(e,s,t)=>{t.d(s,{R:()=>o,x:()=>r});var n=t(6540);const i={},a=n.createContext(i);function o(e){const s=n.useContext(a);return n.useMemo((function(){return"function"==typeof e?e(s):{...s,...e}}),[s,e])}function r(e){let s;return s=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:o(e.components),n.createElement(a.Provider,{value:s},e.children)}}}]);