"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[46],{787:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>i,contentTitle:()=>c,default:()=>h,frontMatter:()=>r,metadata:()=>a,toc:()=>d});var s=t(4848),o=t(8453);const r={title:"MySQL Data Connector",sidebar_label:"MySQL Data Connector",description:"MySQL Data Connector Documentation"},c=void 0,a={id:"data-connectors/mysql",title:"MySQL Data Connector",description:"MySQL Data Connector Documentation",source:"@site/docs/data-connectors/mysql.md",sourceDirName:"data-connectors",slug:"/data-connectors/mysql",permalink:"/data-connectors/mysql",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/data-connectors/mysql.md",tags:[],version:"current",frontMatter:{title:"MySQL Data Connector",sidebar_label:"MySQL Data Connector",description:"MySQL Data Connector Documentation"},sidebar:"docsSidebar",previous:{title:"HTTP(s) Data Connector",permalink:"/data-connectors/https"},next:{title:"ODBC Data Connector",permalink:"/data-connectors/odbc"}},i={},d=[{value:"Federated SQL query",id:"federated-sql-query",level:2},{value:"Configuration",id:"configuration",level:2}];function l(e){const n={code:"code",h2:"h2",li:"li",p:"p",pre:"pre",ul:"ul",...(0,o.R)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.h2,{id:"federated-sql-query",children:"Federated SQL query"}),"\n",(0,s.jsxs)(n.p,{children:["To connect to any MySQL database as connector for federated SQL query, specify ",(0,s.jsx)(n.code,{children:"mysql"})," as the selector in the ",(0,s.jsx)(n.code,{children:"from"})," value for the dataset."]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-yaml",children:"datasets:\n  - from: mysql:path.to.my_dataset\n    name: my_dataset\n"})}),"\n",(0,s.jsx)(n.h2,{id:"configuration",children:"Configuration"}),"\n",(0,s.jsxs)(n.p,{children:["The MySQL data connector can be configured by providing the following ",(0,s.jsx)(n.code,{children:"params"}),":"]}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"mysql_connection_string"}),": The connection string to use to connect to the MySQL server. This can be used instead of providing individual connection parameters."]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"mysql_connection_string_key"}),": The secret key containing the connection string to use to connect to the MySQL server. This can be used instead of providing individual connection parameters."]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"mysql_host"}),": The hostname of the MySQL server."]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"mysql_tcp_port"}),": The port of the MySQL server."]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"mysql_db"}),": The name of the database to connect to."]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"mysql_user_key"}),": The name of the secret key containing the MySQL username."]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"mysql_user"}),": The MySQL username.  Ignored if ",(0,s.jsx)(n.code,{children:"mysql_user_key"})," is provided."]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"mysql_pass_key"}),": The secret key containing the password to connect with."]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"mysql_pass"}),": The raw password to connect with, ignored if ",(0,s.jsx)(n.code,{children:"mysql_pass_key"})," is provided."]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"mysql_sslmode"}),": Optional parameter, specifies the SSL/TLS behavior for the connection, supported values:","\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"required"}),": (default) This mode requires an SSL connection. If a secure connection cannot be established, server will not connect."]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"preferred"}),": This mode will try to establish a secure SSL connection if possible, but will connect insecurely if the server does not support SSL."]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"disabled"}),": This mode will not attempt to use an SSL connection, even if the server supports it."]}),"\n"]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"mysql_sslrootcert"}),": Optional parameter specifying the path to a custom PEM certificate that the connector will trust."]}),"\n"]}),"\n",(0,s.jsxs)(n.p,{children:["Configuration ",(0,s.jsx)(n.code,{children:"params"})," are provided either in the top level ",(0,s.jsx)(n.code,{children:"dataset"})," for a dataset source and federated SQL query."]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-yaml",children:"datasets:\n  - from: mysql:path.to.my_dataset\n    name: my_dataset\n    params:\n      mysql_host: localhost\n      mysql_tcp_port: 3306\n      mysql_db: my_database\n      mysql_user: my_user\n      mysql_pass_key: my_secret\n"})}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-yaml",children:"datasets:\n  - from: mysql:path.to.my_dataset\n    name: my_dataset\n    params:\n      mysql_host: localhost\n      mysql_tcp_port: 3306\n      mysql_db: my_database\n      mysql_user: my_user\n      mysql_pass_key: my_secret\n      mysql_sslmode: preferred\n      mysql_sslrootcert: ./custom_cert.pem\n"})})]})}function h(e={}){const{wrapper:n}={...(0,o.R)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(l,{...e})}):l(e)}},8453:(e,n,t)=>{t.d(n,{R:()=>c,x:()=>a});var s=t(6540);const o={},r=s.createContext(o);function c(e){const n=s.useContext(r);return s.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function a(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(o):e.components||o:c(e.components),s.createElement(r.Provider,{value:n},e.children)}}}]);