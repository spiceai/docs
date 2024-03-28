"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[8867],{2412:(e,t,s)=>{s.r(t),s.d(t,{assets:()=>i,contentTitle:()=>o,default:()=>p,frontMatter:()=>r,metadata:()=>c,toc:()=>d});var a=s(4848),n=s(8453);const r={type:"docs",title:"PostgreSQL Data Accelerator",sidebar_label:"PostgreSQL Data Accelerator",description:"PostgreSQL Data Accelerator Documentation"},o=void 0,c={id:"data-accelerators/postgres/index",title:"PostgreSQL Data Accelerator",description:"PostgreSQL Data Accelerator Documentation",source:"@site/docs/data-accelerators/postgres/index.md",sourceDirName:"data-accelerators/postgres",slug:"/data-accelerators/postgres/",permalink:"/data-accelerators/postgres/",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/data-accelerators/postgres/index.md",tags:[],version:"current",frontMatter:{type:"docs",title:"PostgreSQL Data Accelerator",sidebar_label:"PostgreSQL Data Accelerator",description:"PostgreSQL Data Accelerator Documentation"},sidebar:"tutorialSidebar",previous:{title:"DuckDB Data Accelerator",permalink:"/data-accelerators/duckdb"},next:{title:"SQLite Data Accelerator",permalink:"/data-accelerators/sqlite"}},i={},d=[{value:"Configuration",id:"configuration",level:2}];function l(e){const t={code:"code",h2:"h2",li:"li",p:"p",pre:"pre",ul:"ul",...(0,n.R)(),...e.components};return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsxs)(t.p,{children:["To use PostgreSQL as Data Accelerator, specify ",(0,a.jsx)(t.code,{children:"postgres"})," as the ",(0,a.jsx)(t.code,{children:"engine"})," for acceleration."]}),"\n",(0,a.jsx)(t.pre,{children:(0,a.jsx)(t.code,{className:"language-yaml",children:"datasets:\n  - from: spiceai:path.to.my_dataset\n    name: my_dataset\n    acceleration:\n      engine: postgres\n"})}),"\n",(0,a.jsx)(t.h2,{id:"configuration",children:"Configuration"}),"\n",(0,a.jsxs)(t.p,{children:["The connection to PostgreSQL can be configured by providing the following ",(0,a.jsx)(t.code,{children:"params"}),":"]}),"\n",(0,a.jsxs)(t.ul,{children:["\n",(0,a.jsxs)(t.li,{children:[(0,a.jsx)(t.code,{children:"pg_host"}),": The hostname of the PostgreSQL server."]}),"\n",(0,a.jsxs)(t.li,{children:[(0,a.jsx)(t.code,{children:"pg_port"}),": The port of the PostgreSQL server."]}),"\n",(0,a.jsxs)(t.li,{children:[(0,a.jsx)(t.code,{children:"pg_db"}),": The name of the database to connect to."]}),"\n",(0,a.jsxs)(t.li,{children:[(0,a.jsx)(t.code,{children:"pg_user"}),": The username to connect with."]}),"\n",(0,a.jsxs)(t.li,{children:[(0,a.jsx)(t.code,{children:"pg_pass_key"}),": The secret key containing the password to connect with."]}),"\n",(0,a.jsxs)(t.li,{children:[(0,a.jsx)(t.code,{children:"pg_pass"}),": The plain-text password to connect with, ignored if ",(0,a.jsx)(t.code,{children:"pg_pass_key"})," is provided."]}),"\n"]}),"\n",(0,a.jsxs)(t.p,{children:["Configuration ",(0,a.jsx)(t.code,{children:"params"})," are provided either in the ",(0,a.jsx)(t.code,{children:"acceleration"})," section of a dataset."]}),"\n",(0,a.jsx)(t.pre,{children:(0,a.jsx)(t.code,{className:"language-yaml",children:"datasets:\n  - from: spiceai:path.to.my_dataset\n    name: my_dataset\n    acceleration:\n      engine: postgres\n      params:\n        pg_host: localhost\n        pg_port: 5432\n        pg_db: my_database\n        pg_user: my_user\n        pg_pass_key: my_secret\n"})}),"\n",(0,a.jsxs)(t.p,{children:["Additionally, an ",(0,a.jsx)(t.code,{children:"engine_secret"})," may be provided when configuring a PostgreSQL data store to allow for using a different secret store to specify the password for a dataset using PostgreSQL as both the data source and data store."]}),"\n",(0,a.jsx)(t.pre,{children:(0,a.jsx)(t.code,{className:"language-yaml",children:"datasets:\n  - from: spiceai:path.to.my_dataset\n    name: my_dataset\n    params:\n      pg_host: localhost\n      pg_port: 5432\n      pg_db: data_store\n      pg_user: my_user\n      pg_pass_key: my_secret\n    acceleration:\n      engine: postgres\n      engine_secret: pg_backend\n      params:\n        pg_host: localhost\n        pg_port: 5433\n        pg_db: data_store\n        pg_user: my_user\n        pg_pass_key: my_secret\n"})})]})}function p(e={}){const{wrapper:t}={...(0,n.R)(),...e.components};return t?(0,a.jsx)(t,{...e,children:(0,a.jsx)(l,{...e})}):l(e)}},8453:(e,t,s)=>{s.d(t,{R:()=>o,x:()=>c});var a=s(6540);const n={},r=a.createContext(n);function o(e){const t=a.useContext(r);return a.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function c(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(n):e.components||n:o(e.components),a.createElement(r.Provider,{value:t},e.children)}}}]);