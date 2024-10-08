"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[6154],{2235:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>s,default:()=>u,frontMatter:()=>i,metadata:()=>r,toc:()=>d});var c=n(4848),a=n(8453),o=n(3514);const i={title:"Catalog Connectors",sidebar_label:"Catalog Connectors",description:"",sidebar_position:5,pagination_prev:null,pagination_next:null},s=void 0,r={id:"components/catalogs/index",title:"Catalog Connectors",description:"",source:"@site/docs/components/catalogs/index.md",sourceDirName:"components/catalogs",slug:"/components/catalogs/",permalink:"/components/catalogs/",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/components/catalogs/index.md",tags:[],version:"current",sidebarPosition:5,frontMatter:{title:"Catalog Connectors",sidebar_label:"Catalog Connectors",description:"",sidebar_position:5,pagination_prev:null,pagination_next:null},sidebar:"docsSidebar"},l={},d=[{value:"Catalog Connector Docs",id:"catalog-connector-docs",level:2},{value:"<code>include</code>",id:"include",level:3}];function h(e){const t={code:"code",h2:"h2",h3:"h3",p:"p",pre:"pre",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,a.R)(),...e.components};return(0,c.jsxs)(c.Fragment,{children:[(0,c.jsxs)(t.p,{children:["In Spice, datasets are organized hierarchically with catalogs, schemas, and tables. A catalog, at the top level, contains multiple schemas. Each schema, in turn, contains multiple tables where the actual data is stored. By default a catalog named ",(0,c.jsx)(t.code,{children:"spice"})," is created with all of the datasets defined in the ",(0,c.jsx)(t.code,{children:"datasets"})," section of the Spicepod."]}),"\n",(0,c.jsx)("img",{src:"/img/catalog-schema-table.png"}),"\n",(0,c.jsxs)(t.p,{children:["Creating schemas and tables within the ",(0,c.jsx)(t.code,{children:"spice"})," catalog is configured by the ",(0,c.jsx)(t.code,{children:"name"})," field in the dataset configuration. A name with a period (",(0,c.jsx)(t.code,{children:"."}),") will create schema, i.e. a dataset defined with ",(0,c.jsx)(t.code,{children:"name: foo.bar"})," would have a full path of ",(0,c.jsx)(t.code,{children:"spice.foo.bar"}),". If the name does not contain a period, the dataset will be created in the ",(0,c.jsx)(t.code,{children:"public"})," schema of the ",(0,c.jsx)(t.code,{children:"spice"})," catalog. For example, a dataset defined with ",(0,c.jsx)(t.code,{children:"name: foo"})," would have a full path of ",(0,c.jsx)(t.code,{children:"spice.public.foo"}),". Attempting to create a dataset with a name that contains a catalog name will result in an error. Adding catalogs to Spice is done via Catalog Connectors."]}),"\n",(0,c.jsx)(t.p,{children:"Catalog Connectors connect to external catalog providers and make their tables available for federated SQL query in Spice. Configuring accelerations for tables in external catalogs is not supported. The schema hierarchy of the external catalog is preserved in Spice."}),"\n",(0,c.jsx)(t.p,{children:"Currently supported Catalog Connectors include:"}),"\n",(0,c.jsxs)(t.table,{children:[(0,c.jsx)(t.thead,{children:(0,c.jsxs)(t.tr,{children:[(0,c.jsx)(t.th,{children:"Name"}),(0,c.jsx)(t.th,{children:"Description"}),(0,c.jsx)(t.th,{children:"Status"}),(0,c.jsx)(t.th,{children:"Protocol/Format"})]})}),(0,c.jsxs)(t.tbody,{children:[(0,c.jsxs)(t.tr,{children:[(0,c.jsx)(t.td,{children:(0,c.jsx)(t.code,{children:"databricks"})}),(0,c.jsx)(t.td,{children:"Databricks"}),(0,c.jsx)(t.td,{children:"Alpha"}),(0,c.jsxs)(t.td,{children:["Spark Connect ",(0,c.jsx)("br",{})," S3 / Delta Lake"]})]}),(0,c.jsxs)(t.tr,{children:[(0,c.jsx)(t.td,{children:(0,c.jsx)(t.code,{children:"unity_catalog"})}),(0,c.jsx)(t.td,{children:"Unity Catalog"}),(0,c.jsx)(t.td,{children:"Alpha"}),(0,c.jsx)(t.td,{children:"Delta Lake"})]}),(0,c.jsxs)(t.tr,{children:[(0,c.jsx)(t.td,{children:(0,c.jsx)(t.code,{children:"spice.ai"})}),(0,c.jsx)(t.td,{children:"Spice.ai Cloud Platform"}),(0,c.jsx)(t.td,{children:"Alpha"}),(0,c.jsx)(t.td,{children:"Arrow Flight"})]})]})]}),"\n",(0,c.jsx)(t.h2,{id:"catalog-connector-docs",children:"Catalog Connector Docs"}),"\n",(0,c.jsxs)(t.p,{children:["Catalog are configured using a Catalog Connector in the ",(0,c.jsx)(t.code,{children:"catalogs"})," section of the Spicepod. See the specific Catalog Connector documentation for configuration details."]}),"\n",(0,c.jsx)(t.h3,{id:"include",children:(0,c.jsx)(t.code,{children:"include"})}),"\n",(0,c.jsxs)(t.p,{children:["Use the ",(0,c.jsx)(t.code,{children:"include"})," field to specify which tables to include from the catalog. The ",(0,c.jsx)(t.code,{children:"include"})," field supports glob patterns to match multiple tables. For example, ",(0,c.jsx)(t.code,{children:"*.my_table_name"})," would include all tables with the name ",(0,c.jsx)(t.code,{children:"my_table_name"})," in the catalog from any schema. Multiple ",(0,c.jsx)(t.code,{children:"include"})," patterns are OR'ed together and can be specified to include multiple tables."]}),"\n",(0,c.jsx)(t.p,{children:"Example:"}),"\n",(0,c.jsx)(t.pre,{children:(0,c.jsx)(t.code,{className:"language-yaml",children:'catalogs:\n  - from: spice.ai\n    name: spiceai\n    include:\n      - "tpch.*" # Include only the "tpch" tables.\n'})}),"\n","\n",(0,c.jsx)(o.A,{})]})}function u(e={}){const{wrapper:t}={...(0,a.R)(),...e.components};return t?(0,c.jsx)(t,{...e,children:(0,c.jsx)(h,{...e})}):h(e)}},3514:(e,t,n)=>{n.d(t,{A:()=>j});n(6540);var c=n(4164),a=n(6972),o=n(8774),i=n(5846),s=n(6654),r=n(1312),l=n(1107);const d={cardContainer:"cardContainer_fWXF",cardTitle:"cardTitle_rnsV",cardDescription:"cardDescription_PWke"};var h=n(4848);function u(e){let{href:t,children:n}=e;return(0,h.jsx)(o.A,{href:t,className:(0,c.A)("card padding--lg",d.cardContainer),children:n})}function p(e){let{href:t,icon:n,title:a,description:o}=e;return(0,h.jsxs)(u,{href:t,children:[(0,h.jsxs)(l.A,{as:"h2",className:(0,c.A)("text--truncate",d.cardTitle),title:a,children:[n," ",a]}),o&&(0,h.jsx)("p",{className:(0,c.A)("text--truncate",d.cardDescription),title:o,children:o})]})}function m(e){let{item:t}=e;const n=(0,a.Nr)(t),c=function(){const{selectMessage:e}=(0,i.W)();return t=>e(t,(0,r.T)({message:"1 item|{count} items",id:"theme.docs.DocCard.categoryDescription.plurals",description:"The default description for a category card in the generated index about how many items this category includes"},{count:t}))}();return n?(0,h.jsx)(p,{href:n,icon:"\ud83d\uddc3\ufe0f",title:t.label,description:t.description??c(t.items.length)}):null}function x(e){let{item:t}=e;const n=(0,s.A)(t.href)?"\ud83d\udcc4\ufe0f":"\ud83d\udd17",c=(0,a.cC)(t.docId??void 0);return(0,h.jsx)(p,{href:t.href,icon:n,title:t.label,description:t.description??c?.description})}function g(e){let{item:t}=e;switch(t.type){case"link":return(0,h.jsx)(x,{item:t});case"category":return(0,h.jsx)(m,{item:t});default:throw new Error(`unknown item type ${JSON.stringify(t)}`)}}function f(e){let{className:t}=e;const n=(0,a.$S)();return(0,h.jsx)(j,{items:n.items,className:t})}function j(e){const{items:t,className:n}=e;if(!t)return(0,h.jsx)(f,{...e});const o=(0,a.d1)(t);return(0,h.jsx)("section",{className:(0,c.A)("row",n),children:o.map(((e,t)=>(0,h.jsx)("article",{className:"col col--6 margin-bottom--lg",children:(0,h.jsx)(g,{item:e})},t)))})}},5846:(e,t,n)=>{n.d(t,{W:()=>l});var c=n(6540),a=n(4586);const o=["zero","one","two","few","many","other"];function i(e){return o.filter((t=>e.includes(t)))}const s={locale:"en",pluralForms:i(["one","other"]),select:e=>1===e?"one":"other"};function r(){const{i18n:{currentLocale:e}}=(0,a.A)();return(0,c.useMemo)((()=>{try{return function(e){const t=new Intl.PluralRules(e);return{locale:e,pluralForms:i(t.resolvedOptions().pluralCategories),select:e=>t.select(e)}}(e)}catch(t){return console.error(`Failed to use Intl.PluralRules for locale "${e}".\nDocusaurus will fallback to the default (English) implementation.\nError: ${t.message}\n`),s}}),[e])}function l(){const e=r();return{selectMessage:(t,n)=>function(e,t,n){const c=e.split("|");if(1===c.length)return c[0];c.length>n.pluralForms.length&&console.error(`For locale=${n.locale}, a maximum of ${n.pluralForms.length} plural forms are expected (${n.pluralForms.join(",")}), but the message contains ${c.length}: ${e}`);const a=n.select(t),o=n.pluralForms.indexOf(a);return c[Math.min(o,c.length-1)]}(n,t,e)}}},8453:(e,t,n)=>{n.d(t,{R:()=>i,x:()=>s});var c=n(6540);const a={},o=c.createContext(a);function i(e){const t=c.useContext(o);return c.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function s(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(a):e.components||a:i(e.components),c.createElement(o.Provider,{value:t},e.children)}}}]);