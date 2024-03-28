"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[4287],{9088:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>l,contentTitle:()=>o,default:()=>p,frontMatter:()=>s,metadata:()=>r,toc:()=>d});var i=t(4848),a=t(8453);const s={title:"Data Ingestion",sidebar_label:"Data Ingestion",description:"",sidebar_position:4,pagination_prev:null,pagination_next:null},o=void 0,r={id:"data-ingestion/index",title:"Data Ingestion",description:"",source:"@site/docs/data-ingestion/index.md",sourceDirName:"data-ingestion",slug:"/data-ingestion/",permalink:"/data-ingestion/",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/data-ingestion/index.md",tags:[],version:"current",sidebarPosition:4,frontMatter:{title:"Data Ingestion",sidebar_label:"Data Ingestion",description:"",sidebar_position:4,pagination_prev:null,pagination_next:null},sidebar:"tutorialSidebar"},l={},d=[{value:"Benefits",id:"benefits",level:2},{value:"Considerations",id:"considerations",level:2},{value:"Example",id:"example",level:2},{value:"Disk SMART",id:"disk-smart",level:3},{value:"Limitations",id:"limitations",level:2}];function c(e){const n={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",ul:"ul",...(0,a.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(n.p,{children:"Data can be ingested by the Spice runtime for replication to a Data Connector, like PostgreSQL or the Spice.ai Cloud platform."}),"\n",(0,i.jsxs)(n.p,{children:["By default, the runtime exposes an ",(0,i.jsx)(n.a,{href:"https://opentelemetry.io",children:"OpenTelemety"})," (OTEL) endpoint at grpc://127.0.0.1:50052 for data ingestion."]}),"\n",(0,i.jsx)(n.p,{children:"OTEL metrics will be inserted into datasets with matching names (metric name = dataset name) and optionally replicated to the dataset source."}),"\n",(0,i.jsx)(n.h2,{id:"benefits",children:"Benefits"}),"\n",(0,i.jsx)(n.p,{children:"Spice.ai OSS incorporates built-in data ingestion support, enabling the collection of the latest data from edge nodes for use in subsequent queries. This capability avoids the need for additional ETL pipelines, while also enhancing the speed of the feedback loop."}),"\n",(0,i.jsx)(n.p,{children:"As an example, consider CPU usage anomaly detection. When CPU metrics are sent to the Spice OpenTelemetry endpoint, the loaded machine learning model can utilize the most recent observations for inferencing and provide recommendations to the edge node. This process occurs rapidly on the edge itself, within milliseconds and without generating network traffic."}),"\n",(0,i.jsx)(n.p,{children:"Additional, Spice will replicate the data periodically to the data connector for further usage."}),"\n",(0,i.jsx)(n.h2,{id:"considerations",children:"Considerations"}),"\n",(0,i.jsx)(n.p,{children:"Data Quality: Leverage Spice SQL capabilities to transform and cleanse ingested edge data, ensuring high-quality inputs."}),"\n",(0,i.jsx)(n.p,{children:"Data Security: Assess data sensitivity and secure network connections between edge and data connector when replicating data for further usage. Implement encryption, access controls, and secure protocols."}),"\n",(0,i.jsx)(n.h2,{id:"example",children:"Example"}),"\n",(0,i.jsx)(n.h3,{id:"disk-smart",children:(0,i.jsx)(n.a,{href:"https://en.wikipedia.org/wiki/Self-Monitoring,_Analysis_and_Reporting_Technology",children:"Disk SMART"})}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:"Start Spice with the following dataset:"}),"\n"]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-yaml",children:"datasets:\n  - from: spice.ai/coolorg/smart/datasets/drive_stats\n    name: smart_attribute_raw_value\n    mode: read_write\n    replication:\n      enabled: true\n    acceleration:\n      enabled: true\n"})}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:"Start telegraf with the following config:"}),"\n"]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{children:'[[inputs.smart]]\n  attributes = true\n[[outputs.opentelemetry]]\n  service_address = "localhost:50052"\n[agent]\n  interval = "1s"\n  flush_interval = "1s"\n'})}),"\n",(0,i.jsxs)(n.p,{children:["SMART data will be available in the ",(0,i.jsx)(n.code,{children:"smart_attribute_raw_value"})," dataset in Spice.ai OSS and replicated to the ",(0,i.jsx)(n.code,{children:"coolorg.smart.drive_stats"})," dataset in Spice.ai Cloud."]}),"\n",(0,i.jsx)(n.h2,{id:"limitations",children:"Limitations"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:"Only Spice.ai replication is supported for now."}),"\n"]})]})}function p(e={}){const{wrapper:n}={...(0,a.R)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(c,{...e})}):c(e)}},8453:(e,n,t)=>{t.d(n,{R:()=>o,x:()=>r});var i=t(6540);const a={},s=i.createContext(a);function o(e){const n=i.useContext(s);return i.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function r(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(a):e.components||a:o(e.components),i.createElement(s.Provider,{value:n},e.children)}}}]);