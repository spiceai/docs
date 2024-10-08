"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[4005],{6048:(e,s,n)=>{n.r(s),n.d(s,{assets:()=>l,contentTitle:()=>c,default:()=>h,frontMatter:()=>d,metadata:()=>i,toc:()=>o});var t=n(4848),r=n(8453);const d={title:"MySQL Data Connector",sidebar_label:"MySQL Data Connector",description:"MySQL Data Connector Documentation"},c=void 0,i={id:"components/data-connectors/mysql",title:"MySQL Data Connector",description:"MySQL Data Connector Documentation",source:"@site/docs/components/data-connectors/mysql.md",sourceDirName:"components/data-connectors",slug:"/components/data-connectors/mysql",permalink:"/components/data-connectors/mysql",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/components/data-connectors/mysql.md",tags:[],version:"current",frontMatter:{title:"MySQL Data Connector",sidebar_label:"MySQL Data Connector",description:"MySQL Data Connector Documentation"},sidebar:"docsSidebar",previous:{title:"Microsoft SQL Server",permalink:"/components/data-connectors/mssql"},next:{title:"ODBC Data Connector",permalink:"/components/data-connectors/odbc"}},l={},o=[{value:"Federated SQL query",id:"federated-sql-query",level:2},{value:"Configuration",id:"configuration",level:2},{value:"Types",id:"types",level:2}];function a(e){const s={a:"a",admonition:"admonition",code:"code",h2:"h2",li:"li",p:"p",pre:"pre",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,r.R)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(s.h2,{id:"federated-sql-query",children:"Federated SQL query"}),"\n",(0,t.jsxs)(s.p,{children:["To connect to any MySQL database as connector for federated SQL query, specify ",(0,t.jsx)(s.code,{children:"mysql"})," as the selector in the ",(0,t.jsx)(s.code,{children:"from"})," value for the dataset."]}),"\n",(0,t.jsx)(s.pre,{children:(0,t.jsx)(s.code,{className:"language-yaml",children:"datasets:\n  - from: mysql:path.to.my_dataset\n    name: my_dataset\n    params:\n      mysql_host: localhost\n      mysql_tcp_port: 3306\n      mysql_db: my_database\n      mysql_user: my_user\n      mysql_pass: ${secrets:mysql_pass}\n"})}),"\n",(0,t.jsx)(s.h2,{id:"configuration",children:"Configuration"}),"\n",(0,t.jsxs)(s.p,{children:["The MySQL data connector can be configured by providing the following ",(0,t.jsx)(s.code,{children:"params"}),". Use the ",(0,t.jsx)(s.a,{href:"/components/secret-stores/",children:"secret replacement syntax"})," to load the secret from a secret store, e.g. ",(0,t.jsx)(s.code,{children:"${secrets:my_mysql_conn_string}"}),"."]}),"\n",(0,t.jsxs)(s.ul,{children:["\n",(0,t.jsxs)(s.li,{children:[(0,t.jsx)(s.code,{children:"mysql_connection_string"}),": The connection string to use to connect to the MySQL server. This can be used instead of providing individual connection parameters."]}),"\n",(0,t.jsxs)(s.li,{children:[(0,t.jsx)(s.code,{children:"mysql_host"}),": The hostname of the MySQL server."]}),"\n",(0,t.jsxs)(s.li,{children:[(0,t.jsx)(s.code,{children:"mysql_tcp_port"}),": The port of the MySQL server."]}),"\n",(0,t.jsxs)(s.li,{children:[(0,t.jsx)(s.code,{children:"mysql_db"}),": The name of the database to connect to."]}),"\n",(0,t.jsxs)(s.li,{children:[(0,t.jsx)(s.code,{children:"mysql_user"}),": The MySQL username."]}),"\n",(0,t.jsxs)(s.li,{children:[(0,t.jsx)(s.code,{children:"mysql_pass"}),": The password to connect with."]}),"\n",(0,t.jsxs)(s.li,{children:[(0,t.jsx)(s.code,{children:"mysql_sslmode"}),": Optional. Specifies the SSL/TLS behavior for the connection, supported values:","\n",(0,t.jsxs)(s.ul,{children:["\n",(0,t.jsxs)(s.li,{children:[(0,t.jsx)(s.code,{children:"required"}),": (default) This mode requires an SSL connection. If a secure connection cannot be established, server will not connect."]}),"\n",(0,t.jsxs)(s.li,{children:[(0,t.jsx)(s.code,{children:"preferred"}),": This mode will try to establish a secure SSL connection if possible, but will connect insecurely if the server does not support SSL."]}),"\n",(0,t.jsxs)(s.li,{children:[(0,t.jsx)(s.code,{children:"disabled"}),": This mode will not attempt to use an SSL connection, even if the server supports it."]}),"\n"]}),"\n"]}),"\n",(0,t.jsxs)(s.li,{children:[(0,t.jsx)(s.code,{children:"mysql_sslrootcert"}),": Optional parameter specifying the path to a custom PEM certificate that the connector will trust."]}),"\n"]}),"\n",(0,t.jsxs)(s.p,{children:["Configuration ",(0,t.jsx)(s.code,{children:"params"})," are provided either in the top level ",(0,t.jsx)(s.code,{children:"dataset"})," for a dataset source and federated SQL query."]}),"\n",(0,t.jsx)(s.pre,{children:(0,t.jsx)(s.code,{className:"language-yaml",children:"datasets:\n  - from: mysql:path.to.my_dataset\n    name: my_dataset\n    params:\n      mysql_host: localhost\n      mysql_tcp_port: 3306\n      mysql_db: my_database\n      mysql_user: my_user\n      mysql_pass: ${secrets:mysql_pass}\n"})}),"\n",(0,t.jsx)(s.pre,{children:(0,t.jsx)(s.code,{className:"language-yaml",children:"datasets:\n  - from: mysql:path.to.my_dataset\n    name: my_dataset\n    params:\n      mysql_host: localhost\n      mysql_tcp_port: 3306\n      mysql_db: my_database\n      mysql_user: my_user\n      mysql_pass: ${secrets:mysql_pass}\n      mysql_sslmode: preferred\n      mysql_sslrootcert: ./custom_cert.pem\n"})}),"\n",(0,t.jsx)(s.pre,{children:(0,t.jsx)(s.code,{className:"language-yaml",children:"datasets:\n  - from: mysql:path.to.my_dataset\n    name: my_dataset\n    params:\n      mysql_connection_string: mysql://${secrets:my_user}:${secrets:my_password}@localhost:3306/my_db\n"})}),"\n",(0,t.jsx)(s.h2,{id:"types",children:"Types"}),"\n",(0,t.jsx)(s.p,{children:"The table below shows the MySQL data types supported, along with the type mapping to Apache Arrow types in Spice."}),"\n",(0,t.jsxs)(s.table,{children:[(0,t.jsx)(s.thead,{children:(0,t.jsxs)(s.tr,{children:[(0,t.jsx)(s.th,{children:"MySQL Type"}),(0,t.jsx)(s.th,{children:"Arrow Type"})]})}),(0,t.jsxs)(s.tbody,{children:[(0,t.jsxs)(s.tr,{children:[(0,t.jsx)(s.td,{children:"TINYINT"}),(0,t.jsx)(s.td,{children:"Int8"})]}),(0,t.jsxs)(s.tr,{children:[(0,t.jsx)(s.td,{children:"SMALLINT"}),(0,t.jsx)(s.td,{children:"Int16"})]}),(0,t.jsxs)(s.tr,{children:[(0,t.jsx)(s.td,{children:"INT"}),(0,t.jsx)(s.td,{children:"Int32"})]}),(0,t.jsxs)(s.tr,{children:[(0,t.jsx)(s.td,{children:"MEDIUMINT"}),(0,t.jsx)(s.td,{children:"Int32"})]}),(0,t.jsxs)(s.tr,{children:[(0,t.jsx)(s.td,{children:"BIGINT"}),(0,t.jsx)(s.td,{children:"Int64"})]}),(0,t.jsxs)(s.tr,{children:[(0,t.jsx)(s.td,{children:"DECIMAL"}),(0,t.jsx)(s.td,{children:"Decimal128 / Decimal256"})]}),(0,t.jsxs)(s.tr,{children:[(0,t.jsx)(s.td,{children:"FLOAT"}),(0,t.jsx)(s.td,{children:"Float32"})]}),(0,t.jsxs)(s.tr,{children:[(0,t.jsx)(s.td,{children:"DOUBLE"}),(0,t.jsx)(s.td,{children:"Float64"})]}),(0,t.jsxs)(s.tr,{children:[(0,t.jsx)(s.td,{children:"DATETIME"}),(0,t.jsx)(s.td,{children:"Timestamp(Microsecond, None)"})]}),(0,t.jsxs)(s.tr,{children:[(0,t.jsx)(s.td,{children:"TIMESTAMP"}),(0,t.jsx)(s.td,{children:"Timestamp(Microsecond, None)"})]}),(0,t.jsxs)(s.tr,{children:[(0,t.jsx)(s.td,{children:"YEAR"}),(0,t.jsx)(s.td,{children:"Int16"})]}),(0,t.jsxs)(s.tr,{children:[(0,t.jsx)(s.td,{children:"TIME"}),(0,t.jsx)(s.td,{children:"Time64(Nanosecond)"})]}),(0,t.jsxs)(s.tr,{children:[(0,t.jsx)(s.td,{children:"DATE"}),(0,t.jsx)(s.td,{children:"Date32"})]}),(0,t.jsxs)(s.tr,{children:[(0,t.jsx)(s.td,{children:"CHAR"}),(0,t.jsx)(s.td,{children:"Utf8"})]}),(0,t.jsxs)(s.tr,{children:[(0,t.jsx)(s.td,{children:"BINARY"}),(0,t.jsx)(s.td,{children:"Binary"})]}),(0,t.jsxs)(s.tr,{children:[(0,t.jsx)(s.td,{children:"VARCHAR"}),(0,t.jsx)(s.td,{children:"Utf8"})]}),(0,t.jsxs)(s.tr,{children:[(0,t.jsx)(s.td,{children:"VARBINARY"}),(0,t.jsx)(s.td,{children:"Binary"})]}),(0,t.jsxs)(s.tr,{children:[(0,t.jsx)(s.td,{children:"TINYBLOB"}),(0,t.jsx)(s.td,{children:"Binary"})]}),(0,t.jsxs)(s.tr,{children:[(0,t.jsx)(s.td,{children:"TINYTEXT"}),(0,t.jsx)(s.td,{children:"Utf8"})]}),(0,t.jsxs)(s.tr,{children:[(0,t.jsx)(s.td,{children:"BLOB"}),(0,t.jsx)(s.td,{children:"Binary"})]}),(0,t.jsxs)(s.tr,{children:[(0,t.jsx)(s.td,{children:"TEXT"}),(0,t.jsx)(s.td,{children:"Utf8"})]}),(0,t.jsxs)(s.tr,{children:[(0,t.jsx)(s.td,{children:"MEDIUMBLOB"}),(0,t.jsx)(s.td,{children:"Binary"})]}),(0,t.jsxs)(s.tr,{children:[(0,t.jsx)(s.td,{children:"MEDIUMTEXT"}),(0,t.jsx)(s.td,{children:"Utf8"})]}),(0,t.jsxs)(s.tr,{children:[(0,t.jsx)(s.td,{children:"LONGBLOB"}),(0,t.jsx)(s.td,{children:"LargeBinary"})]}),(0,t.jsxs)(s.tr,{children:[(0,t.jsx)(s.td,{children:"LONGTEXT"}),(0,t.jsx)(s.td,{children:"LargeUtf8"})]}),(0,t.jsxs)(s.tr,{children:[(0,t.jsx)(s.td,{children:"SET"}),(0,t.jsx)(s.td,{children:"Utf8"})]}),(0,t.jsxs)(s.tr,{children:[(0,t.jsx)(s.td,{children:"ENUM"}),(0,t.jsx)(s.td,{children:"Dictionary(UInt16, Utf8)"})]}),(0,t.jsxs)(s.tr,{children:[(0,t.jsx)(s.td,{children:"BIT"}),(0,t.jsx)(s.td,{children:"UInt64"})]})]})]}),"\n",(0,t.jsx)(s.admonition,{type:"note",children:(0,t.jsxs)(s.ul,{children:["\n",(0,t.jsxs)(s.li,{children:["MySQL ",(0,t.jsx)(s.code,{children:"TIMESTAMP"})," value is the local time to the MySQL server timezone, the corresponding arrow ",(0,t.jsx)(s.code,{children:"Timestamp(Microsecond, None)"})," type has the same local time value as MySQL ",(0,t.jsx)(s.code,{children:"TIMESTAMP"})," value."]}),"\n"]})})]})}function h(e={}){const{wrapper:s}={...(0,r.R)(),...e.components};return s?(0,t.jsx)(s,{...e,children:(0,t.jsx)(a,{...e})}):a(e)}},8453:(e,s,n)=>{n.d(s,{R:()=>c,x:()=>i});var t=n(6540);const r={},d=t.createContext(r);function c(e){const s=t.useContext(d);return t.useMemo((function(){return"function"==typeof e?e(s):{...s,...e}}),[s,e])}function i(e){let s;return s=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:c(e.components),t.createElement(d.Provider,{value:s},e.children)}}}]);