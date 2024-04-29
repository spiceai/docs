"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[2303],{7176:(e,n,c)=>{c.r(n),c.d(n,{assets:()=>r,contentTitle:()=>i,default:()=>h,frontMatter:()=>s,metadata:()=>a,toc:()=>l});var o=c(4848),t=c(8453);const s={title:"Clickhouse Data Connector",sidebar_label:"Clickhouse Data Connector",description:"Clickhouse Data Connector Documentation"},i=void 0,a={id:"data-connectors/clickhouse",title:"Clickhouse Data Connector",description:"Clickhouse Data Connector Documentation",source:"@site/docs/data-connectors/clickhouse.md",sourceDirName:"data-connectors",slug:"/data-connectors/clickhouse",permalink:"/data-connectors/clickhouse",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/data-connectors/clickhouse.md",tags:[],version:"current",frontMatter:{title:"Clickhouse Data Connector",sidebar_label:"Clickhouse Data Connector",description:"Clickhouse Data Connector Documentation"},sidebar:"docsSidebar",previous:{title:"Data Connectors",permalink:"/data-connectors/"},next:{title:"Databricks Data Connector",permalink:"/data-connectors/databricks"}},r={},l=[{value:"Federated SQL query",id:"federated-sql-query",level:2},{value:"Configuration",id:"configuration",level:2}];function d(e){const n={code:"code",h2:"h2",li:"li",p:"p",pre:"pre",ul:"ul",...(0,t.R)(),...e.components};return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(n.h2,{id:"federated-sql-query",children:"Federated SQL query"}),"\n",(0,o.jsxs)(n.p,{children:["To connect to any Clickhouse database as connector for federated SQL query, specify ",(0,o.jsx)(n.code,{children:"clickhouse"})," as the selector in the ",(0,o.jsx)(n.code,{children:"from"})," value for the dataset."]}),"\n",(0,o.jsx)(n.pre,{children:(0,o.jsx)(n.code,{className:"language-yaml",children:"datasets:\n  - from: clickhouse:path.to.my_dataset\n    name: my_dataset\n"})}),"\n",(0,o.jsx)(n.h2,{id:"configuration",children:"Configuration"}),"\n",(0,o.jsxs)(n.p,{children:["The Clickhouse data connector can be configured by providing the following ",(0,o.jsx)(n.code,{children:"params"}),":"]}),"\n",(0,o.jsxs)(n.ul,{children:["\n",(0,o.jsxs)(n.li,{children:[(0,o.jsx)(n.code,{children:"clickhouse_connection_string"}),": The connection string to use to connect to the Clickhouse server. This can be used instead of providing individual connection parameters."]}),"\n",(0,o.jsxs)(n.li,{children:[(0,o.jsx)(n.code,{children:"clickhouse_connection_string_key"}),": The secret key containing the connection string to use to connect to the Clickhouse server. This can be used instead of providing individual connection parameters."]}),"\n",(0,o.jsxs)(n.li,{children:[(0,o.jsx)(n.code,{children:"clickhouse_host"}),": The hostname of the Clickhouse server."]}),"\n",(0,o.jsxs)(n.li,{children:[(0,o.jsx)(n.code,{children:"clickhouse_tcp_port"}),": The port of the Clickhouse server."]}),"\n",(0,o.jsxs)(n.li,{children:[(0,o.jsx)(n.code,{children:"clickhouse_db"}),": The name of the database to connect to."]}),"\n",(0,o.jsxs)(n.li,{children:[(0,o.jsx)(n.code,{children:"clickhouse_user"}),": The username to connect with."]}),"\n",(0,o.jsxs)(n.li,{children:[(0,o.jsx)(n.code,{children:"clickhouse_pass_key"}),": The secret key containing the password to connect with."]}),"\n",(0,o.jsxs)(n.li,{children:[(0,o.jsx)(n.code,{children:"clickhouse_pass"}),": The raw password to connect with, ignored if ",(0,o.jsx)(n.code,{children:"clickhouse_pass_key"})," is provided."]}),"\n",(0,o.jsxs)(n.li,{children:[(0,o.jsx)(n.code,{children:"clickhouse_secure"}),": Optional parameter, specifies the SSL/TLS behavior for the connection, supported values:","\n",(0,o.jsxs)(n.ul,{children:["\n",(0,o.jsxs)(n.li,{children:[(0,o.jsx)(n.code,{children:"true"}),": (default) This mode requires an SSL connection. If a secure connection cannot be established, server will not connect."]}),"\n",(0,o.jsxs)(n.li,{children:[(0,o.jsx)(n.code,{children:"false"}),": This mode will not attempt to use an SSL connection, even if the server supports it."]}),"\n"]}),"\n"]}),"\n",(0,o.jsxs)(n.li,{children:[(0,o.jsx)(n.code,{children:"clickhouse_connection_timeout"}),": Optional parameter, specifies the connection timeout in milliseconds."]}),"\n"]}),"\n",(0,o.jsxs)(n.p,{children:["Configuration ",(0,o.jsx)(n.code,{children:"params"})," are provided either in the top level ",(0,o.jsx)(n.code,{children:"dataset"})," for a dataset source and federated SQL query."]}),"\n",(0,o.jsx)(n.pre,{children:(0,o.jsx)(n.code,{className:"language-yaml",children:"datasets:\n  - from: clickhouse:path.to.my_dataset\n    name: my_dataset\n    params:\n      clickhouse_host: localhost\n      clickhouse_tcp_port: 9000\n      clickhouse_db: my_database\n      clickhouse_user: my_user\n      clickhouse_pass_key: my_secret\n      clickhouse_connection_timeout: 10000\n      clickhouse_secure: true\n"})}),"\n",(0,o.jsx)(n.pre,{children:(0,o.jsx)(n.code,{className:"language-yaml",children:"datasets:\n  - from: clickhouse:path.to.my_dataset\n    name: my_dataset\n    params:\n      clickhouse_connection_string: tcp://my_user:mypassword@localhost:9000/my_database\n      clickhouse_connection_timeout: 10000\n      clickhouse_secure: true\n"})}),"\n",(0,o.jsx)(n.pre,{children:(0,o.jsx)(n.code,{className:"language-yaml",children:"datasets:\n  - from: clickhouse:path.to.my_dataset\n    name: my_dataset\n    params:\n      clickhouse_connection_string: tcp://my_user:mypassword@localhost:9000/my_database?connection_timeout=10000&secure=true\n"})})]})}function h(e={}){const{wrapper:n}={...(0,t.R)(),...e.components};return n?(0,o.jsx)(n,{...e,children:(0,o.jsx)(d,{...e})}):d(e)}},8453:(e,n,c)=>{c.d(n,{R:()=>i,x:()=>a});var o=c(6540);const t={},s=o.createContext(t);function i(e){const n=o.useContext(s);return o.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function a(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(t):e.components||t:i(e.components),o.createElement(s.Provider,{value:n},e.children)}}}]);