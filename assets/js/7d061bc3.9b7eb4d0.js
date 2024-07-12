"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[2207],{5694:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>o,contentTitle:()=>c,default:()=>h,frontMatter:()=>i,metadata:()=>r,toc:()=>d});var s=n(4848),a=n(8453);const i={title:"Community Data",sidebar_label:"Community Data",sidebar_position:2,description:"Connect to the Spice.ai Cloud Platform to access community datasets.",pagination_next:null},c=void 0,r={id:"getting-started/spiceai",title:"Community Data",description:"Connect to the Spice.ai Cloud Platform to access community datasets.",source:"@site/docs/getting-started/spiceai.md",sourceDirName:"getting-started",slug:"/getting-started/spiceai",permalink:"/getting-started/spiceai",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/getting-started/spiceai.md",tags:[],version:"current",sidebarPosition:2,frontMatter:{title:"Community Data",sidebar_label:"Community Data",sidebar_position:2,description:"Connect to the Spice.ai Cloud Platform to access community datasets.",pagination_next:null},sidebar:"docsSidebar",previous:{title:"Spicepods",permalink:"/getting-started/spicepods"}},o={},d=[{value:"Quickstart",id:"quickstart",level:2}];function l(e){const t={a:"a",code:"code",h2:"h2",img:"img",p:"p",pre:"pre",strong:"strong",...(0,a.R)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsxs)(t.p,{children:["The ",(0,s.jsx)(t.a,{href:"https://docs.spice.ai",children:"Spice.ai Cloud Platform"})," includes a comprehensive set of free, ready-to-query ",(0,s.jsx)(t.a,{href:"https://docs.spice.ai/building-blocks/datasets",children:"sample and blockchain datasets"}),"."]}),"\n",(0,s.jsxs)(t.p,{children:["The Spice runtime can query these datasets using the ",(0,s.jsx)(t.a,{href:"/components/data-connectors/spiceai",children:"Spice.ai Data Connector"}),"."]}),"\n",(0,s.jsx)(t.h2,{id:"quickstart",children:"Quickstart"}),"\n",(0,s.jsxs)(t.p,{children:["To access these community datasets, navigate to ",(0,s.jsx)(t.a,{href:"https://spice.ai/",children:"spice.ai"}),", and create a new account by clicking Try for Free."]}),"\n",(0,s.jsx)("img",{width:"500",alt:"spiceai_try_for_free-1",src:"https://github.com/spiceai/spiceai/assets/112157037/27fb47ed-4825-4fa8-94bd-48197406cfaa"}),"\n",(0,s.jsx)(t.p,{children:"After logging in, create an app in order to get an API key."}),"\n",(0,s.jsx)(t.p,{children:(0,s.jsx)(t.img,{src:"https://github.com/spiceai/spiceai/assets/112157037/d2446406-1f06-40fb-8373-1b6d692cb5f7",alt:"create_app-1"})}),"\n",(0,s.jsxs)(t.p,{children:["This quickstart will use the ",(0,s.jsx)(t.a,{href:"https://docs.spice.ai/reference/sql-query-tables/ethereum/core-tables",children:(0,s.jsx)(t.code,{children:"eth.recent_blocks"})})," dataset."]}),"\n",(0,s.jsxs)(t.p,{children:[(0,s.jsx)(t.strong,{children:"Step 1."})," Log in to the Spice Cloud Platform from the command line using the ",(0,s.jsx)(t.code,{children:"spice login"})," command. A pop up browser window will prompt you to authenticate:"]}),"\n",(0,s.jsx)(t.pre,{children:(0,s.jsx)(t.code,{className:"language-bash",children:"spice login\n"})}),"\n",(0,s.jsxs)(t.p,{children:[(0,s.jsx)(t.strong,{children:"Step 2."})," Initialize a new project and start the runtime:"]}),"\n",(0,s.jsx)(t.pre,{children:(0,s.jsx)(t.code,{className:"language-bash",children:"# Initialize a new Spice app\nspice init spice_app\n\n# Change to app directory\ncd spice_app\n\n# Start the runtime\nspice run\n"})}),"\n",(0,s.jsxs)(t.p,{children:[(0,s.jsx)(t.strong,{children:"Step 3."})," Configure the dataset:"]}),"\n",(0,s.jsxs)(t.p,{children:["In a new terminal window, configure a new dataset using the ",(0,s.jsx)(t.code,{children:"spice dataset configure"})," command:"]}),"\n",(0,s.jsx)(t.pre,{children:(0,s.jsx)(t.code,{className:"language-bash",children:"spice dataset configure\n"})}),"\n",(0,s.jsx)(t.p,{children:"Enter a dataset name that will be used to reference the dataset in queries. This name does not need to match the name in the dataset source."}),"\n",(0,s.jsx)(t.pre,{children:(0,s.jsx)(t.code,{className:"language-bash",children:"dataset name: (spice_app) eth_recent_blocks\n"})}),"\n",(0,s.jsx)(t.p,{children:"Enter the description of the dataset:"}),"\n",(0,s.jsx)(t.pre,{children:(0,s.jsx)(t.code,{children:"description: Recent Ethereum blocks\n"})}),"\n",(0,s.jsx)(t.p,{children:"Enter the location of the dataset:"}),"\n",(0,s.jsx)(t.pre,{children:(0,s.jsx)(t.code,{className:"language-bash",children:"from: spice.ai/eth.recent_blocks\n"})}),"\n",(0,s.jsxs)(t.p,{children:["Select ",(0,s.jsx)(t.code,{children:"y"})," when prompted whether to accelerate the data:"]}),"\n",(0,s.jsx)(t.pre,{children:(0,s.jsx)(t.code,{className:"language-bash",children:"Locally accelerate (y/n)? y\n"})}),"\n",(0,s.jsx)(t.p,{children:"You should see the following output from your runtime terminal:"}),"\n",(0,s.jsx)(t.pre,{children:(0,s.jsx)(t.code,{className:"language-bash",children:"2024-05-20T22:50:17.997446Z  INFO runtime: Registered dataset eth_recent_blocks\n2024-05-20T22:50:17.998125Z  INFO runtime::accelerated_table::refresh: Loading data for dataset eth_recent_blocks\n"})}),"\n",(0,s.jsxs)(t.p,{children:[(0,s.jsx)(t.strong,{children:"Step 4."})," In a new terminal window, use the Spice SQL REPL to query the dataset"]}),"\n",(0,s.jsx)(t.pre,{children:(0,s.jsx)(t.code,{className:"language-bash",children:"spice sql\n"})}),"\n",(0,s.jsx)(t.pre,{children:(0,s.jsx)(t.code,{className:"language-bash",children:"SELECT number, size, gas_used from eth_recent_blocks LIMIT 10;\n"})}),"\n",(0,s.jsx)(t.p,{children:"The output displays the results of the query along with the query execution time:"}),"\n",(0,s.jsx)(t.pre,{children:(0,s.jsx)(t.code,{className:"language-bash",children:"+----------+--------+----------+\n| number   | size   | gas_used |\n+----------+--------+----------+\n| 19281345 | 400378 | 16150051 |\n| 19281344 | 200501 | 16480224 |\n| 19281343 | 97758  | 12605531 |\n| 19281342 | 89629  | 12035385 |\n| 19281341 | 133649 | 13335719 |\n| 19281340 | 307584 | 18389159 |\n| 19281339 | 89233  | 13391332 |\n| 19281338 | 75250  | 12806684 |\n| 19281337 | 100721 | 11823522 |\n| 19281336 | 150137 | 13418403 |\n+----------+--------+----------+\n\nQuery took: 0.004057791 seconds\n"})}),"\n",(0,s.jsxs)(t.p,{children:["You can experiment with the time it takes to generate queries when using non-accelerated datasets. You can change the acceleration setting from ",(0,s.jsx)(t.code,{children:"true"})," to ",(0,s.jsx)(t.code,{children:"false"})," in the datasets.yaml file."]})]})}function h(e={}){const{wrapper:t}={...(0,a.R)(),...e.components};return t?(0,s.jsx)(t,{...e,children:(0,s.jsx)(l,{...e})}):l(e)}},8453:(e,t,n)=>{n.d(t,{R:()=>c,x:()=>r});var s=n(6540);const a={},i=s.createContext(a);function c(e){const t=s.useContext(i);return s.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function r(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(a):e.components||a:c(e.components),s.createElement(i.Provider,{value:t},e.children)}}}]);