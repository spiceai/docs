"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[4598],{9236:(e,n,r)=>{r.r(n),r.d(n,{assets:()=>d,contentTitle:()=>a,default:()=>h,frontMatter:()=>t,metadata:()=>s,toc:()=>l});var c=r(4848),i=r(8453);const t={title:"Datasets",sidebar_label:"Datasets",description:"Datasets YAML reference"},a="datasets",s={id:"reference/spicepod/datasets",title:"Datasets",description:"Datasets YAML reference",source:"@site/docs/reference/spicepod/datasets.md",sourceDirName:"reference/spicepod",slug:"/reference/spicepod/datasets",permalink:"/reference/spicepod/datasets",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/reference/spicepod/datasets.md",tags:[],version:"current",frontMatter:{title:"Datasets",sidebar_label:"Datasets",description:"Datasets YAML reference"},sidebar:"docsSidebar",previous:{title:"Catalogs",permalink:"/reference/spicepod/catalogs"},next:{title:"Embeddings",permalink:"/reference/spicepod/embeddings"}},d={},l=[{value:"<code>from</code>",id:"from",level:2},{value:"<code>ref</code>",id:"ref",level:2},{value:"<code>name</code>",id:"name",level:2},{value:"<code>time_column</code>",id:"time_column",level:2},{value:"<code>time_format</code>",id:"time_format",level:2},{value:"<code>acceleration</code>",id:"acceleration",level:2},{value:"<code>acceleration.enabled</code>",id:"accelerationenabled",level:2},{value:"<code>acceleration.engine</code>",id:"accelerationengine",level:2},{value:"<code>acceleration.mode</code>",id:"accelerationmode",level:2},{value:"<code>acceleration.refresh_mode</code>",id:"accelerationrefresh_mode",level:2},{value:"<code>acceleration.refresh_check_interval</code>",id:"accelerationrefresh_check_interval",level:2},{value:"<code>acceleration.refresh_sql</code>",id:"accelerationrefresh_sql",level:2},{value:"<code>acceleration.refresh_data_window</code>",id:"accelerationrefresh_data_window",level:2},{value:"<code>acceleration.refresh_append_overlap</code>",id:"accelerationrefresh_append_overlap",level:2},{value:"<code>acceleration.refresh_retry_enabled</code>",id:"accelerationrefresh_retry_enabled",level:2},{value:"<code>acceleration.refresh_retry_max_attempts</code>",id:"accelerationrefresh_retry_max_attempts",level:2},{value:"<code>acceleration.params</code>",id:"accelerationparams",level:2},{value:"<code>acceleration.engine_secret</code>",id:"accelerationengine_secret",level:2},{value:"<code>acceleration.retention_check_enabled</code>",id:"accelerationretention_check_enabled",level:2},{value:"<code>acceleration.retention_period</code>",id:"accelerationretention_period",level:2},{value:"<code>acceleration.retention_check_interval</code>",id:"accelerationretention_check_interval",level:2},{value:"<code>acceleration.refresh_jitter_enabled</code>",id:"accelerationrefresh_jitter_enabled",level:2},{value:"<code>acceleration.refresh_jitter_max</code>",id:"accelerationrefresh_jitter_max",level:2},{value:"<code>acceleration.indexes</code>",id:"accelerationindexes",level:2},{value:"<code>acceleration.primary_key</code>",id:"accelerationprimary_key",level:2},{value:"<code>acceleration.on_conflict</code>",id:"accelerationon_conflict",level:2},{value:"<code>embeddings</code>",id:"embeddings",level:2},{value:"<code>embeddings[*].column</code>",id:"embeddingscolumn",level:2},{value:"<code>embeddings[*].use</code>",id:"embeddingsuse",level:2},{value:"<code>embeddings[*].column_pk</code>",id:"embeddingscolumn_pk",level:2}];function o(e){const n={a:"a",admonition:"admonition",code:"code",h1:"h1",h2:"h2",header:"header",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,i.R)(),...e.components};return(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(n.p,{children:"A Spicepod can contain one or more datasets referenced by relative path, or defined inline."}),"\n",(0,c.jsx)(n.header,{children:(0,c.jsx)(n.h1,{id:"datasets",children:(0,c.jsx)(n.code,{children:"datasets"})})}),"\n",(0,c.jsx)(n.p,{children:"Inline example:"}),"\n",(0,c.jsx)(n.p,{children:(0,c.jsx)(n.code,{children:"spicepod.yaml"})}),"\n",(0,c.jsx)(n.pre,{children:(0,c.jsx)(n.code,{className:"language-yaml",children:"datasets:\n  - from: spice.ai/eth.beacon.eigenlayer\n    name: strategy_manager_deposits\n    acceleration:\n      enabled: true\n      mode: memory # / file\n      engine: arrow # / duckdb / sqlite / postgres\n      refresh_check_interval: 1h\n      refresh_mode: full / append # update / incremental\n"})}),"\n",(0,c.jsx)(n.p,{children:(0,c.jsx)(n.code,{children:"spicepod.yaml"})}),"\n",(0,c.jsx)(n.pre,{children:(0,c.jsx)(n.code,{className:"language-yaml",children:"datasets:\n  - from: databricks:spiceai.datasets.specific_table\n    name: uniswap_eth_usd\n    params:\n      environment: prod\n    acceleration:\n      enabled: true\n      mode: memory # / file\n      engine: arrow # / duckdb\n      refresh_check_interval: 1h\n      refresh_mode: full / append # update / incremental\n"})}),"\n",(0,c.jsx)(n.p,{children:"Relative path example:"}),"\n",(0,c.jsx)(n.p,{children:(0,c.jsx)(n.code,{children:"spicepod.yaml"})}),"\n",(0,c.jsx)(n.pre,{children:(0,c.jsx)(n.code,{className:"language-yaml",children:"datasets:\n  - ref: datasets/eth_recent_transactions\n"})}),"\n",(0,c.jsx)(n.p,{children:(0,c.jsx)(n.code,{children:"datasets/eth_recent_transactions/dataset.yaml"})}),"\n",(0,c.jsx)(n.pre,{children:(0,c.jsx)(n.code,{className:"language-yaml",children:"from: spice.ai/eth.recent_transactions\nname: eth_recent_transactions\ntype: overwrite\nacceleration:\n  enabled: true\n  refresh: 1h\n"})}),"\n",(0,c.jsx)(n.h2,{id:"from",children:(0,c.jsx)(n.code,{children:"from"})}),"\n",(0,c.jsxs)(n.p,{children:["The ",(0,c.jsx)(n.code,{children:"from"})," field is a string that represents the Uniform Resource Identifier (URI) for the dataset. This URI is composed of two parts: a prefix indicating the Data Connector to use to connect to the dataset, and the path to the dataset within the source."]}),"\n",(0,c.jsxs)(n.p,{children:["The syntax for the ",(0,c.jsx)(n.code,{children:"from"})," field is as follows:"]}),"\n",(0,c.jsx)(n.pre,{children:(0,c.jsx)(n.code,{className:"language-yaml",children:"from: <data_connector>:<path>\n"})}),"\n",(0,c.jsx)(n.p,{children:"Where:"}),"\n",(0,c.jsxs)(n.ul,{children:["\n",(0,c.jsxs)(n.li,{children:["\n",(0,c.jsxs)(n.p,{children:[(0,c.jsx)(n.code,{children:"<data_connector>"}),": The Data Connector to use to connect to the dataset"]}),"\n",(0,c.jsx)(n.p,{children:"Currently supported data connectors:"}),"\n",(0,c.jsxs)(n.ul,{children:["\n",(0,c.jsx)(n.li,{children:(0,c.jsx)(n.a,{href:"/components/data-connectors/spiceai",children:(0,c.jsx)(n.code,{children:"spiceai"})})}),"\n",(0,c.jsx)(n.li,{children:(0,c.jsx)(n.a,{href:"/components/data-connectors/dremio",children:(0,c.jsx)(n.code,{children:"dremio"})})}),"\n",(0,c.jsx)(n.li,{children:(0,c.jsx)(n.a,{href:"/components/data-connectors/spark",children:(0,c.jsx)(n.code,{children:"spark"})})}),"\n",(0,c.jsx)(n.li,{children:(0,c.jsx)(n.a,{href:"/components/data-connectors/databricks",children:(0,c.jsx)(n.code,{children:"databricks"})})}),"\n",(0,c.jsx)(n.li,{children:(0,c.jsx)(n.a,{href:"/components/data-connectors/s3",children:(0,c.jsx)(n.code,{children:"s3"})})}),"\n",(0,c.jsx)(n.li,{children:(0,c.jsx)(n.a,{href:"/components/data-connectors/postgres/",children:(0,c.jsx)(n.code,{children:"postgres"})})}),"\n",(0,c.jsx)(n.li,{children:(0,c.jsx)(n.a,{href:"/components/data-connectors/mysql",children:(0,c.jsx)(n.code,{children:"mysql"})})}),"\n",(0,c.jsx)(n.li,{children:(0,c.jsx)(n.a,{href:"/components/data-connectors/flightsql",children:(0,c.jsx)(n.code,{children:"flightsql"})})}),"\n",(0,c.jsx)(n.li,{children:(0,c.jsx)(n.a,{href:"/components/data-connectors/snowflake",children:(0,c.jsx)(n.code,{children:"snowflake"})})}),"\n",(0,c.jsx)(n.li,{children:(0,c.jsxs)(n.a,{href:"/components/data-connectors/ftp",children:[(0,c.jsx)(n.code,{children:"ftp"}),", ",(0,c.jsx)(n.code,{children:"sftp"})]})}),"\n",(0,c.jsx)(n.li,{children:(0,c.jsxs)(n.a,{href:"/components/data-connectors/https",children:[(0,c.jsx)(n.code,{children:"http"}),", ",(0,c.jsx)(n.code,{children:"https"})]})}),"\n",(0,c.jsx)(n.li,{children:(0,c.jsx)(n.a,{href:"/components/data-connectors/clickhouse",children:(0,c.jsx)(n.code,{children:"clickhouse"})})}),"\n",(0,c.jsx)(n.li,{children:(0,c.jsx)(n.a,{href:"/components/data-connectors/graphql",children:(0,c.jsx)(n.code,{children:"graphql"})})}),"\n"]}),"\n",(0,c.jsxs)(n.p,{children:["If the Data Connector is not explicitly specified, it defaults to ",(0,c.jsx)(n.code,{children:"spiceai"}),"."]}),"\n"]}),"\n",(0,c.jsxs)(n.li,{children:["\n",(0,c.jsxs)(n.p,{children:[(0,c.jsx)(n.code,{children:"<path>"}),": The path to the dataset within the source."]}),"\n"]}),"\n"]}),"\n",(0,c.jsx)(n.h2,{id:"ref",children:(0,c.jsx)(n.code,{children:"ref"})}),"\n",(0,c.jsxs)(n.p,{children:["An alternative to adding the dataset definition inline in the ",(0,c.jsx)(n.code,{children:"spicepod.yaml"})," file. ",(0,c.jsx)(n.code,{children:"ref"})," can be use to point to a directory with a dataset defined in a ",(0,c.jsx)(n.code,{children:"dataset.yaml"}),' file. For example, a dataset configured in a dataset.yaml in the "datasets/sample" directory can be referenced with the following:']}),"\n",(0,c.jsx)(n.p,{children:(0,c.jsx)(n.strong,{children:"dataset.yaml"})}),"\n",(0,c.jsx)(n.pre,{children:(0,c.jsx)(n.code,{className:"language-yaml",children:"from: spice.ai/eth.recent_transactions\nname: eth_recent_transactions\ntype: overwrite\nacceleration:\n  enabled: true\n  refresh: 1h\n"})}),"\n",(0,c.jsx)(n.p,{children:(0,c.jsx)(n.strong,{children:"ref used in spicepod.yaml"})}),"\n",(0,c.jsx)(n.pre,{children:(0,c.jsx)(n.code,{className:"language-yaml",children:"version: v1beta1\nkind: Spicepod\nname: duckdb\ndatasets:\n  - ref: datasets/sample\n"})}),"\n",(0,c.jsx)(n.h2,{id:"name",children:(0,c.jsx)(n.code,{children:"name"})}),"\n",(0,c.jsx)(n.p,{children:"The name of the dataset. This is used to reference the dataset in the pod manifest, as well as in external data sources."}),"\n",(0,c.jsx)(n.h2,{id:"time_column",children:(0,c.jsx)(n.code,{children:"time_column"})}),"\n",(0,c.jsx)(n.p,{children:"Optional. The name of the column that represents the temporal (time) ordering of the dataset."}),"\n",(0,c.jsx)(n.p,{children:"Required to enable a retention policy on the dataset."}),"\n",(0,c.jsx)(n.h2,{id:"time_format",children:(0,c.jsx)(n.code,{children:"time_format"})}),"\n",(0,c.jsxs)(n.p,{children:["Optional. The format of the ",(0,c.jsx)(n.code,{children:"time_column"}),". The following values are supported:"]}),"\n",(0,c.jsxs)(n.ul,{children:["\n",(0,c.jsxs)(n.li,{children:[(0,c.jsx)(n.code,{children:"timestamp"})," - Default. Timestamp without a timezone. E.g. ",(0,c.jsx)(n.code,{children:"2016-06-22 19:10:25"})," with data type ",(0,c.jsx)(n.code,{children:"timestamp"}),"."]}),"\n",(0,c.jsxs)(n.li,{children:[(0,c.jsx)(n.code,{children:"timestamptz"})," - Timestamp with a timezone. E.g. ",(0,c.jsx)(n.code,{children:"2016-06-22 19:10:25-07"})," with data type ",(0,c.jsx)(n.code,{children:"timestamptz"}),"."]}),"\n",(0,c.jsxs)(n.li,{children:[(0,c.jsx)(n.code,{children:"unix_seconds"})," - Unix timestamp in seconds. E.g. ",(0,c.jsx)(n.code,{children:"1718756687"}),"."]}),"\n",(0,c.jsxs)(n.li,{children:[(0,c.jsx)(n.code,{children:"unix_millis"})," - Unix timestamp in milliseconds. E.g. ",(0,c.jsx)(n.code,{children:"1718756687000"}),"."]}),"\n",(0,c.jsxs)(n.li,{children:[(0,c.jsx)(n.code,{children:"ISO8601"})," - ",(0,c.jsx)(n.a,{href:"https://en.wikipedia.org/wiki/ISO_8601",children:"ISO 8601"})," format."]}),"\n"]}),"\n",(0,c.jsxs)(n.p,{children:["Spice emits a warning if the ",(0,c.jsx)(n.code,{children:"time_column"})," from the data source is incompatible with the ",(0,c.jsx)(n.code,{children:"time_format"})," config."]}),"\n",(0,c.jsx)(n.admonition,{title:"Limitations",type:"warning",children:(0,c.jsxs)(n.ul,{children:["\n",(0,c.jsx)(n.li,{children:"String-based columns are assumed to be ISO8601 format."}),"\n"]})}),"\n",(0,c.jsx)(n.h2,{id:"acceleration",children:(0,c.jsx)(n.code,{children:"acceleration"})}),"\n",(0,c.jsx)(n.p,{children:"Optional. Accelerate queries to the dataset by caching data locally."}),"\n",(0,c.jsx)(n.h2,{id:"accelerationenabled",children:(0,c.jsx)(n.code,{children:"acceleration.enabled"})}),"\n",(0,c.jsxs)(n.p,{children:["Enable or disable acceleration, defaults to ",(0,c.jsx)(n.code,{children:"true"}),"."]}),"\n",(0,c.jsx)(n.h2,{id:"accelerationengine",children:(0,c.jsx)(n.code,{children:"acceleration.engine"})}),"\n",(0,c.jsxs)(n.p,{children:["The acceleration engine to use, defaults to ",(0,c.jsx)(n.code,{children:"arrow"}),". The following engines are supported:"]}),"\n",(0,c.jsxs)(n.ul,{children:["\n",(0,c.jsxs)(n.li,{children:[(0,c.jsx)(n.code,{children:"arrow"})," - Accelerated in-memory backed by Apache Arrow DataTables."]}),"\n",(0,c.jsxs)(n.li,{children:[(0,c.jsx)(n.a,{href:"/components/data-accelerators/duckdb",children:(0,c.jsx)(n.code,{children:"duckdb"})})," - Accelerated by an embedded DuckDB database."]}),"\n",(0,c.jsxs)(n.li,{children:[(0,c.jsx)(n.a,{href:"/components/data-accelerators/postgres/",children:(0,c.jsx)(n.code,{children:"postgres"})})," - Accelerated by a Postgres database."]}),"\n",(0,c.jsxs)(n.li,{children:[(0,c.jsx)(n.a,{href:"/components/data-accelerators/duckdb",children:(0,c.jsx)(n.code,{children:"sqlite"})})," - Accelerated by an embedded Sqlite database."]}),"\n"]}),"\n",(0,c.jsx)(n.h2,{id:"accelerationmode",children:(0,c.jsx)(n.code,{children:"acceleration.mode"})}),"\n",(0,c.jsx)(n.p,{children:"Optional. The mode of acceleration. The following values are supported:"}),"\n",(0,c.jsxs)(n.ul,{children:["\n",(0,c.jsxs)(n.li,{children:[(0,c.jsx)(n.code,{children:"memory"})," - Store acceleration data in-memory."]}),"\n",(0,c.jsxs)(n.li,{children:[(0,c.jsx)(n.code,{children:"file"})," - Store acceleration data in a file. Only supported for ",(0,c.jsx)(n.code,{children:"duckdb"})," and ",(0,c.jsx)(n.code,{children:"sqlite"})," acceleration engines."]}),"\n"]}),"\n",(0,c.jsxs)(n.p,{children:[(0,c.jsx)(n.code,{children:"mode"})," is currently only supported for the ",(0,c.jsx)(n.code,{children:"duckdb"})," engine."]}),"\n",(0,c.jsx)(n.h2,{id:"accelerationrefresh_mode",children:(0,c.jsx)(n.code,{children:"acceleration.refresh_mode"})}),"\n",(0,c.jsx)(n.p,{children:"Optional. How to refresh the dataset. The following values are supported:"}),"\n",(0,c.jsxs)(n.ul,{children:["\n",(0,c.jsxs)(n.li,{children:[(0,c.jsx)(n.code,{children:"full"})," - Refresh the entire dataset."]}),"\n",(0,c.jsxs)(n.li,{children:[(0,c.jsx)(n.code,{children:"append"})," - Append new data to the dataset. When ",(0,c.jsx)(n.code,{children:"time_column"})," is specified, new records are fetched from the latest timestamp in the accelerated data at the ",(0,c.jsx)(n.code,{children:"acceleration.refresh_check_interval"}),"."]}),"\n"]}),"\n",(0,c.jsx)(n.h2,{id:"accelerationrefresh_check_interval",children:(0,c.jsx)(n.code,{children:"acceleration.refresh_check_interval"})}),"\n",(0,c.jsxs)(n.p,{children:["Optional. How often data should be refreshed. For ",(0,c.jsx)(n.code,{children:"append"})," datasets without a specific ",(0,c.jsx)(n.code,{children:"time_column"}),", this config is not used. If not defined, the accelerator will not refresh after it initially loads data."]}),"\n",(0,c.jsxs)(n.p,{children:["See ",(0,c.jsx)(n.a,{href:"/reference/duration/",children:"Duration"})]}),"\n",(0,c.jsx)(n.h2,{id:"accelerationrefresh_sql",children:(0,c.jsx)(n.code,{children:"acceleration.refresh_sql"})}),"\n",(0,c.jsxs)(n.p,{children:["Optional. Filters the data fetched from the source to be stored in the accelerator engine. Only supported for ",(0,c.jsx)(n.code,{children:"full"})," refresh_mode datasets."]}),"\n",(0,c.jsxs)(n.p,{children:["Must be of the form ",(0,c.jsx)(n.code,{children:"SELECT * FROM {name} WHERE {refresh_filter}"}),". ",(0,c.jsx)(n.code,{children:"{name}"})," is the dataset name declared above, ",(0,c.jsx)(n.code,{children:"{refresh_filter}"})," is any SQL expression that can be used to filter the data, i.e. ",(0,c.jsx)(n.code,{children:"WHERE city = 'Seattle'"})," to reduce the working set of data that is accelerated within Spice from the data source."]}),"\n",(0,c.jsx)(n.admonition,{title:"Limitations",type:"warning",children:(0,c.jsxs)(n.ul,{children:["\n",(0,c.jsx)(n.li,{children:"The refresh SQL only supports filtering data from the current dataset - joining across other datasets is not supported."}),"\n",(0,c.jsxs)(n.li,{children:["Selecting a subset of columns isn't supported - the refresh SQL needs to start with ",(0,c.jsx)(n.code,{children:"SELECT * FROM {name}"}),"."]}),"\n",(0,c.jsx)(n.li,{children:"Queries for data that have been filtered out will not fall back to querying against the federated table."}),"\n"]})}),"\n",(0,c.jsx)(n.h2,{id:"accelerationrefresh_data_window",children:(0,c.jsx)(n.code,{children:"acceleration.refresh_data_window"})}),"\n",(0,c.jsxs)(n.p,{children:["Optional. A duration to filter dataset refresh source queries to recent data (duration into past from now). Requires ",(0,c.jsx)(n.code,{children:"time_column"})," and ",(0,c.jsx)(n.code,{children:"time_format"})," to also be configured. Only supported for ",(0,c.jsx)(n.code,{children:"full"})," refresh mode datasets."]}),"\n",(0,c.jsxs)(n.p,{children:["For example, ",(0,c.jsx)(n.code,{children:"refresh_data_window: 24h"})," will include only records with a timestamp within the last 24 hours."]}),"\n",(0,c.jsxs)(n.p,{children:["See ",(0,c.jsx)(n.a,{href:"/reference/duration/",children:"Duration"})]}),"\n",(0,c.jsx)(n.h2,{id:"accelerationrefresh_append_overlap",children:(0,c.jsx)(n.code,{children:"acceleration.refresh_append_overlap"})}),"\n",(0,c.jsxs)(n.p,{children:["Optional. A duration to specify how far back to include records based on the most recent timestamp found in the accelerated data. Requires ",(0,c.jsx)(n.code,{children:"time_column"})," to also be configured. Only supported for ",(0,c.jsx)(n.code,{children:"append"})," refresh mode datasets."]}),"\n",(0,c.jsx)(n.p,{children:"This setting can help mitigate missing data issues caused by late arriving data."}),"\n",(0,c.jsxs)(n.p,{children:["Example: If the latest timestamp in the accelerated data table is ",(0,c.jsx)(n.code,{children:"2020-01-01T02:00:00Z"}),", setting ",(0,c.jsx)(n.code,{children:"refresh_append_overlap: 1h"})," will include records starting from ",(0,c.jsx)(n.code,{children:"2020-01-01T01:00:00Z"}),"."]}),"\n",(0,c.jsxs)(n.p,{children:["See ",(0,c.jsx)(n.a,{href:"/reference/duration/",children:"Duration"})]}),"\n",(0,c.jsx)(n.h2,{id:"accelerationrefresh_retry_enabled",children:(0,c.jsx)(n.code,{children:"acceleration.refresh_retry_enabled"})}),"\n",(0,c.jsx)(n.p,{children:"Optional. Specifies whether an accelerated dataset should retry data refresh in the event of transient errors. The default setting is true."}),"\n",(0,c.jsxs)(n.p,{children:["Retries utilize a ",(0,c.jsx)(n.a,{href:"https://en.wikipedia.org/wiki/Fibonacci_sequence",children:"Fibonacci backoff strategy"}),". To disable refresh retries, set ",(0,c.jsx)(n.code,{children:"refresh_retry_enabled: false"}),"."]}),"\n",(0,c.jsx)(n.h2,{id:"accelerationrefresh_retry_max_attempts",children:(0,c.jsx)(n.code,{children:"acceleration.refresh_retry_max_attempts"})}),"\n",(0,c.jsx)(n.p,{children:"Optional. Defines the maximum number of retry attempts when refresh retries are enabled. The default is undefined, allowing for unlimited attempts."}),"\n",(0,c.jsx)(n.h2,{id:"accelerationparams",children:(0,c.jsx)(n.code,{children:"acceleration.params"})}),"\n",(0,c.jsx)(n.p,{children:"Optional. Parameters to pass to the acceleration engine. The parameters are specific to the acceleration engine used."}),"\n",(0,c.jsx)(n.h2,{id:"accelerationengine_secret",children:(0,c.jsx)(n.code,{children:"acceleration.engine_secret"})}),"\n",(0,c.jsxs)(n.p,{children:["Optional. The secret store key to use the acceleration engine connection credential. For supported data connectors, use ",(0,c.jsx)(n.code,{children:"spice login"})," to store the secret."]}),"\n",(0,c.jsx)(n.h2,{id:"accelerationretention_check_enabled",children:(0,c.jsx)(n.code,{children:"acceleration.retention_check_enabled"})}),"\n",(0,c.jsxs)(n.p,{children:["Optional. Enable or disable retention policy check, defaults to ",(0,c.jsx)(n.code,{children:"false"}),"."]}),"\n",(0,c.jsx)(n.h2,{id:"accelerationretention_period",children:(0,c.jsx)(n.code,{children:"acceleration.retention_period"})}),"\n",(0,c.jsxs)(n.p,{children:["Optional. The retention period for the dataset. Combine with ",(0,c.jsx)(n.code,{children:"time_column"})," and ",(0,c.jsx)(n.code,{children:"time_format"})," to determine if the data should be retained or not."]}),"\n",(0,c.jsxs)(n.p,{children:["Required when ",(0,c.jsx)(n.code,{children:"acceleration.retention_check_enabled"})," is ",(0,c.jsx)(n.code,{children:"true"}),"."]}),"\n",(0,c.jsxs)(n.p,{children:["See ",(0,c.jsx)(n.a,{href:"/reference/duration/",children:"Duration"})]}),"\n",(0,c.jsx)(n.h2,{id:"accelerationretention_check_interval",children:(0,c.jsx)(n.code,{children:"acceleration.retention_check_interval"})}),"\n",(0,c.jsx)(n.p,{children:"Optional. How often the retention policy should be checked."}),"\n",(0,c.jsxs)(n.p,{children:["Required when ",(0,c.jsx)(n.code,{children:"acceleration.retention_check_enabled"})," is ",(0,c.jsx)(n.code,{children:"true"}),"."]}),"\n",(0,c.jsxs)(n.p,{children:["See ",(0,c.jsx)(n.a,{href:"/reference/duration/",children:"Duration"})]}),"\n",(0,c.jsx)(n.h2,{id:"accelerationrefresh_jitter_enabled",children:(0,c.jsx)(n.code,{children:"acceleration.refresh_jitter_enabled"})}),"\n",(0,c.jsxs)(n.p,{children:["Optional. Enable or disable refresh jitter, defaults to ",(0,c.jsx)(n.code,{children:"false"}),". The refresh jitter adds/substracts a randomized time period from the ",(0,c.jsx)(n.code,{children:"refresh_check_interval"}),"."]}),"\n",(0,c.jsx)(n.h2,{id:"accelerationrefresh_jitter_max",children:(0,c.jsx)(n.code,{children:"acceleration.refresh_jitter_max"})}),"\n",(0,c.jsxs)(n.p,{children:["Optional. The maximum amount of jitter to add to the refresh interval. The jitter is a random value between 0 and ",(0,c.jsx)(n.code,{children:"refresh_jitter_max"}),". Defaults to 10% of ",(0,c.jsx)(n.code,{children:"refresh_check_interval"}),"."]}),"\n",(0,c.jsx)(n.h2,{id:"accelerationindexes",children:(0,c.jsx)(n.code,{children:"acceleration.indexes"})}),"\n",(0,c.jsx)(n.p,{children:"Optional. Specify which indexes should be applied to the locally accelerated table. Not supported for in-memory Arrow acceleration engine."}),"\n",(0,c.jsxs)(n.p,{children:["The ",(0,c.jsx)(n.code,{children:"indexes"})," field is a map where the key is the column reference and the value is the index type."]}),"\n",(0,c.jsx)(n.p,{children:"A column reference can be a single column name or a multicolumn key. The column reference must be enclosed in parentheses if it is a multicolumn key."}),"\n",(0,c.jsxs)(n.p,{children:["See ",(0,c.jsx)(n.a,{href:"/features/local-acceleration/indexes",children:"Indexes"})]}),"\n",(0,c.jsx)(n.pre,{children:(0,c.jsx)(n.code,{className:"language-yaml",children:"datasets:\n  - from: spice.ai/eth.recent_blocks\n    name: eth.recent_blocks\n    acceleration:\n      enabled: true\n      engine: sqlite\n      indexes:\n        number: enabled # Index the `number` column\n        '(hash, timestamp)': unique # Add a unique index with a multicolumn key comprised of the `hash` and `timestamp` columns\n"})}),"\n",(0,c.jsx)(n.h2,{id:"accelerationprimary_key",children:(0,c.jsx)(n.code,{children:"acceleration.primary_key"})}),"\n",(0,c.jsx)(n.p,{children:"Optional. Specify the primary key constraint on the locally accelerated table. Not supported for in-memory Arrow acceleration engine."}),"\n",(0,c.jsxs)(n.p,{children:["The ",(0,c.jsx)(n.code,{children:"primary_key"})," field is a string that represents the column reference that should be used as the primary key. The column reference can be a single column name or a multicolumn key. The column reference must be enclosed in parentheses if it is a multicolumn key."]}),"\n",(0,c.jsxs)(n.p,{children:["See ",(0,c.jsx)(n.a,{href:"/features/local-acceleration/constraints",children:"Constraints"})]}),"\n",(0,c.jsx)(n.pre,{children:(0,c.jsx)(n.code,{className:"language-yaml",children:"datasets:\n  - from: spice.ai/eth.recent_blocks\n    name: eth.recent_blocks\n    acceleration:\n      enabled: true\n      engine: sqlite\n      primary_key: hash # Define a primary key on the `hash` column\n"})}),"\n",(0,c.jsx)(n.h2,{id:"accelerationon_conflict",children:(0,c.jsx)(n.code,{children:"acceleration.on_conflict"})}),"\n",(0,c.jsx)(n.p,{children:"Optional. Specify what should happen when a constraint is violated. Not supported for in-memory Arrow acceleration engine."}),"\n",(0,c.jsxs)(n.p,{children:["The ",(0,c.jsx)(n.code,{children:"on_conflict"})," field is a map where the key is the column reference and the value is the conflict resolution strategy."]}),"\n",(0,c.jsx)(n.p,{children:"A column reference can be a single column name or a multicolumn key. The column reference must be enclosed in parentheses if it is a multicolumn key."}),"\n",(0,c.jsxs)(n.p,{children:["Only a single ",(0,c.jsx)(n.code,{children:"on_conflict"})," target can be specified, unless all ",(0,c.jsx)(n.code,{children:"on_conflict"})," targets are specified with ",(0,c.jsx)(n.code,{children:"drop"}),"."]}),"\n",(0,c.jsx)(n.p,{children:"The possible conflict resolution strategies are:"}),"\n",(0,c.jsxs)(n.ul,{children:["\n",(0,c.jsxs)(n.li,{children:[(0,c.jsx)(n.code,{children:"upsert"})," - Upsert the incoming data when the primary key constraint is violated."]}),"\n",(0,c.jsxs)(n.li,{children:[(0,c.jsx)(n.code,{children:"drop"})," - Drop the data when the primary key constraint is violated."]}),"\n"]}),"\n",(0,c.jsxs)(n.p,{children:["See ",(0,c.jsx)(n.a,{href:"/features/local-acceleration/constraints",children:"Constraints"})]}),"\n",(0,c.jsx)(n.pre,{children:(0,c.jsx)(n.code,{className:"language-yaml",children:'datasets:\n  - from: spice.ai/eth.recent_blocks\n    name: eth.recent_blocks\n    acceleration:\n      enabled: true\n      engine: sqlite\n      primary_key: hash\n      indexes:\n        \'(number, timestamp)\': unique\n      on_conflict:\n        # Upsert the incoming data when the primary key constraint on "hash" is violated,\n        # alternatively "drop" can be used instead of "upsert" to drop the data update.\n        hash: upsert\n'})}),"\n",(0,c.jsx)(n.h2,{id:"embeddings",children:(0,c.jsx)(n.code,{children:"embeddings"})}),"\n",(0,c.jsx)(n.p,{children:"Optional. Create vector embeddings for specific columns of the dataset."}),"\n",(0,c.jsx)(n.pre,{children:(0,c.jsx)(n.code,{className:"language-yaml",children:"datasets:\n  - from: spice.ai/eth.recent_blocks\n    name: eth.recent_blocks\n    embeddings:\n      - column: extra_data\n        use: hf_minilm\n"})}),"\n",(0,c.jsx)(n.h2,{id:"embeddingscolumn",children:(0,c.jsx)(n.code,{children:"embeddings[*].column"})}),"\n",(0,c.jsx)(n.p,{children:"The column name to create an embedding for."}),"\n",(0,c.jsx)(n.h2,{id:"embeddingsuse",children:(0,c.jsx)(n.code,{children:"embeddings[*].use"})}),"\n",(0,c.jsxs)(n.p,{children:["The embedding model to use, specific the component name ",(0,c.jsx)(n.code,{children:"embeddings[*].name"}),"."]}),"\n",(0,c.jsx)(n.h2,{id:"embeddingscolumn_pk",children:(0,c.jsx)(n.code,{children:"embeddings[*].column_pk"})}),"\n",(0,c.jsx)(n.p,{children:"Optional. For datasets without a primary key, explicitly specify column(s) that uniquely identify a row."})]})}function h(e={}){const{wrapper:n}={...(0,i.R)(),...e.components};return n?(0,c.jsx)(n,{...e,children:(0,c.jsx)(o,{...e})}):o(e)}},8453:(e,n,r)=>{r.d(n,{R:()=>a,x:()=>s});var c=r(6540);const i={},t=c.createContext(i);function a(e){const n=c.useContext(t);return c.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function s(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:a(e.components),c.createElement(t.Provider,{value:n},e.children)}}}]);