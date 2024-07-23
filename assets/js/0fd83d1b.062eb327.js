"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[2841],{328:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>d,contentTitle:()=>c,default:()=>h,frontMatter:()=>o,metadata:()=>r,toc:()=>a});var i=t(4848),s=t(8453);const o={title:"ODBC Data Connector",sidebar_label:"ODBC Data Connector",description:"ODBC Data Connector Documentation"},c=void 0,r={id:"components/data-connectors/odbc",title:"ODBC Data Connector",description:"ODBC Data Connector Documentation",source:"@site/docs/components/data-connectors/odbc.md",sourceDirName:"components/data-connectors",slug:"/components/data-connectors/odbc",permalink:"/components/data-connectors/odbc",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/components/data-connectors/odbc.md",tags:[],version:"current",frontMatter:{title:"ODBC Data Connector",sidebar_label:"ODBC Data Connector",description:"ODBC Data Connector Documentation"},sidebar:"docsSidebar",previous:{title:"MySQL Data Connector",permalink:"/components/data-connectors/mysql"},next:{title:"PostgreSQL Data Connector",permalink:"/components/data-connectors/postgres/"}},d={},a=[{value:"Federated SQL query",id:"federated-sql-query",level:2},{value:"Configuration",id:"configuration",level:2},{value:"Selecting SQL Dialect",id:"selecting-sql-dialect",level:3},{value:"Baking an image with ODBC Support",id:"baking-an-image-with-odbc-support",level:2},{value:"<code>test.db</code>",id:"testdb",level:3},{value:"<code>spicepod.yaml</code>",id:"spicepodyaml",level:3}];function l(e){const n={a:"a",admonition:"admonition",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,s.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(n.h2,{id:"federated-sql-query",children:"Federated SQL query"}),"\n",(0,i.jsxs)(n.p,{children:["To connect to any ODBC database for federated SQL queries, specify ",(0,i.jsx)(n.code,{children:"odbc"})," as the selector in the ",(0,i.jsx)(n.code,{children:"from"})," value for the dataset. The ",(0,i.jsx)(n.code,{children:"odbc_connection_string"})," parameter is required. Spice must be built with the ",(0,i.jsx)(n.code,{children:"odbc"})," feature, and the host/container must have a ",(0,i.jsx)(n.a,{href:"https://www.unixodbc.org/odbcinst.html",children:"valid ODBC configuration"}),"."]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-yaml",children:"datasets:\n  - from: odbc:path.to.my_dataset\n    name: my_dataset\n    params:\n      odbc_connection_string: Driver={Foo Driver};Host=db.foo.net;Param=Value\n"})}),"\n",(0,i.jsx)(n.admonition,{type:"info",children:(0,i.jsxs)(n.p,{children:["For the best ",(0,i.jsx)(n.code,{children:"JOIN"})," performance, ensure all ODBC datasets from the same database are configured with the exact same ",(0,i.jsx)(n.code,{children:"odbc_connection_string"})," in Spice."]})}),"\n",(0,i.jsx)(n.h2,{id:"configuration",children:"Configuration"}),"\n",(0,i.jsxs)(n.p,{children:["In addition to the connection string, the following ",(0,i.jsx)(n.a,{href:"https://docs.rs/arrow-odbc/latest/arrow_odbc/struct.OdbcReaderBuilder.html",children:"arrow_odbc builder parameters"})," are exposed as params:"]}),"\n",(0,i.jsxs)(n.table,{children:[(0,i.jsx)(n.thead,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.th,{children:"Parameter"}),(0,i.jsx)(n.th,{children:"Type"}),(0,i.jsx)(n.th,{children:"Description"}),(0,i.jsx)(n.th,{children:"Default"})]})}),(0,i.jsxs)(n.tbody,{children:[(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:"sql_dialect"}),(0,i.jsx)(n.td,{children:"string"}),(0,i.jsxs)(n.td,{children:["Override what SQL dialect is used for the ODBC connection. Supports ",(0,i.jsx)(n.code,{children:"postgresql"}),", ",(0,i.jsx)(n.code,{children:"mysql"}),", ",(0,i.jsx)(n.code,{children:"sqlite"})," or ",(0,i.jsx)(n.code,{children:"databricks"})," values."]}),(0,i.jsx)(n.td,{children:"Unset (auto-detected)"})]}),(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:"odbc_max_bytes_per_batch"}),(0,i.jsx)(n.td,{children:"number (bytes)"}),(0,i.jsx)(n.td,{children:"Upper allocation limit for transit buffer."}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"512_000_000"})})]}),(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:"odbc_max_num_rows_per_batch"}),(0,i.jsx)(n.td,{children:"number (rows)"}),(0,i.jsx)(n.td,{children:"Upper limit for number of rows fetched for one batch."}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"65536"})})]}),(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:"odbc_max_text_size"}),(0,i.jsx)(n.td,{children:"number (bytes)"}),(0,i.jsx)(n.td,{children:"Upper limit for value buffers bound to columns with text values."}),(0,i.jsx)(n.td,{children:"Unset (allocates driver-reported max column size)"})]}),(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:"odbc_max_binary_size"}),(0,i.jsx)(n.td,{children:"number (bytes)"}),(0,i.jsx)(n.td,{children:"Upper limit for value buffers bound to columns with binary values."}),(0,i.jsx)(n.td,{children:"Unset (allocates driver-reported max column size)"})]})]})]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-yaml",children:"datasets:\n  - from: odbc:path.to.my_dataset\n    name: my_dataset\n    params:\n      odbc_connection_string: Driver={Foo Driver};Host=db.foo.net;Param=Value\n"})}),"\n",(0,i.jsx)(n.h3,{id:"selecting-sql-dialect",children:"Selecting SQL Dialect"}),"\n",(0,i.jsxs)(n.p,{children:["The default SQL dialect may not be supported by every ODBC connection. The ",(0,i.jsx)(n.code,{children:"sql_dialect"})," parameter allows overriding the selected SQL dialect for a specified connection."]}),"\n",(0,i.jsxs)(n.p,{children:["The runtime will attempt to detect the dialect to use for a connection based on the contents of ",(0,i.jsx)(n.code,{children:"Driver="})," in the ",(0,i.jsx)(n.code,{children:"odbc_connection_string"}),". The runtime will usually detect the correct SQL dialect for the following connection types:"]}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:"PostgreSQL"}),"\n",(0,i.jsx)(n.li,{children:"MySQL"}),"\n",(0,i.jsx)(n.li,{children:"SQLite"}),"\n",(0,i.jsx)(n.li,{children:"Databricks"}),"\n"]}),"\n",(0,i.jsxs)(n.p,{children:["These connection types are also the supported values for overriding dialect in ",(0,i.jsx)(n.code,{children:"sql_dialect"}),", in lowercase format: ",(0,i.jsx)(n.code,{children:"postgresql"}),", ",(0,i.jsx)(n.code,{children:"mysql"}),", ",(0,i.jsx)(n.code,{children:"sqlite"}),", ",(0,i.jsx)(n.code,{children:"databricks"}),". For example, overriding the dialect for your connection to a ",(0,i.jsx)(n.code,{children:"postgresql"})," style dialect:"]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-yaml",children:"datasets:\n  - from: odbc:path.to.my_dataset\n    name: my_dataset\n    params:\n      sql_dialect: postgresql\n      odbc_connection_string: Driver={Foo Driver};Host=db.foo.net;Param=Value\n"})}),"\n",(0,i.jsx)(n.h2,{id:"baking-an-image-with-odbc-support",children:"Baking an image with ODBC Support"}),"\n",(0,i.jsx)(n.p,{children:"There are many dozens of ODBC adapters; this recipe covers making your own image and configuring it to work with Spice."}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-Dockerfile",children:"FROM spiceai/spiceai:latest\n\nRUN apt update \\\n    && apt install --yes libsqliteodbc --no-install-recommends \\\n    && rm -rf /var/lib/{apt,dpkg,cache,log}\n"})}),"\n",(0,i.jsx)(n.p,{children:"Build the container:"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-bash",children:"docker build -t spice-libsqliteodbc .\n"})}),"\n",(0,i.jsx)(n.p,{children:"Validate that the ODBC configuration was updated to reference the newly installed driver:"}),"\n",(0,i.jsx)(n.admonition,{title:"Note",type:"warning",children:(0,i.jsxs)(n.p,{children:["Since ",(0,i.jsx)(n.code,{children:"libsqliteodbc"})," is vendored by Debian, the package install hooks append the driver configuration to ",(0,i.jsx)(n.code,{children:"/etc/odbcinst.ini"}),". When using a custom driver (e.g. ",(0,i.jsx)(n.a,{href:"https://www.databricks.com/spark/odbc-drivers-download",children:"Databricks Simba"}),"), it is your responsibility to update ",(0,i.jsx)(n.code,{children:"/etc/odbcinst.ini"})," to point at the location of the newly installed driver."]})}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-bash",children:"$ docker run --entrypoint /bin/bash -it spice-libsqliteodbc\n\nroot@f8ceccc94d6a:/# odbcinst -j\nunixODBC 2.3.11\nDRIVERS............: /etc/odbcinst.ini\nSYSTEM DATA SOURCES: /etc/odbc.ini\nFILE DATA SOURCES..: /etc/ODBCDataSources\nUSER DATA SOURCES..: /root/.odbc.ini\nSQLULEN Size.......: 8\nSQLLEN Size........: 8\nSQLSETPOSIROW Size.: 8\n\nroot@f8ceccc94d6a:/# cat /etc/odbcinst.ini\n[SQLite]\nDescription=SQLite ODBC Driver\nDriver=libsqliteodbc.so\nSetup=libsqliteodbc.so\nUsageCount=1\n\n[SQLite3]\nDescription=SQLite3 ODBC Driver\nDriver=libsqlite3odbc.so\nSetup=libsqlite3odbc.so\nUsageCount=1\n"})}),"\n",(0,i.jsx)(n.h3,{id:"testdb",children:(0,i.jsx)(n.code,{children:"test.db"})}),"\n",(0,i.jsxs)(n.p,{children:["To fully test the image, make an example SQLite database (",(0,i.jsx)(n.code,{children:"test.db"}),") and spicepod on your host:"]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-bash",children:'$ sqlite3 test.db\nSQLite version 3.43.2 2023-10-10 13:08:14\nEnter ".help" for usage hints.\nsqlite> create table spice_test (name text not null);\nsqlite> insert into spice_test values ("Lala");\nsqlite> insert into spice_test values ("Hopper");\nsqlite> insert into spice_test values ("Linus");\n'})}),"\n",(0,i.jsx)(n.h3,{id:"spicepodyaml",children:(0,i.jsx)(n.code,{children:"spicepod.yaml"})}),"\n",(0,i.jsxs)(n.p,{children:["Make sure that the ",(0,i.jsx)(n.code,{children:"DRIVER"})," parameter matches the name of the driver section in ",(0,i.jsx)(n.code,{children:"odbcinst.ini"}),"."]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-yaml",children:"version: v1beta1\nkind: Spicepod\nname: sqlite\ndatasets:\n- from: odbc:spice_test\n  name: spice_test\n  mode: read\n  acceleration:\n    enabled: false\n  params:\n    odbc_connection_string: DRIVER={SQLite3};SERVER=localhost;DATABASE=test.db;Trusted_connection=yes\n"})}),"\n",(0,i.jsx)(n.p,{children:"All together now:"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-bash",children:"$ docker run -p8090:8090 -p50051:50051 -v $(pwd)/spicepod.yaml:/spicepod.yaml -v $(pwd)/test.db:/test.db -it spice-libsqliteodbc --http=0.0.0.0:8090 --flight=0.0.0.0:50051\n$ spice sql\n\nWelcome to the interactive Spice.ai SQL Query Utility! Type 'help' for help.\n\nshow tables; -- list available tables\nsql> show tables;\n+------------+\n| table_name |\n+------------+\n| spice_test |\n+------------+\n\nQuery took: 0.059305583 seconds. 1/1 rows displayed.\nsql> select * from spice_test;\n+--------+\n| name   |\n+--------+\n| Hopper |\n| Lala   |\n| Linus  |\n+--------+\n\nQuery took: 1.8504053329999999 seconds. 3/3 rows displayed.\n"})})]})}function h(e={}){const{wrapper:n}={...(0,s.R)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(l,{...e})}):l(e)}},8453:(e,n,t)=>{t.d(n,{R:()=>c,x:()=>r});var i=t(6540);const s={},o=i.createContext(s);function c(e){const n=i.useContext(o);return i.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function r(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:c(e.components),i.createElement(o.Provider,{value:n},e.children)}}}]);