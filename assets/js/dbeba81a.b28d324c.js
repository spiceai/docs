"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[5545],{2097:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>c,default:()=>p,frontMatter:()=>o,metadata:()=>a,toc:()=>d});var i=n(4848),s=n(8453),r=n(3514);const o={title:"Clients and Tools",sidebar_label:"Clients and Tools",sidebar_position:9,description:"Client and tools",pagination_prev:null,pagination_next:null},c=void 0,a={id:"clients/index",title:"Clients and Tools",description:"Client and tools",source:"@site/docs/clients/index.md",sourceDirName:"clients",slug:"/clients/",permalink:"/clients/",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/clients/index.md",tags:[],version:"current",sidebarPosition:9,frontMatter:{title:"Clients and Tools",sidebar_label:"Clients and Tools",sidebar_position:9,description:"Client and tools",pagination_prev:null,pagination_next:null},sidebar:"docsSidebar"},l={},d=[];function u(e){return(0,i.jsx)(r.A,{})}function p(e={}){const{wrapper:t}={...(0,s.R)(),...e.components};return t?(0,i.jsx)(t,{...e,children:(0,i.jsx)(u,{...e})}):u()}},3514:(e,t,n)=>{n.d(t,{A:()=>g});n(6540);var i=n(4164),s=n(4142),r=n(8774),o=n(6654),c=n(1312),a=n(1107);const l={cardContainer:"cardContainer_fWXF",cardTitle:"cardTitle_rnsV",cardDescription:"cardDescription_PWke"};var d=n(4848);function u(e){let{href:t,children:n}=e;return(0,d.jsx)(r.A,{href:t,className:(0,i.A)("card padding--lg",l.cardContainer),children:n})}function p(e){let{href:t,icon:n,title:s,description:r}=e;return(0,d.jsxs)(u,{href:t,children:[(0,d.jsxs)(a.A,{as:"h2",className:(0,i.A)("text--truncate",l.cardTitle),title:s,children:[n," ",s]}),r&&(0,d.jsx)("p",{className:(0,i.A)("text--truncate",l.cardDescription),title:r,children:r})]})}function m(e){let{item:t}=e;const n=(0,s.Nr)(t);return n?(0,d.jsx)(p,{href:n,icon:"\ud83d\uddc3\ufe0f",title:t.label,description:t.description??(0,c.T)({message:"{count} items",id:"theme.docs.DocCard.categoryDescription",description:"The default description for a category card in the generated index about how many items this category includes"},{count:t.items.length})}):null}function f(e){let{item:t}=e;const n=(0,o.A)(t.href)?"\ud83d\udcc4\ufe0f":"\ud83d\udd17",i=(0,s.cC)(t.docId??void 0);return(0,d.jsx)(p,{href:t.href,icon:n,title:t.label,description:t.description??i?.description})}function h(e){let{item:t}=e;switch(t.type){case"link":return(0,d.jsx)(f,{item:t});case"category":return(0,d.jsx)(m,{item:t});default:throw new Error(`unknown item type ${JSON.stringify(t)}`)}}function x(e){let{className:t}=e;const n=(0,s.$S)();return(0,d.jsx)(g,{items:n.items,className:t})}function g(e){const{items:t,className:n}=e;if(!t)return(0,d.jsx)(x,{...e});const r=(0,s.d1)(t);return(0,d.jsx)("section",{className:(0,i.A)("row",n),children:r.map(((e,t)=>(0,d.jsx)("article",{className:"col col--6 margin-bottom--lg",children:(0,d.jsx)(h,{item:e})},t)))})}},8453:(e,t,n)=>{n.d(t,{R:()=>o,x:()=>c});var i=n(6540);const s={},r=i.createContext(s);function o(e){const t=i.useContext(r);return i.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function c(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:o(e.components),i.createElement(r.Provider,{value:t},e.children)}}}]);