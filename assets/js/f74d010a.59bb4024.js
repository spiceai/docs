"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[4598],{5115:(e,n,r)=>{r.r(n),r.d(n,{assets:()=>d,contentTitle:()=>t,default:()=>h,frontMatter:()=>s,metadata:()=>i,toc:()=>l});var c=r(4848),a=r(8453);const s={title:"Datasets",sidebar_label:"Datasets",description:"Datasets YAML reference"},t="datasets",i={id:"reference/spicepod/datasets",title:"Datasets",description:"Datasets YAML reference",source:"@site/docs/reference/spicepod/datasets.md",sourceDirName:"reference/spicepod",slug:"/reference/spicepod/datasets",permalink:"/reference/spicepod/datasets",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/reference/spicepod/datasets.md",tags:[],version:"current",frontMatter:{title:"Datasets",sidebar_label:"Datasets",description:"Datasets YAML reference"},sidebar:"docsSidebar",previous:{title:"Spicepod specification",permalink:"/reference/spicepod/"},next:{title:"Models",permalink:"/reference/spicepod/models"}},d={},l=[{value:"<code>from</code>",id:"from",level:2},{value:"<code>name</code>",id:"name",level:2},{value:"<code>acceleration</code>",id:"acceleration",level:2},{value:"<code>acceleration.enabled</code>",id:"accelerationenabled",level:2},{value:"<code>acceleration.engine</code>",id:"accelerationengine",level:2},{value:"<code>acceleration.mode</code>",id:"accelerationmode",level:2},{value:"<code>acceleration.refresh_mode</code>",id:"accelerationrefresh_mode",level:2},{value:"<code>acceleration.refresh_interval</code>",id:"accelerationrefresh_interval",level:2},{value:"<code>acceleration.refresh_sql</code>",id:"accelerationrefresh_sql",level:2},{value:"<code>acceleration.params</code>",id:"accelerationparams",level:2},{value:"<code>acceleration.engine_secret</code>",id:"accelerationengine_secret",level:2}];function o(e){const n={a:"a",admonition:"admonition",code:"code",h1:"h1",h2:"h2",li:"li",p:"p",pre:"pre",ul:"ul",...(0,a.R)(),...e.components};return(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(n.p,{children:"A Spicepod can contain one or more datasets referenced by relative path, or defined inline."}),"\n",(0,c.jsx)(n.h1,{id:"datasets",children:(0,c.jsx)(n.code,{children:"datasets"})}),"\n",(0,c.jsx)(n.p,{children:"Inline example:"}),"\n",(0,c.jsx)(n.p,{children:(0,c.jsx)(n.code,{children:"spicepod.yaml"})}),"\n",(0,c.jsx)(n.pre,{children:(0,c.jsx)(n.code,{className:"language-yaml",children:"datasets:\n  - from: spice.ai/eth.beacon.eigenlayer\n    name: strategy_manager_deposits\n    acceleration:\n      enabled: true\n      mode: memory # / file\n      engine: arrow # / duckdb / sqlite / postgres\n      refresh_interval: 1h\n      refresh_mode: full / append # update / incremental\n"})}),"\n",(0,c.jsx)(n.p,{children:(0,c.jsx)(n.code,{children:"spicepod.yaml"})}),"\n",(0,c.jsx)(n.pre,{children:(0,c.jsx)(n.code,{className:"language-yaml",children:"datasets:\n  - from: databricks:spiceai.datasets.specific_table\n    name: uniswap_eth_usd\n    params:\n      environment: prod\n    acceleration:\n      enabled: true\n      mode: memory # / file\n      engine: arrow # / duckdb\n      refresh_interval: 1h\n      refresh_mode: full / append # update / incremental\n"})}),"\n",(0,c.jsx)(n.p,{children:"Relative path example:"}),"\n",(0,c.jsx)(n.p,{children:(0,c.jsx)(n.code,{children:"spicepod.yaml"})}),"\n",(0,c.jsx)(n.pre,{children:(0,c.jsx)(n.code,{className:"language-yaml",children:"datasets:\n  - ref: datasets/eth_recent_transactions\n"})}),"\n",(0,c.jsx)(n.p,{children:(0,c.jsx)(n.code,{children:"datasets/eth_recent_transactions/dataset.yaml"})}),"\n",(0,c.jsx)(n.pre,{children:(0,c.jsx)(n.code,{className:"language-yaml",children:"from: spice.ai/eth.recent_transactions\nname: eth_recent_transactions\ntype: overwrite\nacceleration:\n  enabled: true\n  refresh: 1h\n"})}),"\n",(0,c.jsx)(n.h2,{id:"from",children:(0,c.jsx)(n.code,{children:"from"})}),"\n",(0,c.jsxs)(n.p,{children:["The ",(0,c.jsx)(n.code,{children:"from"})," field is a string that represents the Uniform Resource Identifier (URI) for the dataset. This URI is composed of two parts: a prefix indicating the Data Connector to use to connect to the dataset, and the path to the dataset within the source."]}),"\n",(0,c.jsxs)(n.p,{children:["The syntax for the ",(0,c.jsx)(n.code,{children:"from"})," field is as follows:"]}),"\n",(0,c.jsx)(n.pre,{children:(0,c.jsx)(n.code,{className:"language-yaml",children:"from: <data_connector>:<path>\n"})}),"\n",(0,c.jsx)(n.p,{children:"Where:"}),"\n",(0,c.jsxs)(n.ul,{children:["\n",(0,c.jsxs)(n.li,{children:["\n",(0,c.jsxs)(n.p,{children:[(0,c.jsx)(n.code,{children:"<data_connector>"}),": The Data Connector to use to connect to the dataset"]}),"\n",(0,c.jsx)(n.p,{children:"Currently supported data connectors:"}),"\n",(0,c.jsxs)(n.ul,{children:["\n",(0,c.jsx)(n.li,{children:(0,c.jsx)(n.a,{href:"/data-connectors/spiceai",children:(0,c.jsx)(n.code,{children:"spiceai"})})}),"\n",(0,c.jsx)(n.li,{children:(0,c.jsx)(n.a,{href:"/data-connectors/dremio",children:(0,c.jsx)(n.code,{children:"dremio"})})}),"\n",(0,c.jsx)(n.li,{children:(0,c.jsx)(n.a,{href:"/data-connectors/databricks",children:(0,c.jsx)(n.code,{children:"databricks"})})}),"\n",(0,c.jsx)(n.li,{children:(0,c.jsx)(n.a,{href:"/data-connectors/s3",children:(0,c.jsx)(n.code,{children:"s3"})})}),"\n",(0,c.jsx)(n.li,{children:(0,c.jsx)(n.a,{href:"/data-connectors/postgres/",children:(0,c.jsx)(n.code,{children:"postgres"})})}),"\n",(0,c.jsx)(n.li,{children:(0,c.jsx)(n.a,{href:"/data-connectors/mysql",children:(0,c.jsx)(n.code,{children:"mysql"})})}),"\n"]}),"\n",(0,c.jsxs)(n.p,{children:["If the Data Connector is not explicitly specified, it defaults to ",(0,c.jsx)(n.code,{children:"spiceai"}),"."]}),"\n"]}),"\n",(0,c.jsxs)(n.li,{children:["\n",(0,c.jsxs)(n.p,{children:[(0,c.jsx)(n.code,{children:"<path>"}),": The path to the dataset within the source."]}),"\n"]}),"\n"]}),"\n",(0,c.jsx)(n.h2,{id:"name",children:(0,c.jsx)(n.code,{children:"name"})}),"\n",(0,c.jsx)(n.p,{children:"The name of the dataset. This is used to reference the dataset in the pod manifest, as well as in external data sources."}),"\n",(0,c.jsx)(n.h2,{id:"acceleration",children:(0,c.jsx)(n.code,{children:"acceleration"})}),"\n",(0,c.jsx)(n.p,{children:"Optional. Accelerate queries to the dataset by caching data locally."}),"\n",(0,c.jsx)(n.h2,{id:"accelerationenabled",children:(0,c.jsx)(n.code,{children:"acceleration.enabled"})}),"\n",(0,c.jsxs)(n.p,{children:["Enable or disable acceleration, defaults to ",(0,c.jsx)(n.code,{children:"true"}),"."]}),"\n",(0,c.jsx)(n.h2,{id:"accelerationengine",children:(0,c.jsx)(n.code,{children:"acceleration.engine"})}),"\n",(0,c.jsxs)(n.p,{children:["The acceleration engine to use, defaults to ",(0,c.jsx)(n.code,{children:"arrow"}),". The following engines are supported:"]}),"\n",(0,c.jsxs)(n.ul,{children:["\n",(0,c.jsxs)(n.li,{children:[(0,c.jsx)(n.code,{children:"arrow"})," - Accelerated in-memory backed by Apache Arrow DataTables."]}),"\n",(0,c.jsxs)(n.li,{children:[(0,c.jsx)(n.a,{href:"/data-accelerators/duckdb",children:(0,c.jsx)(n.code,{children:"duckdb"})})," - Accelerated by an embedded DuckDB database."]}),"\n",(0,c.jsxs)(n.li,{children:[(0,c.jsx)(n.a,{href:"/data-accelerators/postgres/",children:(0,c.jsx)(n.code,{children:"postgres"})})," - Accelerated by a Postgres database."]}),"\n",(0,c.jsxs)(n.li,{children:[(0,c.jsx)(n.a,{href:"/data-accelerators/sqlite",children:(0,c.jsx)(n.code,{children:"sqlite"})})," - Accelerated by an embedded Sqlite database."]}),"\n"]}),"\n",(0,c.jsx)(n.h2,{id:"accelerationmode",children:(0,c.jsx)(n.code,{children:"acceleration.mode"})}),"\n",(0,c.jsx)(n.p,{children:"Optional. The mode of acceleration. The following values are supported:"}),"\n",(0,c.jsxs)(n.ul,{children:["\n",(0,c.jsxs)(n.li,{children:[(0,c.jsx)(n.code,{children:"memory"})," - Store acceleration data in-memory."]}),"\n",(0,c.jsxs)(n.li,{children:[(0,c.jsx)(n.code,{children:"file"})," - Store acceleration data in a file. Only supported for ",(0,c.jsx)(n.code,{children:"duckdb"})," and ",(0,c.jsx)(n.code,{children:"sqlite"})," acceleration engines."]}),"\n"]}),"\n",(0,c.jsxs)(n.p,{children:[(0,c.jsx)(n.code,{children:"mode"})," is currently only supported for the ",(0,c.jsx)(n.code,{children:"duckdb"})," engine."]}),"\n",(0,c.jsx)(n.h2,{id:"accelerationrefresh_mode",children:(0,c.jsx)(n.code,{children:"acceleration.refresh_mode"})}),"\n",(0,c.jsx)(n.p,{children:"Optional. How to refresh the dataset. The following values are supported:"}),"\n",(0,c.jsxs)(n.ul,{children:["\n",(0,c.jsxs)(n.li,{children:[(0,c.jsx)(n.code,{children:"full"})," - Refresh the entire dataset."]}),"\n",(0,c.jsxs)(n.li,{children:[(0,c.jsx)(n.code,{children:"append"})," - Append new data to the dataset."]}),"\n"]}),"\n",(0,c.jsx)(n.h2,{id:"accelerationrefresh_interval",children:(0,c.jsx)(n.code,{children:"acceleration.refresh_interval"})}),"\n",(0,c.jsxs)(n.p,{children:["Optional. How often data should be refreshed. Only supported for ",(0,c.jsx)(n.code,{children:"full"})," refresh_mode datasets. For ",(0,c.jsx)(n.code,{children:"append"})," datasets, the refresh interval not used."]}),"\n",(0,c.jsxs)(n.p,{children:["i.e. ",(0,c.jsx)(n.code,{children:"1h"})," for 1 hour, ",(0,c.jsx)(n.code,{children:"1m"})," for 1 minute, ",(0,c.jsx)(n.code,{children:"1s"})," for 1 second, etc."]}),"\n",(0,c.jsx)(n.h2,{id:"accelerationrefresh_sql",children:(0,c.jsx)(n.code,{children:"acceleration.refresh_sql"})}),"\n",(0,c.jsxs)(n.p,{children:["Optional. Filters the data fetched from the source to be stored in the accelerator engine. Only supported for ",(0,c.jsx)(n.code,{children:"full"})," refresh_mode datasets."]}),"\n",(0,c.jsxs)(n.p,{children:["Must be of the form ",(0,c.jsx)(n.code,{children:"SELECT * FROM {name} WHERE {refresh_filter}"}),". ",(0,c.jsx)(n.code,{children:"{name}"})," is the dataset name declared above, ",(0,c.jsx)(n.code,{children:"{refresh_filter}"})," is any SQL expression that can be used to filter the data, i.e. ",(0,c.jsx)(n.code,{children:"WHERE city = 'Seattle'"})," to reduce the working set of data that is accelerated within Spice from the data source."]}),"\n",(0,c.jsx)(n.admonition,{title:"Limitations",type:"warning",children:(0,c.jsxs)(n.ul,{children:["\n",(0,c.jsx)(n.li,{children:"The refresh SQL only supports filtering data from the current dataset - joining across other datasets is not supported."}),"\n",(0,c.jsxs)(n.li,{children:["Selecting a subset of columns isn't supported - the refresh SQL needs to start with ",(0,c.jsx)(n.code,{children:"SELECT * FROM {name}"}),"."]}),"\n",(0,c.jsx)(n.li,{children:"Queries for data that have been filtered out will not fall back to querying against the federated table."}),"\n"]})}),"\n",(0,c.jsx)(n.h2,{id:"accelerationparams",children:(0,c.jsx)(n.code,{children:"acceleration.params"})}),"\n",(0,c.jsx)(n.p,{children:"Optional. Parameters to pass to the acceleration engine. The parameters are specific to the acceleration engine used."}),"\n",(0,c.jsx)(n.h2,{id:"accelerationengine_secret",children:(0,c.jsx)(n.code,{children:"acceleration.engine_secret"})}),"\n",(0,c.jsxs)(n.p,{children:["Optional. The secret store key to use the acceleration engine connection credential. For supported data connectors, use ",(0,c.jsx)(n.code,{children:"spice login"})," to store the secret."]})]})}function h(e={}){const{wrapper:n}={...(0,a.R)(),...e.components};return n?(0,c.jsx)(n,{...e,children:(0,c.jsx)(o,{...e})}):o(e)}},8453:(e,n,r)=>{r.d(n,{R:()=>t,x:()=>i});var c=r(6540);const a={},s=c.createContext(a);function t(e){const n=c.useContext(s);return c.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function i(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(a):e.components||a:t(e.components),c.createElement(s.Provider,{value:n},e.children)}}}]);