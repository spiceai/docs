"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[753],{3570:(e,n,r)=>{r.r(n),r.d(n,{assets:()=>c,contentTitle:()=>i,default:()=>u,frontMatter:()=>a,metadata:()=>o,toc:()=>d});var s=r(4848),t=r(8453);const a={title:"Federated Queries",sidebar_label:"Federated Queries",description:"Learn how to use federated queries in Spice.",sidebar_position:2,pagination_prev:null,pagination_next:null},i=void 0,o={id:"features/federated-queries/index",title:"Federated Queries",description:"Learn how to use federated queries in Spice.",source:"@site/docs/features/federated-queries/index.md",sourceDirName:"features/federated-queries",slug:"/features/federated-queries/",permalink:"/features/federated-queries/",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/features/federated-queries/index.md",tags:[],version:"current",sidebarPosition:2,frontMatter:{title:"Federated Queries",sidebar_label:"Federated Queries",description:"Learn how to use federated queries in Spice.",sidebar_position:2,pagination_prev:null,pagination_next:null},sidebar:"docsSidebar"},c={},d=[{value:"Getting Started",id:"getting-started",level:3},{value:"Acceleration",id:"acceleration",level:3},{value:"Limitations",id:"limitations",level:3}];function l(e){const n={a:"a",code:"code",h3:"h3",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,t.R)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.p,{children:"Spice provides a powerful federated query feature that allows you to join and combine data from multiple data sources and perform complex queries. This feature enables you to leverage the full potential of your data by aggregating and analyzing information wherever it is stored."}),"\n",(0,s.jsxs)(n.p,{children:["Spice supports federated query across databases (PostgreSQL, MySQL, etc.), data warehouses (Databricks, Snowflake, BigQuery, etc.), and data lakes (S3, MinIO, etc.). See ",(0,s.jsx)(n.a,{href:"/data-connectors/",children:"Data Connectors"})," for the full list of supported sources."]}),"\n",(0,s.jsx)(n.h3,{id:"getting-started",children:"Getting Started"}),"\n",(0,s.jsx)(n.p,{children:"To get started with federated queries using Spice, follow these steps:"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"Step 1."})," Install Spice by following the ",(0,s.jsx)(n.a,{href:"/getting-started/",children:"installation instructions"}),"."]}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"Step 2."})," Clone the ",(0,s.jsx)(n.a,{href:"https://github.com/spiceai/quickstarts",children:"Spice Quickstarts repo"})," and navigate to the ",(0,s.jsx)(n.code,{children:"federation"})," directory."]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-bash",children:"git clone https://github.com/spiceai/quickstarts.git\ncd quickstarts/federation\n"})}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"Step 3."})," Start PostgreSQL with Docker Compose & login to the demo Dremio."]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-bash",children:"make\nspice login dremio -u demo -p demo1234\n"})}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"Step 4."})," Create a new Spice app called ",(0,s.jsx)(n.code,{children:"demo"}),"."]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-bash",children:'# Create Spice app "demo"\nspice init demo\n\n# Change to demo directory.\ncd demo\n'})}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"Step 5."})," Start the Spice runtime."]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-bash",children:"spice run\n"})}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"Step 6."})," Open a new terminal, navigate back to the ",(0,s.jsx)(n.code,{children:"demo"})," directory and add the ",(0,s.jsx)(n.code,{children:"spiceai/fed-demo"})," Spicepod."]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-bash",children:"# Change to demo directory.\ncd demo\n\nspice add spiceai/fed-demo\n"})}),"\n",(0,s.jsx)(n.p,{children:"Note in the Spice runtime output several datasets are loaded."}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"Step 7."})," Show available tables and query them, regardless of source."]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-bash",children:"# Start the Spice SQL REPL.\nspice sql\n"})}),"\n",(0,s.jsx)(n.p,{children:"Show the available tables:"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-sql",children:"show tables;\n"})}),"\n",(0,s.jsx)(n.p,{children:"Execute the queries:"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-sql",children:"-- Query S3 (Parquet)\nSELECT *\nFROM s3_source LIMIT 10\n\n-- Query S3 (Parquet) accelerated\nSELECT *\nFROM s3_source_accelerated LIMIT 10\n\n-- Query PostgreSQL\nSELECT *\nFROM pg_source LIMIT 10\n\n-- Query Dremio\nSELECT *\nFROM dremio_source LIMIT 10\n\n-- Query Dremio accelerated\nSELECT *\nFROM dremio_source_accelerated LIMIT 10\n"})}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"Step 8."})," Join tables across remote sources and query"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-sql",children:"-- Query across S3, PostgreSQL, and Dremio\nWITH order_numbers AS (\n  SELECT DISTINCT order_number\n  FROM s3_source\n  WHERE order_number IN (\n    SELECT order_number\n    FROM pg_source\n  )\n)\nSELECT\n  AVG(total_amount),\n  passenger_count\nFROM dremio_source\nWHERE passenger_count IN (\n  SELECT DISTINCT order_number % 10 AS num_of_passenger\n  FROM order_numbers\n)\nGROUP BY passenger_count;\n\n+---------------------------------+-----------------+\n| AVG(dremio_source.total_amount) | passenger_count |\n+---------------------------------+-----------------+\n| 17.219515789473693              | 4               |\n| 22.401176470588233              | 6               |\n| 21.12263157894737               | 5               |\n| 17.441359661495103              | 3               |\n| 23.2                            | 0               |\n| 17.714222499449477              | 2               |\n| 15.394881909237105              | 1               |\n+---------------------------------+-----------------+\n\nTime: 3.345525166 seconds. 7 rows.\n"})}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"Step 9."})," Join tables across locally accelerated sources and query"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-sql",children:"-- Query across S3 accelerated, PostgreSQL, and Dremio accelerated\nWITH order_numbers AS (\n  SELECT DISTINCT order_number\n  FROM s3_source_accelerated\n  WHERE order_number IN (\n    SELECT order_number\n    FROM pg_source\n  )\n)\nSELECT\n  AVG(total_amount),\n  passenger_count\nFROM dremio_source_accelerated\nWHERE passenger_count IN (\n  SELECT DISTINCT order_number % 10 AS num_of_passenger\n  FROM order_numbers\n)\nGROUP BY passenger_count;\n\n+---------------------------------------------+-----------------+\n| AVG(dremio_source_accelerated.total_amount) | passenger_count |\n+---------------------------------------------+-----------------+\n| 21.12263157894737                           | 5               |\n| 17.219515789473693                          | 4               |\n| 22.401176470588233                          | 6               |\n| 17.441359661495113                          | 3               |\n| 23.2                                        | 0               |\n| 17.714222499449434                          | 2               |\n| 15.394881909237196                          | 1               |\n+---------------------------------------------+-----------------+\n\nTime: 0.045805958 seconds. 7 rows.\n"})}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"Step 10."})," Clean up the Postgres container."]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-bash",children:"make clean\n"})}),"\n",(0,s.jsx)(n.h3,{id:"acceleration",children:"Acceleration"}),"\n",(0,s.jsx)(n.p,{children:"While the query in step 8 successfully returned results from federated remote data sources, the performance was suboptimal due to data transfer overhead."}),"\n",(0,s.jsxs)(n.p,{children:["To improve query performance, step 9 demonstrates the same query executed against locally materialized and accelerated datasets using ",(0,s.jsx)(n.a,{href:"/data-accelerators/",children:"Data Accelerators"}),", resulting in significant performance gains."]}),"\n",(0,s.jsx)(n.h3,{id:"limitations",children:"Limitations"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Query Optimization:"})," Filter/Join/Aggregation pushdown is not supported, potentially leading to suboptimal query plan."]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Query Performance:"})," Without acceleration, federated queries will be slower than local queries due to network latency and data transfer."]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Query Capabilities:"})," Not all SQL features and data types are supported across all data sources. More complex data type queries may not work as expected."]}),"\n"]})]})}function u(e={}){const{wrapper:n}={...(0,t.R)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(l,{...e})}):l(e)}},8453:(e,n,r)=>{r.d(n,{R:()=>i,x:()=>o});var s=r(6540);const t={},a=s.createContext(t);function i(e){const n=s.useContext(a);return s.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function o(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(t):e.components||t:i(e.components),s.createElement(a.Provider,{value:n},e.children)}}}]);