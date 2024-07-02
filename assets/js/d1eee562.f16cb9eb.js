"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[9454],{9682:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>c,contentTitle:()=>r,default:()=>h,frontMatter:()=>s,metadata:()=>o,toc:()=>d});var n=a(4848),i=a(8453);const s={title:"Change Data Capture (CDC)",sidebar_label:"Change Data Capture",description:"Learn how to use Change Data Capture (CDC) in Spice.",sidebar_position:6,pagination_prev:null,pagination_next:null},r=void 0,o={id:"features/cdc/index",title:"Change Data Capture (CDC)",description:"Learn how to use Change Data Capture (CDC) in Spice.",source:"@site/docs/features/cdc/index.md",sourceDirName:"features/cdc",slug:"/features/cdc/",permalink:"/features/cdc/",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/features/cdc/index.md",tags:[],version:"current",sidebarPosition:6,frontMatter:{title:"Change Data Capture (CDC)",sidebar_label:"Change Data Capture",description:"Learn how to use Change Data Capture (CDC) in Spice.",sidebar_position:6,pagination_prev:null,pagination_next:null},sidebar:"docsSidebar"},c={},d=[{value:"Benefits",id:"benefits",level:2},{value:"Example Use Case",id:"example-use-case",level:2},{value:"Considerations",id:"considerations",level:2},{value:"Supported Data Connectors",id:"supported-data-connectors",level:2},{value:"Example",id:"example",level:2}];function l(e){const t={a:"a",code:"code",h2:"h2",p:"p",...(0,i.R)(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsxs)(t.p,{children:["Change Data Capture (CDC) is a technique to capture changed rows from a database's transaction log and deliver to consumers with low latency. Leveraging this technique allows Spice to keep ",(0,n.jsx)(t.a,{href:"/features/local-acceleration/",children:"locally accelerated"})," datasets up-to-date in real-time with the source data, and is highly efficient by only transferring the changed rows instead of re-fetching the entire dataset on refresh."]}),"\n",(0,n.jsx)(t.h2,{id:"benefits",children:"Benefits"}),"\n",(0,n.jsx)(t.p,{children:"Leveraging locally-accelerated datasets configured with CDC allows Spice to provide a solution that combines both high-performance accelerated queries with efficient real-time delta updates."}),"\n",(0,n.jsx)(t.h2,{id:"example-use-case",children:"Example Use Case"}),"\n",(0,n.jsx)(t.p,{children:"Consider a fraud-detection application that needs to determine if a pending transaction is likely fraudulent. The application queries a Spice-accelerated real-time updated table of recent transactions to check if a pending transaction resembles known fraudulent ones. Using CDC, the table is kept up-to-date, allowing the application to quickly identify potential fraud."}),"\n",(0,n.jsx)(t.h2,{id:"considerations",children:"Considerations"}),"\n",(0,n.jsxs)(t.p,{children:["When configuring datasets to be accelerated with CDC, ensure that the data connector supports CDC and can return a stream of row-level changes. See the ",(0,n.jsx)(t.a,{href:"#supported-data-connectors",children:"Supported Data Connectors"})," section for more information."]}),"\n",(0,n.jsx)(t.p,{children:"Startup time for CDC-accelerated datasets may be longer than non-CDC-accelerated datasets due to the initial synchronization of the dataset."}),"\n",(0,n.jsxs)(t.p,{children:["It's recommended to use CDC-accelerated datasets with persistent data accelerator configurations (i.e. ",(0,n.jsx)(t.code,{children:"file"})," mode for ",(0,n.jsx)(t.a,{href:"/data-accelerators/duckdb",children:(0,n.jsx)(t.code,{children:"DuckDB"})}),"/",(0,n.jsx)(t.a,{href:"/data-accelerators/sqlite",children:(0,n.jsx)(t.code,{children:"Sqlite"})})," or ",(0,n.jsx)(t.a,{href:"/data-accelerators/postgres/",children:(0,n.jsx)(t.code,{children:"PostgreSQL"})}),"). This ensures that when Spice restarts, it can resume from the last known state of the dataset instead of re-fetching the entire dataset."]}),"\n",(0,n.jsx)(t.h2,{id:"supported-data-connectors",children:"Supported Data Connectors"}),"\n",(0,n.jsxs)(t.p,{children:["Enabling CDC via setting ",(0,n.jsx)(t.code,{children:"refresh_mode: changes"})," in the acceleration settings requires support from the data connector to provide a stream of row-level changes."]}),"\n",(0,n.jsxs)(t.p,{children:["Currently, the only supported data connector is ",(0,n.jsx)(t.a,{href:"/data-connectors/debezium",children:"Debezium"}),"."]}),"\n",(0,n.jsx)(t.h2,{id:"example",children:"Example"}),"\n",(0,n.jsxs)(t.p,{children:["See an example of configuring a dataset to use CDC with Debezium by following the sample at ",(0,n.jsx)(t.a,{href:"https://github.com/spiceai/samples/tree/trunk/cdc-debezium",children:"Streaming changes in real-time with Debezium CDC"}),"."]})]})}function h(e={}){const{wrapper:t}={...(0,i.R)(),...e.components};return t?(0,n.jsx)(t,{...e,children:(0,n.jsx)(l,{...e})}):l(e)}},8453:(e,t,a)=>{a.d(t,{R:()=>r,x:()=>o});var n=a(6540);const i={},s=n.createContext(i);function r(e){const t=n.useContext(s);return n.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function o(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:r(e.components),n.createElement(s.Provider,{value:t},e.children)}}}]);