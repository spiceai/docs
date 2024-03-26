"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[3478],{1464:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>d,contentTitle:()=>a,default:()=>p,frontMatter:()=>r,metadata:()=>c,toc:()=>i});var s=n(4848),o=n(8453);const r={title:"PostgreSQL Data Connector",sidebar_label:"PostgreSQL Data Connector",description:"PostgreSQL Data Connector Documentation"},a=void 0,c={id:"data-connectors/postgres/index",title:"PostgreSQL Data Connector",description:"PostgreSQL Data Connector Documentation",source:"@site/docs/data-connectors/postgres/index.md",sourceDirName:"data-connectors/postgres",slug:"/data-connectors/postgres/",permalink:"/data-connectors/postgres/",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/data-connectors/postgres/index.md",tags:[],version:"current",frontMatter:{title:"PostgreSQL Data Connector",sidebar_label:"PostgreSQL Data Connector",description:"PostgreSQL Data Connector Documentation"},sidebar:"tutorialSidebar",previous:{title:"FlightSql Data Connector",permalink:"/data-connectors/flightsql"},next:{title:"S3 Data Connector",permalink:"/data-connectors/s3"}},d={},i=[{value:"Dataset Source/Federated SQL Query",id:"dataset-sourcefederated-sql-query",level:2},{value:"Configuration",id:"configuration",level:2}];function l(e){const t={code:"code",h2:"h2",li:"li",p:"p",pre:"pre",ul:"ul",...(0,o.R)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(t.h2,{id:"dataset-sourcefederated-sql-query",children:"Dataset Source/Federated SQL Query"}),"\n",(0,s.jsxs)(t.p,{children:["To use PostgreSQL as a dataset source or for federated SQL query, specify ",(0,s.jsx)(t.code,{children:"postgres"})," as the selector in the ",(0,s.jsx)(t.code,{children:"from"})," value for the dataset."]}),"\n",(0,s.jsx)(t.pre,{children:(0,s.jsx)(t.code,{className:"language-yaml",children:"datasets:\n  - from: postgres:path.to.my_dataset\n    name: my_dataset\n"})}),"\n",(0,s.jsx)(t.h2,{id:"configuration",children:"Configuration"}),"\n",(0,s.jsxs)(t.p,{children:["The connection to PostgreSQL can be configured by providing the following ",(0,s.jsx)(t.code,{children:"params"}),":"]}),"\n",(0,s.jsxs)(t.ul,{children:["\n",(0,s.jsxs)(t.li,{children:[(0,s.jsx)(t.code,{children:"pg_host"}),": The hostname of the PostgreSQL server."]}),"\n",(0,s.jsxs)(t.li,{children:[(0,s.jsx)(t.code,{children:"pg_port"}),": The port of the PostgreSQL server."]}),"\n",(0,s.jsxs)(t.li,{children:[(0,s.jsx)(t.code,{children:"pg_db"}),": The name of the database to connect to."]}),"\n",(0,s.jsxs)(t.li,{children:[(0,s.jsx)(t.code,{children:"pg_user"}),": The username to connect with."]}),"\n",(0,s.jsxs)(t.li,{children:[(0,s.jsx)(t.code,{children:"pg_pass_key"}),": The secret key containing the password to connect with."]}),"\n",(0,s.jsxs)(t.li,{children:[(0,s.jsx)(t.code,{children:"pg_pass"}),": The raw password to connect with, ignored if ",(0,s.jsx)(t.code,{children:"pg_pass_key"})," is provided."]}),"\n"]}),"\n",(0,s.jsxs)(t.p,{children:["Configuration ",(0,s.jsx)(t.code,{children:"params"})," are provided either in the top level ",(0,s.jsx)(t.code,{children:"dataset"})," for a dataset source and federated SQL query, or in the ",(0,s.jsx)(t.code,{children:"acceleration"})," section for a data store."]}),"\n",(0,s.jsx)(t.pre,{children:(0,s.jsx)(t.code,{className:"language-yaml",children:"datasets:\n  - from: postgres:path.to.my_dataset\n    name: my_dataset\n    params:\n      pg_host: localhost\n      pg_port: '5432'\n      pg_db: my_database\n      pg_user: my_user\n      pg_pass_key: my_secret\n"})}),"\n",(0,s.jsxs)(t.p,{children:["Additionally, an ",(0,s.jsx)(t.code,{children:"engine_secret"})," may be provided when configuring a PostgreSQL data store to allow for using a different secret store to specify the password for a dataset using PostgreSQL as both the data source and data store."]}),"\n",(0,s.jsx)(t.pre,{children:(0,s.jsx)(t.code,{className:"language-yaml",children:"datasets:\n  - from: spiceai:path.to.my_dataset\n    name: my_dataset\n    params:\n      pg_host: localhost\n      pg_port: '5432'\n      pg_db: data_store\n      pg_user: my_user\n      pg_pass_key: my_secret\n    acceleration:\n      engine: postgres\n      engine_secret: pg_backend\n      params:\n        pg_host: localhost\n        pg_port: '5433'\n        pg_db: data_store\n        pg_user: my_user\n        pg_pass_key: my_secret\n"})})]})}function p(e={}){const{wrapper:t}={...(0,o.R)(),...e.components};return t?(0,s.jsx)(t,{...e,children:(0,s.jsx)(l,{...e})}):l(e)}},8453:(e,t,n)=>{n.d(t,{R:()=>a,x:()=>c});var s=n(6540);const o={},r=s.createContext(o);function a(e){const t=s.useContext(r);return s.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function c(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(o):e.components||o:a(e.components),s.createElement(r.Provider,{value:t},e.children)}}}]);