"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[7324],{3846:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>l,contentTitle:()=>o,default:()=>u,frontMatter:()=>s,metadata:()=>i,toc:()=>d});var n=r(4848),a=r(8453),c=r(3514);const s={title:"Data Accelerators",sidebar_label:"Data Accelerators",description:"",sidebar_position:2,pagination_prev:null,pagination_next:null},o=void 0,i={id:"components/data-accelerators/index",title:"Data Accelerators",description:"",source:"@site/docs/components/data-accelerators/index.md",sourceDirName:"components/data-accelerators",slug:"/components/data-accelerators/",permalink:"/components/data-accelerators/",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/components/data-accelerators/index.md",tags:[],version:"current",sidebarPosition:2,frontMatter:{title:"Data Accelerators",sidebar_label:"Data Accelerators",description:"",sidebar_position:2,pagination_prev:null,pagination_next:null},sidebar:"docsSidebar"},l={},d=[{value:"Data Types",id:"data-types",level:2},{value:"Data Accelerator Docs",id:"data-accelerator-docs",level:2}];function h(e){const t={a:"a",code:"code",h2:"h2",p:"p",pre:"pre",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,a.R)(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(t.p,{children:"Data sourced by Data Connectors can be locally materialized and accelerated using a Data Accelerator."}),"\n",(0,n.jsxs)(t.p,{children:["A Data Accelerator will query/fetch data from a connected data source and store/update it locally in an embedded acceleration engine, such as DuckDB or SQLite. To set data refresh behavior, such as refreshing data on an interval see ",(0,n.jsx)(t.a,{href:"/components/data-accelerators/data-refresh",children:"Data Refresh"}),"."]}),"\n",(0,n.jsx)(t.p,{children:"Dataset acceleration is enabled by setting the acceleration configuration. E.g."}),"\n",(0,n.jsx)(t.pre,{children:(0,n.jsx)(t.code,{className:"language-yaml",children:"datasets:\n  - name: accelerated_dataset\n    acceleration:\n      enabled: true\n"})}),"\n",(0,n.jsxs)(t.p,{children:["For the complete reference specification see ",(0,n.jsx)(t.a,{href:"/reference/spicepod/datasets",children:"datasets"}),"."]}),"\n",(0,n.jsx)(t.p,{children:"By default, datasets will be locally materialized using in-memory Arrow records."}),"\n",(0,n.jsx)(t.p,{children:"A choice of DuckDB, SQLite, or PostgreSQL engines can be used to materialize data, in-memory, on disk, or in attached databases."}),"\n",(0,n.jsx)(t.p,{children:"Supported Data Accelerators include:"}),"\n",(0,n.jsxs)(t.table,{children:[(0,n.jsx)(t.thead,{children:(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.th,{children:"Engine Name"}),(0,n.jsx)(t.th,{children:"Description"}),(0,n.jsx)(t.th,{children:"Status"}),(0,n.jsx)(t.th,{children:"Engine Modes"})]})}),(0,n.jsxs)(t.tbody,{children:[(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.td,{children:(0,n.jsx)(t.code,{children:"arrow"})}),(0,n.jsx)(t.td,{children:"In-Memory Arrow Records"}),(0,n.jsx)(t.td,{children:"Alpha"}),(0,n.jsx)(t.td,{children:(0,n.jsx)(t.code,{children:"memory"})})]}),(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.td,{children:(0,n.jsx)(t.a,{href:"/components/data-accelerators/duckdb",children:(0,n.jsx)(t.code,{children:"duckdb"})})}),(0,n.jsx)(t.td,{children:"Embedded DuckDB"}),(0,n.jsx)(t.td,{children:"Alpha"}),(0,n.jsxs)(t.td,{children:[(0,n.jsx)(t.code,{children:"memory"}),", ",(0,n.jsx)(t.code,{children:"file"})]})]}),(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.td,{children:(0,n.jsx)(t.a,{href:"/components/data-accelerators/sqlite",children:(0,n.jsx)(t.code,{children:"sqlite"})})}),(0,n.jsx)(t.td,{children:"Embedded SQLite"}),(0,n.jsx)(t.td,{children:"Alpha"}),(0,n.jsxs)(t.td,{children:[(0,n.jsx)(t.code,{children:"memory"}),", ",(0,n.jsx)(t.code,{children:"file"})]})]}),(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.td,{children:(0,n.jsx)(t.a,{href:"/components/data-accelerators/postgres/",children:(0,n.jsx)(t.code,{children:"postgres"})})}),(0,n.jsx)(t.td,{children:"Attached PostgreSQL"}),(0,n.jsx)(t.td,{children:"Alpha"}),(0,n.jsx)(t.td,{})]})]})]}),"\n",(0,n.jsx)(t.h2,{id:"data-types",children:"Data Types"}),"\n",(0,n.jsxs)(t.p,{children:["Data Accelerators may not support all possible Apache Arrow data types. For complete compatibility, see ",(0,n.jsx)(t.a,{href:"/reference/datatypes",children:"specifications"}),"."]}),"\n",(0,n.jsx)(t.h2,{id:"data-accelerator-docs",children:"Data Accelerator Docs"}),"\n","\n",(0,n.jsx)(c.A,{})]})}function u(e={}){const{wrapper:t}={...(0,a.R)(),...e.components};return t?(0,n.jsx)(t,{...e,children:(0,n.jsx)(h,{...e})}):h(e)}},3514:(e,t,r)=>{r.d(t,{A:()=>g});r(6540);var n=r(4164),a=r(4142),c=r(8774),s=r(5846),o=r(6654),i=r(1312),l=r(1107);const d={cardContainer:"cardContainer_fWXF",cardTitle:"cardTitle_rnsV",cardDescription:"cardDescription_PWke"};var h=r(4848);function u(e){let{href:t,children:r}=e;return(0,h.jsx)(c.A,{href:t,className:(0,n.A)("card padding--lg",d.cardContainer),children:r})}function p(e){let{href:t,icon:r,title:a,description:c}=e;return(0,h.jsxs)(u,{href:t,children:[(0,h.jsxs)(l.A,{as:"h2",className:(0,n.A)("text--truncate",d.cardTitle),title:a,children:[r," ",a]}),c&&(0,h.jsx)("p",{className:(0,n.A)("text--truncate",d.cardDescription),title:c,children:c})]})}function m(e){let{item:t}=e;const r=(0,a.Nr)(t),n=function(){const{selectMessage:e}=(0,s.W)();return t=>e(t,(0,i.T)({message:"1 item|{count} items",id:"theme.docs.DocCard.categoryDescription.plurals",description:"The default description for a category card in the generated index about how many items this category includes"},{count:t}))}();return r?(0,h.jsx)(p,{href:r,icon:"\ud83d\uddc3\ufe0f",title:t.label,description:t.description??n(t.items.length)}):null}function x(e){let{item:t}=e;const r=(0,o.A)(t.href)?"\ud83d\udcc4\ufe0f":"\ud83d\udd17",n=(0,a.cC)(t.docId??void 0);return(0,h.jsx)(p,{href:t.href,icon:r,title:t.label,description:t.description??n?.description})}function f(e){let{item:t}=e;switch(t.type){case"link":return(0,h.jsx)(x,{item:t});case"category":return(0,h.jsx)(m,{item:t});default:throw new Error(`unknown item type ${JSON.stringify(t)}`)}}function j(e){let{className:t}=e;const r=(0,a.$S)();return(0,h.jsx)(g,{items:r.items,className:t})}function g(e){const{items:t,className:r}=e;if(!t)return(0,h.jsx)(j,{...e});const c=(0,a.d1)(t);return(0,h.jsx)("section",{className:(0,n.A)("row",r),children:c.map(((e,t)=>(0,h.jsx)("article",{className:"col col--6 margin-bottom--lg",children:(0,h.jsx)(f,{item:e})},t)))})}},5846:(e,t,r)=>{r.d(t,{W:()=>l});var n=r(6540),a=r(4586);const c=["zero","one","two","few","many","other"];function s(e){return c.filter((t=>e.includes(t)))}const o={locale:"en",pluralForms:s(["one","other"]),select:e=>1===e?"one":"other"};function i(){const{i18n:{currentLocale:e}}=(0,a.A)();return(0,n.useMemo)((()=>{try{return function(e){const t=new Intl.PluralRules(e);return{locale:e,pluralForms:s(t.resolvedOptions().pluralCategories),select:e=>t.select(e)}}(e)}catch(t){return console.error(`Failed to use Intl.PluralRules for locale "${e}".\nDocusaurus will fallback to the default (English) implementation.\nError: ${t.message}\n`),o}}),[e])}function l(){const e=i();return{selectMessage:(t,r)=>function(e,t,r){const n=e.split("|");if(1===n.length)return n[0];n.length>r.pluralForms.length&&console.error(`For locale=${r.locale}, a maximum of ${r.pluralForms.length} plural forms are expected (${r.pluralForms.join(",")}), but the message contains ${n.length}: ${e}`);const a=r.select(t),c=r.pluralForms.indexOf(a);return n[Math.min(c,n.length-1)]}(r,t,e)}}},8453:(e,t,r)=>{r.d(t,{R:()=>s,x:()=>o});var n=r(6540);const a={},c=n.createContext(a);function s(e){const t=n.useContext(c);return n.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function o(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(a):e.components||a:s(e.components),n.createElement(c.Provider,{value:t},e.children)}}}]);