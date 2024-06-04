"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[1123],{8605:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>o,contentTitle:()=>l,default:()=>x,frontMatter:()=>d,metadata:()=>i,toc:()=>a});var r=n(4848),s=n(8453),c=n(3514);const d={title:"Data Connectors",sidebar_label:"Data Connectors",description:"",sidebar_position:6,pagination_prev:null,pagination_next:null},l=void 0,i={id:"data-connectors/index",title:"Data Connectors",description:"",source:"@site/docs/data-connectors/index.md",sourceDirName:"data-connectors",slug:"/data-connectors/",permalink:"/data-connectors/",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/data-connectors/index.md",tags:[],version:"current",sidebarPosition:6,frontMatter:{title:"Data Connectors",sidebar_label:"Data Connectors",description:"",sidebar_position:6,pagination_prev:null,pagination_next:null},sidebar:"docsSidebar"},o={},a=[{value:"Data Connector Docs",id:"data-connector-docs",level:2}];function h(e){const t={code:"code",h2:"h2",p:"p",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,s.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(t.p,{children:"Data Connectors provide connections to databases, data warehouses, and data lakes for federated SQL queries and data replication."}),"\n",(0,r.jsx)(t.p,{children:"Currently supported Data Connectors include:"}),"\n",(0,r.jsxs)(t.table,{children:[(0,r.jsx)(t.thead,{children:(0,r.jsxs)(t.tr,{children:[(0,r.jsx)(t.th,{children:"Name"}),(0,r.jsx)(t.th,{children:"Description"}),(0,r.jsx)(t.th,{children:"Status"}),(0,r.jsx)(t.th,{children:"Protocol/Format"}),(0,r.jsx)(t.th,{children:"Refresh Modes"}),(0,r.jsx)(t.th,{children:"Supports Inserts"})]})}),(0,r.jsxs)(t.tbody,{children:[(0,r.jsxs)(t.tr,{children:[(0,r.jsx)(t.td,{children:(0,r.jsx)(t.code,{children:"databricks"})}),(0,r.jsx)(t.td,{children:"Databricks"}),(0,r.jsx)(t.td,{children:"Alpha"}),(0,r.jsxs)(t.td,{children:["Spark Connect ",(0,r.jsx)("br",{})," S3 / Delta Lake"]}),(0,r.jsx)(t.td,{children:(0,r.jsx)(t.code,{children:"full"})}),(0,r.jsx)(t.td,{children:"\u274c"})]}),(0,r.jsxs)(t.tr,{children:[(0,r.jsx)(t.td,{children:(0,r.jsx)(t.code,{children:"postgres"})}),(0,r.jsx)(t.td,{children:"PostgreSQL"}),(0,r.jsx)(t.td,{children:"Alpha"}),(0,r.jsx)(t.td,{}),(0,r.jsx)(t.td,{children:(0,r.jsx)(t.code,{children:"full"})}),(0,r.jsx)(t.td,{children:"\u274c"})]}),(0,r.jsxs)(t.tr,{children:[(0,r.jsx)(t.td,{children:(0,r.jsx)(t.code,{children:"spiceai"})}),(0,r.jsx)(t.td,{children:"Spice.ai"}),(0,r.jsx)(t.td,{children:"Alpha"}),(0,r.jsx)(t.td,{children:"Arrow Flight"}),(0,r.jsxs)(t.td,{children:[(0,r.jsx)(t.code,{children:"append"}),", ",(0,r.jsx)(t.code,{children:"full"})]}),(0,r.jsx)(t.td,{children:"\u2705"})]}),(0,r.jsxs)(t.tr,{children:[(0,r.jsx)(t.td,{children:(0,r.jsx)(t.code,{children:"s3"})}),(0,r.jsx)(t.td,{children:"S3"}),(0,r.jsx)(t.td,{children:"Alpha"}),(0,r.jsx)(t.td,{children:"Parquet, CSV"}),(0,r.jsx)(t.td,{children:(0,r.jsx)(t.code,{children:"full"})}),(0,r.jsx)(t.td,{children:"\u274c"})]}),(0,r.jsxs)(t.tr,{children:[(0,r.jsx)(t.td,{children:(0,r.jsx)(t.code,{children:"dremio"})}),(0,r.jsx)(t.td,{children:"Dremio"}),(0,r.jsx)(t.td,{children:"Alpha"}),(0,r.jsx)(t.td,{children:"Arrow Flight SQL"}),(0,r.jsx)(t.td,{children:(0,r.jsx)(t.code,{children:"full"})}),(0,r.jsx)(t.td,{children:"\u274c"})]}),(0,r.jsxs)(t.tr,{children:[(0,r.jsx)(t.td,{children:(0,r.jsx)(t.code,{children:"flightsql"})}),(0,r.jsx)(t.td,{children:"FlightSQL"}),(0,r.jsx)(t.td,{children:"Alpha"}),(0,r.jsx)(t.td,{children:"Arrow Flight SQL"}),(0,r.jsx)(t.td,{children:(0,r.jsx)(t.code,{children:"full"})}),(0,r.jsx)(t.td,{children:"\u274c"})]}),(0,r.jsxs)(t.tr,{children:[(0,r.jsx)(t.td,{children:(0,r.jsx)(t.code,{children:"snowflake"})}),(0,r.jsx)(t.td,{children:"Snowflake"}),(0,r.jsx)(t.td,{children:"Alpha"}),(0,r.jsx)(t.td,{children:"Arrow"}),(0,r.jsx)(t.td,{children:(0,r.jsx)(t.code,{children:"full"})}),(0,r.jsx)(t.td,{children:"\u274c"})]}),(0,r.jsxs)(t.tr,{children:[(0,r.jsx)(t.td,{children:(0,r.jsx)(t.code,{children:"mysql"})}),(0,r.jsx)(t.td,{children:"MySQL"}),(0,r.jsx)(t.td,{children:"Alpha"}),(0,r.jsx)(t.td,{}),(0,r.jsx)(t.td,{children:(0,r.jsx)(t.code,{children:"full"})}),(0,r.jsx)(t.td,{children:"\u274c"})]}),(0,r.jsxs)(t.tr,{children:[(0,r.jsx)(t.td,{children:(0,r.jsx)(t.code,{children:"clickhouse"})}),(0,r.jsx)(t.td,{children:"Clickhouse"}),(0,r.jsx)(t.td,{children:"Alpha"}),(0,r.jsx)(t.td,{}),(0,r.jsx)(t.td,{children:(0,r.jsx)(t.code,{children:"full"})}),(0,r.jsx)(t.td,{children:"\u274c"})]}),(0,r.jsxs)(t.tr,{children:[(0,r.jsx)(t.td,{children:(0,r.jsx)(t.code,{children:"spark"})}),(0,r.jsx)(t.td,{children:"Spark"}),(0,r.jsx)(t.td,{children:"Alpha"}),(0,r.jsx)(t.td,{children:"Spark Connect"}),(0,r.jsx)(t.td,{children:(0,r.jsx)(t.code,{children:"full"})}),(0,r.jsx)(t.td,{children:"\u274c"})]}),(0,r.jsxs)(t.tr,{children:[(0,r.jsxs)(t.td,{children:[(0,r.jsx)(t.code,{children:"ftp"}),", ",(0,r.jsx)(t.code,{children:"sftp"})]}),(0,r.jsx)(t.td,{children:"FTP/SFTP"}),(0,r.jsx)(t.td,{children:"Alpha"}),(0,r.jsx)(t.td,{children:"Parquet, CSV"}),(0,r.jsx)(t.td,{children:(0,r.jsx)(t.code,{children:"full"})}),(0,r.jsx)(t.td,{children:"\u274c"})]}),(0,r.jsxs)(t.tr,{children:[(0,r.jsx)(t.td,{children:(0,r.jsx)(t.code,{children:"odbc"})}),(0,r.jsx)(t.td,{children:"ODBC"}),(0,r.jsx)(t.td,{children:"Alpha"}),(0,r.jsx)(t.td,{children:"ODBC"}),(0,r.jsx)(t.td,{children:(0,r.jsx)(t.code,{children:"full"})}),(0,r.jsx)(t.td,{children:"\u274c"})]})]})]}),"\n",(0,r.jsx)(t.h2,{id:"data-connector-docs",children:"Data Connector Docs"}),"\n","\n",(0,r.jsx)(c.A,{})]})}function x(e={}){const{wrapper:t}={...(0,s.R)(),...e.components};return t?(0,r.jsx)(t,{...e,children:(0,r.jsx)(h,{...e})}):h(e)}},3514:(e,t,n)=>{n.d(t,{A:()=>g});n(6540);var r=n(4164),s=n(4142),c=n(8774),d=n(5846),l=n(6654),i=n(1312),o=n(1107);const a={cardContainer:"cardContainer_fWXF",cardTitle:"cardTitle_rnsV",cardDescription:"cardDescription_PWke"};var h=n(4848);function x(e){let{href:t,children:n}=e;return(0,h.jsx)(c.A,{href:t,className:(0,r.A)("card padding--lg",a.cardContainer),children:n})}function j(e){let{href:t,icon:n,title:s,description:c}=e;return(0,h.jsxs)(x,{href:t,children:[(0,h.jsxs)(o.A,{as:"h2",className:(0,r.A)("text--truncate",a.cardTitle),title:s,children:[n," ",s]}),c&&(0,h.jsx)("p",{className:(0,r.A)("text--truncate",a.cardDescription),title:c,children:c})]})}function u(e){let{item:t}=e;const n=(0,s.Nr)(t),r=function(){const{selectMessage:e}=(0,d.W)();return t=>e(t,(0,i.T)({message:"1 item|{count} items",id:"theme.docs.DocCard.categoryDescription.plurals",description:"The default description for a category card in the generated index about how many items this category includes"},{count:t}))}();return n?(0,h.jsx)(j,{href:n,icon:"\ud83d\uddc3\ufe0f",title:t.label,description:t.description??r(t.items.length)}):null}function p(e){let{item:t}=e;const n=(0,l.A)(t.href)?"\ud83d\udcc4\ufe0f":"\ud83d\udd17",r=(0,s.cC)(t.docId??void 0);return(0,h.jsx)(j,{href:t.href,icon:n,title:t.label,description:t.description??r?.description})}function f(e){let{item:t}=e;switch(t.type){case"link":return(0,h.jsx)(p,{item:t});case"category":return(0,h.jsx)(u,{item:t});default:throw new Error(`unknown item type ${JSON.stringify(t)}`)}}function m(e){let{className:t}=e;const n=(0,s.$S)();return(0,h.jsx)(g,{items:n.items,className:t})}function g(e){const{items:t,className:n}=e;if(!t)return(0,h.jsx)(m,{...e});const c=(0,s.d1)(t);return(0,h.jsx)("section",{className:(0,r.A)("row",n),children:c.map(((e,t)=>(0,h.jsx)("article",{className:"col col--6 margin-bottom--lg",children:(0,h.jsx)(f,{item:e})},t)))})}},5846:(e,t,n)=>{n.d(t,{W:()=>o});var r=n(6540),s=n(4586);const c=["zero","one","two","few","many","other"];function d(e){return c.filter((t=>e.includes(t)))}const l={locale:"en",pluralForms:d(["one","other"]),select:e=>1===e?"one":"other"};function i(){const{i18n:{currentLocale:e}}=(0,s.A)();return(0,r.useMemo)((()=>{try{return function(e){const t=new Intl.PluralRules(e);return{locale:e,pluralForms:d(t.resolvedOptions().pluralCategories),select:e=>t.select(e)}}(e)}catch(t){return console.error(`Failed to use Intl.PluralRules for locale "${e}".\nDocusaurus will fallback to the default (English) implementation.\nError: ${t.message}\n`),l}}),[e])}function o(){const e=i();return{selectMessage:(t,n)=>function(e,t,n){const r=e.split("|");if(1===r.length)return r[0];r.length>n.pluralForms.length&&console.error(`For locale=${n.locale}, a maximum of ${n.pluralForms.length} plural forms are expected (${n.pluralForms.join(",")}), but the message contains ${r.length}: ${e}`);const s=n.select(t),c=n.pluralForms.indexOf(s);return r[Math.min(c,r.length-1)]}(n,t,e)}}},8453:(e,t,n)=>{n.d(t,{R:()=>d,x:()=>l});var r=n(6540);const s={},c=r.createContext(s);function d(e){const t=r.useContext(c);return r.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function l(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:d(e.components),r.createElement(c.Provider,{value:t},e.children)}}}]);