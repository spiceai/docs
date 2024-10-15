"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[6789],{8716:(e,n,a)=>{a.r(n),a.d(n,{assets:()=>t,contentTitle:()=>c,default:()=>h,frontMatter:()=>i,metadata:()=>l,toc:()=>o});var s=a(4848),r=a(8453);const i={title:"search",sidebar_label:"search",pagination_prev:null,pagination_next:null},c=void 0,l={id:"cli/reference/search",title:"search",description:"Performs embeddings-based searches across search configured datasets. Note: Search requires the ai feature to be installed.",source:"@site/docs/cli/reference/search.md",sourceDirName:"cli/reference",slug:"/cli/reference/search",permalink:"/cli/reference/search",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/cli/reference/search.md",tags:[],version:"current",frontMatter:{title:"search",sidebar_label:"search",pagination_prev:null,pagination_next:null},sidebar:"docsSidebar"},t={},o=[{value:"Usage",id:"usage",level:3},{value:"Flags",id:"flags",level:4},{value:"Examples",id:"examples",level:3},{value:"Additional Example",id:"additional-example",level:3}];function d(e){const n={a:"a",code:"code",h3:"h3",h4:"h4",li:"li",p:"p",pre:"pre",ul:"ul",...(0,r.R)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsxs)(n.p,{children:["Performs embeddings-based searches across search configured datasets. Note: Search requires the ",(0,s.jsx)(n.code,{children:"ai"})," feature to be installed."]}),"\n",(0,s.jsx)(n.h3,{id:"usage",children:"Usage"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-shell",children:"spice search [query] [flags]\n"})}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"query"})," - a search query"]}),"\n",(0,s.jsx)(n.h4,{id:"flags",children:"Flags"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"--cloud"}),"  Whether to use cloud instance for search (default: false)"]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"--limit"}),"  Limit number of search results"]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"--model"}),"  Model to use for search"]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"--http-endpoint"}),"  HTTP endpoint for search (default: ",(0,s.jsx)(n.a,{href:"http://localhost:8090",children:"http://localhost:8090"}),")."]}),"\n"]}),"\n",(0,s.jsx)(n.h3,{id:"examples",children:"Examples"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-shell",children:">>> spice search --limit 2\n"})}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-shell",children:"search> artificial intelligence\n\n\nRank 1, Score: 20.6, Datasets [pdf]\nUndergraduate Texts in Mathematics Editors: F. W. Gehring P. R.\nHalmos \xb7\nAdvisory Board: C. DePrima\nI. Herstein J. Kiefer W. LeVeque Kai Lai Chung\nElementary Probability\nTheory with Stochastic Processes Springer Science+Business Media, LLC\n...\n\nRank 2, Score: 17.8, Datasets [pdf]\nForecasting at Scale Sean J. Taylor  y Facebook, Menlo Park, California, United States sjt@fb.com and Benjamin Letham y Facebook, Menlo Park, California, United States bletham@fb.com Abstract Forecasting is a common data science...\n"})}),"\n",(0,s.jsx)(n.h3,{id:"additional-example",children:"Additional Example"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-shell",children:">>> spice search --model gpt-3 --limit 1\n"})}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-shell",children:"search> machine learning\n\n\nRank 1, Score: 25.4, Datasets [pdf]\nMachine Learning Yearning by Andrew Ng\nMachine Learning Yearning is a technical book by Andrew Ng that provides practical advice on how to structure machine learning projects.\n...\n"})})]})}function h(e={}){const{wrapper:n}={...(0,r.R)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(d,{...e})}):d(e)}},8453:(e,n,a)=>{a.d(n,{R:()=>c,x:()=>l});var s=a(6540);const r={},i=s.createContext(r);function c(e){const n=s.useContext(i);return s.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function l(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:c(e.components),s.createElement(i.Provider,{value:n},e.children)}}}]);