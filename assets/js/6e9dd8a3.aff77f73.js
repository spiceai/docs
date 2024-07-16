"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[191],{5615:(e,i,n)=>{n.r(i),n.d(i,{assets:()=>s,contentTitle:()=>o,default:()=>p,frontMatter:()=>a,metadata:()=>l,toc:()=>d});var t=n(4848),c=n(8453);const a={title:"Spice.ai Catalog Connector",sidebar_label:"Spice.ai",description:"Connect to the Spice.ai built-in catalog.",sidebar_position:3,pagination_prev:null,pagination_next:null},o=void 0,l={id:"components/catalogs/spiceai",title:"Spice.ai Catalog Connector",description:"Connect to the Spice.ai built-in catalog.",source:"@site/docs/components/catalogs/spiceai.md",sourceDirName:"components/catalogs",slug:"/components/catalogs/spiceai",permalink:"/components/catalogs/spiceai",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/components/catalogs/spiceai.md",tags:[],version:"current",sidebarPosition:3,frontMatter:{title:"Spice.ai Catalog Connector",sidebar_label:"Spice.ai",description:"Connect to the Spice.ai built-in catalog.",sidebar_position:3,pagination_prev:null,pagination_next:null},sidebar:"docsSidebar"},s={},d=[{value:"Configuration",id:"configuration",level:2},{value:"<code>from</code>",id:"from",level:2},{value:"<code>name</code>",id:"name",level:2},{value:"<code>include</code>",id:"include",level:2}];function r(e){const i={a:"a",code:"code",h2:"h2",p:"p",pre:"pre",...(0,c.R)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)(i.p,{children:["Query all of the datasets provided by the ",(0,t.jsx)(i.a,{href:"https://spice.ai",children:"Spice.ai Cloud Platform"}),"."]}),"\n",(0,t.jsx)(i.h2,{id:"configuration",children:"Configuration"}),"\n",(0,t.jsxs)(i.p,{children:["Create a ",(0,t.jsx)(i.a,{href:"https://spice.ai",children:"Spice.ai Cloud Platform"})," account and login with the CLI using ",(0,t.jsx)(i.code,{children:"spice login"}),"."]}),"\n",(0,t.jsx)(i.p,{children:"Example:"}),"\n",(0,t.jsx)(i.pre,{children:(0,t.jsx)(i.code,{className:"language-yaml",children:'catalogs:\n  - from: spice.ai\n    name: spicey # tables from the Spice.ai platform will be available in the "spicey" schema in Spice\n    include:\n      - "tpch.*" # include only the tables from the "tpch" schema\n'})}),"\n",(0,t.jsx)(i.h2,{id:"from",children:(0,t.jsx)(i.code,{children:"from"})}),"\n",(0,t.jsxs)(i.p,{children:["The ",(0,t.jsx)(i.code,{children:"from"})," field is used to specify the catalog provider. For the Spice.ai catalog connector, use ",(0,t.jsx)(i.code,{children:"spiceai"}),"."]}),"\n",(0,t.jsx)(i.h2,{id:"name",children:(0,t.jsx)(i.code,{children:"name"})}),"\n",(0,t.jsxs)(i.p,{children:["The ",(0,t.jsx)(i.code,{children:"name"})," field is used to specify the name of the catalog in Spice. Tables from the Spice.ai built-in catalog will be available in the schema with this name in Spice."]}),"\n",(0,t.jsx)(i.h2,{id:"include",children:(0,t.jsx)(i.code,{children:"include"})}),"\n",(0,t.jsxs)(i.p,{children:["Use the ",(0,t.jsx)(i.code,{children:"include"})," field to specify which tables to include from the catalog. The ",(0,t.jsx)(i.code,{children:"include"})," field supports glob patterns to match multiple tables. For example, ",(0,t.jsx)(i.code,{children:"*.my_table_name"})," would include all tables with the name ",(0,t.jsx)(i.code,{children:"my_table_name"})," in the catalog from any schema. Multiple ",(0,t.jsx)(i.code,{children:"include"})," patterns are OR'ed together and can be specified to include multiple tables."]})]})}function p(e={}){const{wrapper:i}={...(0,c.R)(),...e.components};return i?(0,t.jsx)(i,{...e,children:(0,t.jsx)(r,{...e})}):r(e)}},8453:(e,i,n)=>{n.d(i,{R:()=>o,x:()=>l});var t=n(6540);const c={},a=t.createContext(c);function o(e){const i=t.useContext(a);return t.useMemo((function(){return"function"==typeof e?e(i):{...i,...e}}),[i,e])}function l(e){let i;return i=e.disableParentContext?"function"==typeof e.components?e.components(c):e.components||c:o(e.components),t.createElement(a.Provider,{value:i},e.children)}}}]);