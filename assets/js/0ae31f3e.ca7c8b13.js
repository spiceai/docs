"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[1423],{841:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>l,contentTitle:()=>o,default:()=>m,frontMatter:()=>s,metadata:()=>d,toc:()=>a});var i=t(4848),r=t(8453),c=t(3514);const s={title:"ML Model Deployment",sidebar_label:"ML Model Deployment",description:"",sidebar_position:1,pagination_next:"machine-learning/inference/index"},o=void 0,d={id:"machine-learning/model-deployment/index",title:"ML Model Deployment",description:"",source:"@site/docs/machine-learning/model-deployment/index.md",sourceDirName:"machine-learning/model-deployment",slug:"/machine-learning/model-deployment/",permalink:"/machine-learning/model-deployment/",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/machine-learning/model-deployment/index.md",tags:[],version:"current",sidebarPosition:1,frontMatter:{title:"ML Model Deployment",sidebar_label:"ML Model Deployment",description:"",sidebar_position:1,pagination_next:"machine-learning/inference/index"},sidebar:"docsSidebar",previous:{title:"Machine Learning",permalink:"/machine-learning/"},next:{title:"Machine Learning Inference",permalink:"/machine-learning/inference/"}},l={},a=[{value:"Model Source Docs",id:"model-source-docs",level:2}];function h(e){const n={code:"code",h2:"h2",li:"li",p:"p",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,r.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(n.p,{children:"Models can be loaded from a variety of sources:"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:"Local filesystem: Local ONNX files."}),"\n",(0,i.jsx)(n.li,{children:"HuggingFace: Models Hosted on HuggingFace."}),"\n",(0,i.jsx)(n.li,{children:"SpiceAI: Models trained on the Spice.AI Cloud Platform"}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"A model component, within a Spicepod, has the following format."}),"\n",(0,i.jsxs)(n.table,{children:[(0,i.jsx)(n.thead,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.th,{children:"field"}),(0,i.jsx)(n.th,{children:"Description"})]})}),(0,i.jsxs)(n.tbody,{children:[(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"name"})}),(0,i.jsx)(n.td,{children:"Unique, readable name for the model within the Spicepod."})]}),(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"from"})}),(0,i.jsx)(n.td,{children:"Source-specific address to uniquely identify a model"})]}),(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"datasets"})}),(0,i.jsx)(n.td,{children:"Datasets that the model depends on for inference"})]}),(0,i.jsxs)(n.tr,{children:[(0,i.jsxs)(n.td,{children:[(0,i.jsx)(n.code,{children:"files"})," (HF only)"]}),(0,i.jsx)(n.td,{children:"Specify an individual file within the HuggingFace repository to use"})]})]})]}),"\n",(0,i.jsx)(n.h2,{id:"model-source-docs",children:"Model Source Docs"}),"\n","\n","\n",(0,i.jsx)(c.A,{})]})}function m(e={}){const{wrapper:n}={...(0,r.R)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(h,{...e})}):h(e)}},3514:(e,n,t)=>{t.d(n,{A:()=>j});t(6540);var i=t(4164),r=t(4142),c=t(8774),s=t(6654),o=t(1312),d=t(1107);const l={cardContainer:"cardContainer_fWXF",cardTitle:"cardTitle_rnsV",cardDescription:"cardDescription_PWke"};var a=t(4848);function h(e){let{href:n,children:t}=e;return(0,a.jsx)(c.A,{href:n,className:(0,i.A)("card padding--lg",l.cardContainer),children:t})}function m(e){let{href:n,icon:t,title:r,description:c}=e;return(0,a.jsxs)(h,{href:n,children:[(0,a.jsxs)(d.A,{as:"h2",className:(0,i.A)("text--truncate",l.cardTitle),title:r,children:[t," ",r]}),c&&(0,a.jsx)("p",{className:(0,i.A)("text--truncate",l.cardDescription),title:c,children:c})]})}function p(e){let{item:n}=e;const t=(0,r.Nr)(n);return t?(0,a.jsx)(m,{href:t,icon:"\ud83d\uddc3\ufe0f",title:n.label,description:n.description??(0,o.T)({message:"{count} items",id:"theme.docs.DocCard.categoryDescription",description:"The default description for a category card in the generated index about how many items this category includes"},{count:n.items.length})}):null}function u(e){let{item:n}=e;const t=(0,s.A)(n.href)?"\ud83d\udcc4\ufe0f":"\ud83d\udd17",i=(0,r.cC)(n.docId??void 0);return(0,a.jsx)(m,{href:n.href,icon:t,title:n.label,description:n.description??i?.description})}function x(e){let{item:n}=e;switch(n.type){case"link":return(0,a.jsx)(u,{item:n});case"category":return(0,a.jsx)(p,{item:n});default:throw new Error(`unknown item type ${JSON.stringify(n)}`)}}function f(e){let{className:n}=e;const t=(0,r.$S)();return(0,a.jsx)(j,{items:t.items,className:n})}function j(e){const{items:n,className:t}=e;if(!n)return(0,a.jsx)(f,{...e});const c=(0,r.d1)(n);return(0,a.jsx)("section",{className:(0,i.A)("row",t),children:c.map(((e,n)=>(0,a.jsx)("article",{className:"col col--6 margin-bottom--lg",children:(0,a.jsx)(x,{item:e})},n)))})}},8453:(e,n,t)=>{t.d(n,{R:()=>s,x:()=>o});var i=t(6540);const r={},c=i.createContext(r);function s(e){const n=i.useContext(c);return i.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function o(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:s(e.components),i.createElement(c.Provider,{value:n},e.children)}}}]);