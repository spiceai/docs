"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[2254],{9761:(e,t,i)=>{i.r(t),i.d(t,{assets:()=>o,contentTitle:()=>a,default:()=>h,frontMatter:()=>c,metadata:()=>l,toc:()=>d});var n=i(4848),s=i(8453),r=i(3514);const c={title:"Getting started with Spice.ai OSS",sidebar_label:"Getting started",sidebar_position:1,description:"Get started with Spice in 5 minutes",pagination_next:null},a=void 0,l={id:"getting-started/index",title:"Getting started with Spice.ai OSS",description:"Get started with Spice in 5 minutes",source:"@site/docs/getting-started/index.md",sourceDirName:"getting-started",slug:"/getting-started/",permalink:"/getting-started/",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/getting-started/index.md",tags:[],version:"current",sidebarPosition:1,frontMatter:{title:"Getting started with Spice.ai OSS",sidebar_label:"Getting started",sidebar_position:1,description:"Get started with Spice in 5 minutes",pagination_next:null},sidebar:"docsSidebar",previous:{title:"Home",permalink:"/"}},o={},d=[{value:"Follow these steps to get started with Spice.",id:"follow-these-steps-to-get-started-with-spice",level:3},{value:"Next Steps",id:"next-steps",level:2}];function p(e){const t={code:"code",h2:"h2",h3:"h3",p:"p",pre:"pre",strong:"strong",...(0,s.R)(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)("div",{className:"video-container",children:(0,n.jsx)("iframe",{width:"560",height:"420",src:"https://www.youtube.com/embed/AZyrecVWnEs?si=2s_2jLTJlUdgItyC",title:"YouTube video player",frameborder:"0",allow:"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",referrerpolicy:"strict-origin-when-cross-origin",allowfullscreen:!0})}),"\n",(0,n.jsx)(t.h3,{id:"follow-these-steps-to-get-started-with-spice",children:"Follow these steps to get started with Spice."}),"\n",(0,n.jsxs)(t.p,{children:[(0,n.jsx)(t.strong,{children:"Step 1."})," Install the Spice CLI:"]}),"\n",(0,n.jsx)(t.pre,{children:(0,n.jsx)(t.code,{className:"language-bash",children:"curl https://install.spiceai.org | /bin/bash\n"})}),"\n",(0,n.jsxs)(t.p,{children:["Or using ",(0,n.jsx)(t.code,{children:"brew"}),":"]}),"\n",(0,n.jsx)(t.pre,{children:(0,n.jsx)(t.code,{className:"language-bash",children:"brew install spiceai/spiceai/spice\n"})}),"\n",(0,n.jsxs)(t.p,{children:[(0,n.jsx)(t.strong,{children:"Step 2."})," Initialize a new Spice app with the ",(0,n.jsx)(t.code,{children:"spice init"})," command:"]}),"\n",(0,n.jsx)(t.pre,{children:(0,n.jsx)(t.code,{className:"language-bash",children:"spice init spice_qs\n"})}),"\n",(0,n.jsxs)(t.p,{children:["A ",(0,n.jsx)(t.code,{children:"spicepod.yaml"})," file is created in the ",(0,n.jsx)(t.code,{children:"spice_qs"})," directory. Change to that directory:"]}),"\n",(0,n.jsx)(t.pre,{children:(0,n.jsx)(t.code,{className:"language-bash",children:"cd spice_qs\n"})}),"\n",(0,n.jsxs)(t.p,{children:[(0,n.jsx)(t.strong,{children:"Step 3."})," Connect to the sample Dremio instance to access the sample data:"]}),"\n",(0,n.jsx)(t.pre,{children:(0,n.jsx)(t.code,{className:"language-bash",children:"spice login dremio -u demo -p demo1234\n"})}),"\n",(0,n.jsxs)(t.p,{children:[(0,n.jsx)(t.strong,{children:"Step 4."})," Start the Spice runtime:"]}),"\n",(0,n.jsx)(t.pre,{children:(0,n.jsx)(t.code,{className:"language-bash",children:"spice run\n"})}),"\n",(0,n.jsx)(t.p,{children:"Example output will be shown as follows:"}),"\n",(0,n.jsx)(t.pre,{children:(0,n.jsx)(t.code,{className:"language-bash",children:"Spice.ai runtime starting...\nUsing latest 'local' runtime version.\n2024-02-21T06:11:56.381793Z  INFO runtime::http: Spice Runtime HTTP listening on 127.0.0.1:3000\n2024-02-21T06:11:56.381853Z  INFO runtime::flight: Spice Runtime Flight listening on 127.0.0.1:50051\n2024-02-21T06:11:56.382038Z  INFO runtime::opentelemetry: Spice Runtime OpenTelemetry listening on 127.0.0.1:50052\n"})}),"\n",(0,n.jsx)(t.p,{children:"The runtime is now started and ready for queries."}),"\n",(0,n.jsxs)(t.p,{children:[(0,n.jsx)(t.strong,{children:"Step 5."})," In a new terminal window, add the ",(0,n.jsx)(t.code,{children:"spiceai/quickstart"})," Spicepod. A Spicepod is a package of configuration defining datasets and ML models."]}),"\n",(0,n.jsx)(t.pre,{children:(0,n.jsx)(t.code,{className:"language-bash",children:"spice add spiceai/quickstart\n"})}),"\n",(0,n.jsxs)(t.p,{children:["The ",(0,n.jsx)(t.code,{children:"spicepod.yaml"})," file will be updated with the ",(0,n.jsx)(t.code,{children:"spiceai/quickstart"})," dependency."]}),"\n",(0,n.jsx)(t.pre,{children:(0,n.jsx)(t.code,{className:"language-yaml",children:"version: v1beta1\nkind: Spicepod\nname: PROJECT_NAME\ndependencies:\n  - spiceai/quickstart\n"})}),"\n",(0,n.jsxs)(t.p,{children:["The ",(0,n.jsx)(t.code,{children:"spiceai/quickstart"})," Spicepod will add a ",(0,n.jsx)(t.code,{children:"taxi_trips"})," data table to the runtime which is now available to query by SQL."]}),"\n",(0,n.jsx)(t.pre,{children:(0,n.jsx)(t.code,{className:"language-bash",children:"2024-02-22T05:53:48.222952Z  INFO runtime: Loaded dataset: taxi_trips\n2024-02-22T05:53:48.223101Z  INFO runtime::dataconnector: Refreshing data for taxi_trips\n"})}),"\n",(0,n.jsxs)(t.p,{children:[(0,n.jsx)(t.strong,{children:"Step 6."})," Start the Spice SQL REPL:"]}),"\n",(0,n.jsx)(t.pre,{children:(0,n.jsx)(t.code,{className:"language-bash",children:"spice sql\n"})}),"\n",(0,n.jsx)(t.p,{children:"The SQL REPL inferface will be shown:"}),"\n",(0,n.jsx)(t.pre,{children:(0,n.jsx)(t.code,{children:"Welcome to the interactive Spice.ai SQL Query Utility! Type 'help' for help.\n\nshow tables; -- list available tables\nsql>\n"})}),"\n",(0,n.jsxs)(t.p,{children:["Enter ",(0,n.jsx)(t.code,{children:"show tables;"})," to display the available tables for query:"]}),"\n",(0,n.jsx)(t.pre,{children:(0,n.jsx)(t.code,{children:"sql> show tables;\n\n+---------------+--------------------+-------------+------------+\n| table_catalog | table_schema       | table_name  | table_type |\n+---------------+--------------------+-------------+------------+\n| datafusion    | public             | taxi_trips  | BASE TABLE |\n| datafusion    | information_schema | tables      | VIEW       |\n| datafusion    | information_schema | views       | VIEW       |\n| datafusion    | information_schema | columns     | VIEW       |\n| datafusion    | information_schema | df_settings | VIEW       |\n+---------------+--------------------+-------------+------------+\n\nQuery took: 0.004728897 seconds\n"})}),"\n",(0,n.jsx)(t.p,{children:"Enter a query to display the longest taxi trips:"}),"\n",(0,n.jsx)(t.pre,{children:(0,n.jsx)(t.code,{children:"sql> SELECT trip_distance_mi, total_amount FROM taxi_trips ORDER BY trip_distance_mi DESC LIMIT 10;\n"})}),"\n",(0,n.jsx)(t.p,{children:"Output:"}),"\n",(0,n.jsx)(t.pre,{children:(0,n.jsx)(t.code,{children:"+------------------+--------------+\n| trip_distance_mi | total_amount |\n+------------------+--------------+\n| 191.9            | 3.0          |\n| 189.2            | 63.0         |\n| 163.8            | 93.64        |\n| 122.4            | 160.0        |\n| 104.0            | 3.0          |\n| 69.7             | 213.58       |\n| 64.8             | 280.83       |\n| 60.0             | 350.12       |\n| 53.9             | 0.0          |\n| 53.3             | 5.33         |\n+------------------+--------------+\n\nQuery took: 0.002458976 seconds\n"})}),"\n",(0,n.jsx)(t.h2,{id:"next-steps",children:"Next Steps"}),"\n","\n","\n",(0,n.jsx)(r.A,{items:[{type:"link",label:"Quickstarts",href:"https://github.com/spiceai/quickstarts",description:"Spice.ai Quickstart Tutorials."},{type:"link",label:"Samples",href:"https://github.com/spiceai/samples",description:"Dive deeper with in-depth samples."}]})]})}function h(e={}){const{wrapper:t}={...(0,s.R)(),...e.components};return t?(0,n.jsx)(t,{...e,children:(0,n.jsx)(p,{...e})}):p(e)}},3514:(e,t,i)=>{i.d(t,{A:()=>j});i(6540);var n=i(4164),s=i(4142),r=i(8774),c=i(6654),a=i(1312),l=i(1107);const o={cardContainer:"cardContainer_fWXF",cardTitle:"cardTitle_rnsV",cardDescription:"cardDescription_PWke"};var d=i(4848);function p(e){let{href:t,children:i}=e;return(0,d.jsx)(r.A,{href:t,className:(0,n.A)("card padding--lg",o.cardContainer),children:i})}function h(e){let{href:t,icon:i,title:s,description:r}=e;return(0,d.jsxs)(p,{href:t,children:[(0,d.jsxs)(l.A,{as:"h2",className:(0,n.A)("text--truncate",o.cardTitle),title:s,children:[i," ",s]}),r&&(0,d.jsx)("p",{className:(0,n.A)("text--truncate",o.cardDescription),title:r,children:r})]})}function u(e){let{item:t}=e;const i=(0,s.Nr)(t);return i?(0,d.jsx)(h,{href:i,icon:"\ud83d\uddc3\ufe0f",title:t.label,description:t.description??(0,a.T)({message:"{count} items",id:"theme.docs.DocCard.categoryDescription",description:"The default description for a category card in the generated index about how many items this category includes"},{count:t.items.length})}):null}function m(e){let{item:t}=e;const i=(0,c.A)(t.href)?"\ud83d\udcc4\ufe0f":"\ud83d\udd17",n=(0,s.cC)(t.docId??void 0);return(0,d.jsx)(h,{href:t.href,icon:i,title:t.label,description:t.description??n?.description})}function x(e){let{item:t}=e;switch(t.type){case"link":return(0,d.jsx)(m,{item:t});case"category":return(0,d.jsx)(u,{item:t});default:throw new Error(`unknown item type ${JSON.stringify(t)}`)}}function g(e){let{className:t}=e;const i=(0,s.$S)();return(0,d.jsx)(j,{items:i.items,className:t})}function j(e){const{items:t,className:i}=e;if(!t)return(0,d.jsx)(g,{...e});const r=(0,s.d1)(t);return(0,d.jsx)("section",{className:(0,n.A)("row",i),children:r.map(((e,t)=>(0,d.jsx)("article",{className:"col col--6 margin-bottom--lg",children:(0,d.jsx)(x,{item:e})},t)))})}},8453:(e,t,i)=>{i.d(t,{R:()=>c,x:()=>a});var n=i(6540);const s={},r=n.createContext(s);function c(e){const t=n.useContext(r);return n.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function a(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:c(e.components),n.createElement(r.Provider,{value:t},e.children)}}}]);