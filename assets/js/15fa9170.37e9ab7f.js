"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[5101],{3850:(e,n,s)=>{s.r(n),s.d(n,{assets:()=>a,contentTitle:()=>c,default:()=>h,frontMatter:()=>r,metadata:()=>i,toc:()=>l});var t=s(4848),o=s(8453);const r={title:"Microsoft SQL Server Data Connector",sidebar_label:"Microsoft SQL Server",description:"Microsoft SQL Server Data Connector"},c=void 0,i={id:"components/data-connectors/mssql",title:"Microsoft SQL Server Data Connector",description:"Microsoft SQL Server Data Connector",source:"@site/docs/components/data-connectors/mssql.md",sourceDirName:"components/data-connectors",slug:"/components/data-connectors/mssql",permalink:"/components/data-connectors/mssql",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/components/data-connectors/mssql.md",tags:[],version:"current",frontMatter:{title:"Microsoft SQL Server Data Connector",sidebar_label:"Microsoft SQL Server",description:"Microsoft SQL Server Data Connector"},sidebar:"docsSidebar",previous:{title:"HTTP(s) Data Connector",permalink:"/components/data-connectors/https"},next:{title:"MySQL Data Connector",permalink:"/components/data-connectors/mysql"}},a={},l=[{value:"Configuration",id:"configuration",level:2}];function d(e){const n={a:"a",admonition:"admonition",code:"code",h2:"h2",li:"li",ol:"ol",p:"p",pre:"pre",ul:"ul",...(0,o.R)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)(n.p,{children:["The Microsoft SQL Server Data Connector enables federated SQL queries on data stored in ",(0,t.jsx)(n.a,{href:"https://www.microsoft.com/en-us/sql-server",children:"Microsoft SQL Server"})," databases."]}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-yaml",children:"datasets:\n  - from: mssql:path.to.my_dataset\n    name: my_dataset\n    params:\n      mssql_connection_string: ${secrets:mssql_connection_string}\n"})}),"\n",(0,t.jsx)(n.h2,{id:"configuration",children:"Configuration"}),"\n",(0,t.jsxs)(n.p,{children:["The data connector supports the following ",(0,t.jsx)(n.code,{children:"params"}),". Use the ",(0,t.jsx)(n.a,{href:"/components/secret-stores/",children:"secret replacement syntax"})," to load the secret from a secret store, e.g. ",(0,t.jsx)(n.code,{children:"${secrets:my_mssql_conn_string}"}),"."]}),"\n",(0,t.jsxs)(n.ul,{children:["\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"mssql_connection_string"}),": The ADO connection string to use to connect to the server. This can be used instead of providing individual connection parameters."]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"mssql_host"}),": The hostname or IP address of the Microsoft SQL Server instance."]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"mssql_port"}),": (Optional) The port of the Microsoft SQL Server instance. Default value is 1433."]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"mssql_database"}),": (Optional) The name of the database to connect to. The default database will be used if not specified."]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"mssql_username"}),": The username for the SQL Server authentication."]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"mssql_password"}),": The password for the SQL Server authentication."]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"mssql_encrypt"}),": (Optional) Specifies whether encryption is required for the connection.","\n",(0,t.jsxs)(n.ul,{children:["\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"true"}),": (default) This mode requires an SSL connection. If a secure connection cannot be established, server will not connect."]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"false"}),": This mode will not attempt to use an SSL connection, even if the server supports it. Only the login procedure is encrypted"]}),"\n"]}),"\n"]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"mssql_trust_server_certificate"}),": Optional parameter to specify whether the server certificate should be trusted without validation when encryption is enabled","\n",(0,t.jsxs)(n.ul,{children:["\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"true"}),": The server certificate will not be validated and it is accepted as-is"]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"false"}),": (default) Server certificate will be validated against system's certificate storage"]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-yaml",children:"datasets:\n  - from: mssql:SalesLT.Customer\n    name: customer\n    params:\n      mssql_host: mssql-host.database.windows.net\n      mssql_database: my_catalog\n      mssql_username: my_user\n      mssql_password: ${secrets:mssql_pass}\n      mssql_encrypt: true\n      mssql_trust_server_certificate: true\n"})}),"\n",(0,t.jsx)(n.admonition,{title:"Limitations",type:"warning",children:(0,t.jsxs)(n.ol,{children:["\n",(0,t.jsx)(n.li,{children:"The connector supports SQL Server authentication (SQL Login and Password) only."}),"\n",(0,t.jsxs)(n.li,{children:["Spatial types (",(0,t.jsx)(n.code,{children:"geography"}),") are not supported, and columns with these types will be ignored."]}),"\n"]})})]})}function h(e={}){const{wrapper:n}={...(0,o.R)(),...e.components};return n?(0,t.jsx)(n,{...e,children:(0,t.jsx)(d,{...e})}):d(e)}},8453:(e,n,s)=>{s.d(n,{R:()=>c,x:()=>i});var t=s(6540);const o={},r=t.createContext(o);function c(e){const n=t.useContext(r);return t.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function i(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(o):e.components||o:c(e.components),t.createElement(r.Provider,{value:n},e.children)}}}]);