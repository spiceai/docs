"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[6909],{7796:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>i,contentTitle:()=>s,default:()=>h,frontMatter:()=>r,metadata:()=>c,toc:()=>l});var o=n(4848),a=n(8453);const r={title:"FlightSQL Data Connector",sidebar_label:"FlightSql Data Connector",description:"FlightSQL Data Connector Documentation"},s=void 0,c={id:"data-connectors/flightsql",title:"FlightSQL Data Connector",description:"FlightSQL Data Connector Documentation",source:"@site/docs/data-connectors/flightsql.md",sourceDirName:"data-connectors",slug:"/data-connectors/flightsql",permalink:"/data-connectors/flightsql",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/data-connectors/flightsql.md",tags:[],version:"current",frontMatter:{title:"FlightSQL Data Connector",sidebar_label:"FlightSql Data Connector",description:"FlightSQL Data Connector Documentation"},sidebar:"tutorialSidebar",previous:{title:"Dremio Data Connector",permalink:"/data-connectors/dremio"},next:{title:"PostgreSQL Data Connector",permalink:"/data-connectors/postgres/"}},i={},l=[{value:"<code>params</code>",id:"params",level:2},{value:"<code>auth</code>",id:"auth",level:2},{value:"Example",id:"example",level:2}];function d(e){const t={a:"a",code:"code",h2:"h2",li:"li",p:"p",pre:"pre",ul:"ul",...(0,a.R)(),...e.components};return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(t.p,{children:"Connect to any FlightSQL compatible server (e.g. Influx 3.0, CnosDB, other Spice runtimes!) as a connector for federated SQL queries."}),"\n",(0,o.jsx)(t.h2,{id:"params",children:(0,o.jsx)(t.code,{children:"params"})}),"\n",(0,o.jsxs)(t.ul,{children:["\n",(0,o.jsxs)(t.li,{children:[(0,o.jsx)(t.code,{children:"endpoint"}),": The Apache Flight endpoint used to connect to the FlightSQL server."]}),"\n"]}),"\n",(0,o.jsx)(t.h2,{id:"auth",children:(0,o.jsx)(t.code,{children:"auth"})}),"\n",(0,o.jsxs)(t.p,{children:["Check ",(0,o.jsx)(t.a,{href:"/secret-stores",children:"Secrets Stores"})," for details on how to configure."]}),"\n",(0,o.jsx)(t.p,{children:"Attributes:"}),"\n",(0,o.jsxs)(t.ul,{children:["\n",(0,o.jsxs)(t.li,{children:[(0,o.jsx)(t.code,{children:"username"})," (optional): The username to use in the underlying Apache flight Handshake Request to authenticate to the server (see ",(0,o.jsx)(t.a,{href:"https://arrow.apache.org/docs/format/Flight.html#authentication",children:"reference"}),")."]}),"\n",(0,o.jsxs)(t.li,{children:[(0,o.jsx)(t.code,{children:"password"})," (optional): The password to use in the underlying Apache flight Handshake Request to authenticate to the server (see ",(0,o.jsx)(t.a,{href:"https://arrow.apache.org/docs/format/Flight.html#authentication",children:"reference"}),")."]}),"\n"]}),"\n",(0,o.jsx)(t.h2,{id:"example",children:"Example"}),"\n",(0,o.jsx)(t.pre,{children:(0,o.jsx)(t.code,{className:"language-yaml",children:"- from: flightsql:my_catalog.good_schemas.cool_dataset\n  name: cool_dataset\n  params:\n    endpoint: http://127.0.0.1:50051 \n"})})]})}function h(e={}){const{wrapper:t}={...(0,a.R)(),...e.components};return t?(0,o.jsx)(t,{...e,children:(0,o.jsx)(d,{...e})}):d(e)}},8453:(e,t,n)=>{n.d(t,{R:()=>s,x:()=>c});var o=n(6540);const a={},r=o.createContext(a);function s(e){const t=o.useContext(r);return o.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function c(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(a):e.components||a:s(e.components),o.createElement(r.Provider,{value:t},e.children)}}}]);