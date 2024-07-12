"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[2146],{7806:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>i,contentTitle:()=>d,default:()=>h,frontMatter:()=>s,metadata:()=>c,toc:()=>l});var n=t(4848),a=t(8453);const s={title:"Data Refresh",sidebar_label:"Data Refresh",description:"Data refresh for accelerated datasets",sidebar_position:1,pagination_prev:null,pagination_next:null},d=void 0,c={id:"components/data-accelerators/data-refresh",title:"Data Refresh",description:"Data refresh for accelerated datasets",source:"@site/docs/components/data-accelerators/data-refresh.md",sourceDirName:"components/data-accelerators",slug:"/components/data-accelerators/data-refresh",permalink:"/components/data-accelerators/data-refresh",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/components/data-accelerators/data-refresh.md",tags:[],version:"current",sidebarPosition:1,frontMatter:{title:"Data Refresh",sidebar_label:"Data Refresh",description:"Data refresh for accelerated datasets",sidebar_position:1,pagination_prev:null,pagination_next:null},sidebar:"docsSidebar"},i={},l=[{value:"Refresh Modes",id:"refresh-modes",level:2},{value:"Changes",id:"changes",level:2},{value:"Filtered Refresh",id:"filtered-refresh",level:2},{value:"Refresh SQL",id:"refresh-sql",level:3},{value:"Refresh Data Window",id:"refresh-data-window",level:3},{value:"Behavior on Zero Results",id:"behavior-on-zero-results",level:2},{value:"Refresh Interval",id:"refresh-interval",level:2},{value:"Refresh On-Demand",id:"refresh-on-demand",level:2},{value:"Refresh Retries",id:"refresh-retries",level:2},{value:"Retention Policy",id:"retention-policy",level:2}];function o(e){const r={a:"a",admonition:"admonition",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,a.R)(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(r.h2,{id:"refresh-modes",children:"Refresh Modes"}),"\n",(0,n.jsxs)(r.p,{children:["Spice supports three modes to refresh/update local data from a connected data source. ",(0,n.jsx)(r.code,{children:"full"})," is the default mode."]}),"\n",(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{children:"Mode"}),(0,n.jsx)(r.th,{children:"Description"}),(0,n.jsx)(r.th,{children:"Example"})]})}),(0,n.jsxs)(r.tbody,{children:[(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:"full"})}),(0,n.jsx)(r.td,{children:"Replace/overwrite the entire dataset on each refresh"}),(0,n.jsx)(r.td,{children:"A table of users"})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:"append"})}),(0,n.jsx)(r.td,{children:"Append/add data to the dataset on each refresh"}),(0,n.jsx)(r.td,{children:"Append-only datasets, like time-series or log data"})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:"changes"})}),(0,n.jsx)(r.td,{children:"Apply incremental changes"}),(0,n.jsx)(r.td,{children:"Customer order lifecycle table"})]})]})]}),"\n",(0,n.jsx)(r.p,{children:"E.g."}),"\n",(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:"language-yaml",children:"datasets:\n  - from: databricks:my_dataset\n    name: accelerated_dataset\n    acceleration:\n      refresh_mode: full\n      refresh_check_interval: 10m\n"})}),"\n",(0,n.jsxs)(r.p,{children:["If the dataset definition includes a ",(0,n.jsx)(r.code,{children:"time_column"})," and the refresh mode is ",(0,n.jsx)(r.code,{children:"append"}),", data will be refreshed for data where the ",(0,n.jsx)(r.code,{children:"time_column"})," value in the remote source is greater-than (gt) the ",(0,n.jsx)(r.code,{children:"max(time_column)"})," value in the local acceleration."]}),"\n",(0,n.jsx)(r.p,{children:"E.g."}),"\n",(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:"language-yaml",children:"datasets:\n  - from: databricks:my_dataset\n    name: accelerated_dataset\n    time_column: timestamp\n    acceleration:\n      refresh_mode: append # In conjuction with time_column, only fetch data greater than the latest local timestamp\n      refresh_check_interval: 10m\n"})}),"\n",(0,n.jsx)(r.h2,{id:"changes",children:"Changes"}),"\n",(0,n.jsxs)(r.p,{children:["Datasets configured with acceleration ",(0,n.jsx)(r.code,{children:"refresh_mode: changes"})," require a ",(0,n.jsx)(r.a,{href:"/features/cdc/",children:"Change Data Capture (CDC)"})," supported data connector. Initial CDC support in Spice is supported by the ",(0,n.jsx)(r.a,{href:"/components/data-connectors/debezium",children:"Debezium data connector"}),"."]}),"\n",(0,n.jsx)(r.h2,{id:"filtered-refresh",children:"Filtered Refresh"}),"\n",(0,n.jsx)(r.p,{children:"Typically only a working subset of an entire dataset is used in an application or dashboard. Use these features to filter refresh data, creating a smaller subset for faster processing and to reduce the data transferred and stored locally."}),"\n",(0,n.jsxs)(r.ul,{children:["\n",(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.a,{href:"#refresh-sql",children:"Refresh SQL"})," - Specify the filter as arbitrary SQL to be pushed down to the remote source."]}),"\n",(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.a,{href:"#refresh-data-window",children:"Refresh Data Window"})," - Filters data from the remote source outside the specified time window."]}),"\n"]}),"\n",(0,n.jsx)(r.h3,{id:"refresh-sql",children:"Refresh SQL"}),"\n",(0,n.jsxs)(r.p,{children:["Specify filters for data accelerated from the connected source using arbitrary SQL. Supported for ",(0,n.jsx)(r.code,{children:"full"})," and ",(0,n.jsx)(r.code,{children:"append"})," refresh modes."]}),"\n",(0,n.jsx)(r.p,{children:"Filters will be pushed down to the remote source, and only the requested data will be transferred over the network."}),"\n",(0,n.jsx)(r.p,{children:"Example:"}),"\n",(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:"language-yaml",children:"datasets:\n  - from: databricks:my_dataset\n    name: accelerated_dataset\n    acceleration:\n      enabled: true\n      refresh_mode: full\n      refresh_check_interval: 10m\n      refresh_sql: |\n        SELECT * FROM accelerated_dataset WHERE city = 'Seattle'\n"})}),"\n",(0,n.jsxs)(r.p,{children:["The ",(0,n.jsx)(r.code,{children:"refresh_sql"})," parameter can be updated at runtime on-demand using ",(0,n.jsx)(r.code,{children:"PATCH /v1/datasets/:name/acceleration"}),". This change is temporary and will revert at the next runtime restart."]}),"\n",(0,n.jsx)(r.p,{children:"Example:"}),"\n",(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:"language-bash",children:'curl -i -X PATCH \\\n     -H "Content-Type: application/json" \\\n     -d \'{\n           "refresh_sql": "SELECT * FROM accelerated_dataset WHERE city = \'Bellevue\'"\n         }\' \\\n     127.0.0.1:3000/v1/datasets/accelerated_dataset/acceleration\n'})}),"\n",(0,n.jsxs)(r.p,{children:["For the complete reference, view the ",(0,n.jsx)(r.code,{children:"refresh_sql"})," section of ",(0,n.jsx)(r.a,{href:"/reference/spicepod/datasets#accelerationrefresh_sql",children:"datasets"}),"."]}),"\n",(0,n.jsx)(r.admonition,{title:"Limitations",type:"warning",children:(0,n.jsxs)(r.ul,{children:["\n",(0,n.jsx)(r.li,{children:"The refresh SQL only supports filtering data from the current dataset - joining across other datasets is not supported."}),"\n",(0,n.jsxs)(r.li,{children:["Selecting a subset of columns isn't supported - the refresh SQL needs to start with ",(0,n.jsx)(r.code,{children:"SELECT * FROM {name}"}),"."]}),"\n",(0,n.jsx)(r.li,{children:"Queries for data that have been filtered out will not fall back to querying against the federated table."}),"\n",(0,n.jsx)(r.li,{children:"Refresh SQL modifications made via API are temporary and will revert after a runtime restart."}),"\n"]})}),"\n",(0,n.jsx)(r.h3,{id:"refresh-data-window",children:"Refresh Data Window"}),"\n",(0,n.jsxs)(r.p,{children:["Filters data from the federated source outside than the specified window. The only supported window is a lookback starting from ",(0,n.jsx)(r.code,{children:"now() - refresh_data_window"})," to ",(0,n.jsx)(r.code,{children:"now()"}),". This flag is only supported for datasets configured with a ",(0,n.jsx)(r.code,{children:"full"})," refresh mode (the default)."]}),"\n",(0,n.jsxs)(r.p,{children:["Used in combination with the ",(0,n.jsx)(r.a,{href:"/reference/spicepod/datasets#time_column",children:(0,n.jsx)(r.code,{children:"time_column"})})," to identify the column that contains the timestamps to filter on. The ",(0,n.jsx)(r.a,{href:"/reference/spicepod/datasets#time_format",children:(0,n.jsx)(r.code,{children:"time_format"})})," column (optional) can be used to instruct the Spice runtime how to interpret the timestamps in the ",(0,n.jsx)(r.code,{children:"time_column"}),"."]}),"\n",(0,n.jsxs)(r.p,{children:["Can also be combined with ",(0,n.jsx)(r.code,{children:"refresh_sql"})," to further filter the data based on the temporal dimension."]}),"\n",(0,n.jsx)(r.p,{children:"Example:"}),"\n",(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:"language-yaml",children:"datasets:\n  - from: databricks:my_dataset\n    name: accelerated_dataset\n    time_column: created_at\n    acceleration:\n      enabled: true\n      refresh_mode: full\n      refresh_check_interval: 10m\n      refresh_sql: |\n        SELECT * FROM accelerated_dataset WHERE city = 'Seattle'\n      refresh_data_window: 1d\n"})}),"\n",(0,n.jsxs)(r.p,{children:["This configuration will only accelerate data from the federated source that matches the filter ",(0,n.jsx)(r.code,{children:"city = 'Seattle'"})," and is less than 1 day old."]}),"\n",(0,n.jsx)(r.h2,{id:"behavior-on-zero-results",children:"Behavior on Zero Results"}),"\n",(0,n.jsxs)(r.p,{children:["By default, accelerated datasets only return locally materialized data. If this local data is a subset of the full dataset in the federated source\u2014due to settings like ",(0,n.jsx)(r.code,{children:"refresh_sql"}),", ",(0,n.jsx)(r.code,{children:"refresh_data_window"}),", or retention policies\u2014queries against the accelerated dataset may return zero results, even when the federated table would return results."]}),"\n",(0,n.jsxs)(r.p,{children:["To address this, ",(0,n.jsx)(r.code,{children:"on_zero_results: use_source"})," can be configured in the acceleration configuration. Queries returning zero results will fall back to the federated source, returning results from querying the underlying data."]}),"\n",(0,n.jsxs)(r.p,{children:["The ",(0,n.jsx)(r.code,{children:"on_zero_results: use_source"})," setting applies only to ",(0,n.jsx)(r.code,{children:"full"})," and ",(0,n.jsx)(r.code,{children:"append"})," refresh modes (not `changes)."]}),"\n",(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:"on_zero_results"}),":"]}),"\n",(0,n.jsxs)(r.ul,{children:["\n",(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:"return_empty"})," (Default) - Return an empty result set when no data is found in the accelerated dataset."]}),"\n",(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.code,{children:"use_source"})," - Fall back to querying the federated table when no data is found in the accelerated dataset."]}),"\n"]}),"\n",(0,n.jsx)(r.p,{children:"Example:"}),"\n",(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:"language-yaml",children:"datasets:\n  - from: databricks:my_dataset\n    name: accelerated_dataset\n    acceleration:\n      enabled: true\n      refresh_sql: SELECT * FROM accelerated_dataset where city = 'Seattle'\n      on_zero_results: use_source\n"})}),"\n",(0,n.jsxs)(r.p,{children:["In this example a query against ",(0,n.jsx)(r.code,{children:"accelerated_dataset"})," within Spice like ",(0,n.jsx)(r.code,{children:"SELECT * FROM accelerated_dataset WHERE city = 'Portland'"})," would initially query against the accelerated data, see that it returns zero results and then fallback to querying against the federated table in Databricks."]}),"\n",(0,n.jsx)(r.admonition,{type:"warning",children:(0,n.jsxs)(r.p,{children:["It is possible that even though the accelerated table returns some results, it may not contain all the data that would be returned by the federated table. ",(0,n.jsx)(r.code,{children:"on_zero_results"})," only controls the behavior in the simple case where no data is returned by the acceleration for a given query."]})}),"\n",(0,n.jsx)(r.h2,{id:"refresh-interval",children:"Refresh Interval"}),"\n",(0,n.jsxs)(r.p,{children:["For accelerated datasets in ",(0,n.jsx)(r.code,{children:"full"})," mode, the ",(0,n.jsx)(r.a,{href:"/reference/spicepod/datasets#accelerationrefresh_check_interval",children:(0,n.jsx)(r.code,{children:"refresh_check_interval"})})," parameter controls how often the accelerated dataset is refreshed."]}),"\n",(0,n.jsx)(r.p,{children:"Example:"}),"\n",(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:"language-yaml",children:"datasets:\n  - from: spice.ai/eth.recent_blocks\n    name: eth_recent_blocks\n    acceleration:\n      enabled: true\n      refresh_mode: full\n      refresh_check_interval: 10s\n"})}),"\n",(0,n.jsxs)(r.p,{children:["This configuration will refresh ",(0,n.jsx)(r.code,{children:"eth.recent_blocks"})," data every 10 seconds."]}),"\n",(0,n.jsx)(r.h2,{id:"refresh-on-demand",children:"Refresh On-Demand"}),"\n",(0,n.jsxs)(r.p,{children:["Accelerated datasets can be refreshed on-demand via the ",(0,n.jsx)(r.code,{children:"refresh"})," CLI command or ",(0,n.jsx)(r.code,{children:"POST /v1/datasets/:name/acceleration/refresh"})," API endpoint."]}),"\n",(0,n.jsxs)(r.p,{children:["On-demand refresh applies only to ",(0,n.jsx)(r.code,{children:"full"})," and ",(0,n.jsx)(r.code,{children:"append"})," refresh modes (not `changes)."]}),"\n",(0,n.jsx)(r.p,{children:"CLI example:"}),"\n",(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:"language-bash",children:"spice refresh eth_recent_blocks\n"})}),"\n",(0,n.jsx)(r.p,{children:"API example using cURL:"}),"\n",(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:"language-bash",children:"curl -i -XPOST 127.0.0.1:3000/v1/datasets/eth_recent_blocks/refresh\n"})}),"\n",(0,n.jsx)(r.p,{children:"with response:"}),"\n",(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:"language-bash",children:'HTTP/1.1 201 Created\ncontent-type: application/json\ncontent-length: 55\ndate: Thu, 11 Apr 2024 20:11:18 GMT\n\n{"message":"Dataset refresh triggered for eth_recent_blocks."}\n'})}),"\n",(0,n.jsx)(r.admonition,{title:"Note",type:"warning",children:(0,n.jsx)(r.p,{children:"On-demand refresh always initiates a new refresh, terminating any in-progress refresh for the dataset."})}),"\n",(0,n.jsx)(r.h2,{id:"refresh-retries",children:"Refresh Retries"}),"\n",(0,n.jsxs)(r.p,{children:["By default, data refreshes for accelerated datasets are retried on transient errors (connectivity issues, compute warehouse goes idle, etc.) using ",(0,n.jsx)(r.a,{href:"https://en.wikipedia.org/wiki/Fibonacci_sequence",children:"Fibonacci"})," backoff strategy."]}),"\n",(0,n.jsxs)(r.p,{children:["Retry behavior can be configured using the ",(0,n.jsx)(r.a,{href:"/reference/spicepod/datasets#accelerationrefresh_retry_enabled",children:(0,n.jsx)(r.code,{children:"acceleration.refresh_retry_enabled"})})," and ",(0,n.jsx)(r.a,{href:"/reference/spicepod/datasets#accelerationrefresh_retry_max_attempts",children:(0,n.jsx)(r.code,{children:"acceleration.refresh_retry_max_attempts"})})," parameters."]}),"\n",(0,n.jsxs)(r.p,{children:["Data refresh retry applies to ",(0,n.jsx)(r.code,{children:"full"})," and ",(0,n.jsx)(r.code,{children:"append"})," refresh modes not ",(0,n.jsx)(r.code,{children:"changes"})," which inherently supports data integrity and consistency through the CDC mechanism."]}),"\n",(0,n.jsx)(r.p,{children:"Example: Disable rertries"}),"\n",(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:"language-yaml",children:"datasets:\n  - from: spice.ai/eth.recent_blocks\n    name: eth_recent_blocks\n    acceleration:\n      refresh_retry_enabled: false\n      refresh_check_interval: 30s\n"})}),"\n",(0,n.jsx)(r.p,{children:"Example: Limit retries to a maximum of 10 attempts"}),"\n",(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:"language-yaml",children:"datasets:\n  - from: spice.ai/eth.recent_blocks\n    name: eth_recent_blocks\n    acceleration:\n      refresh_retry_max_attempts: 10\n      refresh_check_interval: 30s\n"})}),"\n",(0,n.jsx)(r.h2,{id:"retention-policy",children:"Retention Policy"}),"\n",(0,n.jsxs)(r.p,{children:["Accelerated datasets can be set to automatically evict time-series data exceeding a retention period by setting a retention policy based on the configured ",(0,n.jsx)(r.code,{children:"time_column"})," and ",(0,n.jsx)(r.code,{children:"acceleration.retention_period"}),"."]}),"\n",(0,n.jsxs)(r.p,{children:["Retention policies apply to ",(0,n.jsx)(r.code,{children:"full"})," and ",(0,n.jsx)(r.code,{children:"append"})," refresh modes (not ",(0,n.jsx)(r.code,{children:"changes"}),")."]}),"\n",(0,n.jsxs)(r.p,{children:["The policy is set using the ",(0,n.jsx)(r.a,{href:"/reference/spicepod/datasets#accelerationretention_check_enabled",children:(0,n.jsx)(r.code,{children:"acceleration.retention_check_enabled"})}),", ",(0,n.jsx)(r.a,{href:"/reference/spicepod/datasets#accelerationretention_period",children:(0,n.jsx)(r.code,{children:"acceleration.retention_period"})})," and ",(0,n.jsx)(r.a,{href:"/reference/spicepod/datasets#accelerationretention_check_interval",children:(0,n.jsx)(r.code,{children:"acceleration.retention_check_interval"})})," parameters, along with the ",(0,n.jsx)(r.a,{href:"/reference/spicepod/datasets#time_column",children:(0,n.jsx)(r.code,{children:"time_column"})})," and ",(0,n.jsx)(r.a,{href:"/reference/spicepod/datasets#time_format",children:(0,n.jsx)(r.code,{children:"time_format"})})," dataset parameters."]})]})}function h(e={}){const{wrapper:r}={...(0,a.R)(),...e.components};return r?(0,n.jsx)(r,{...e,children:(0,n.jsx)(o,{...e})}):o(e)}},8453:(e,r,t)=>{t.d(r,{R:()=>d,x:()=>c});var n=t(6540);const a={},s=n.createContext(a);function d(e){const r=n.useContext(s);return n.useMemo((function(){return"function"==typeof e?e(r):{...r,...e}}),[r,e])}function c(e){let r;return r=e.disableParentContext?"function"==typeof e.components?e.components(a):e.components||a:d(e.components),n.createElement(s.Provider,{value:r},e.children)}}}]);